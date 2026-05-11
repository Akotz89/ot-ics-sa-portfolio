import { PROFILES } from './profiles.js?v=engine-22';
import { auditLayoutCandidate, scaleMetrics } from './layoutAudit.js?v=engine-22';

const TEXT_RULES = {
  labelChar: 7.2,
  subChar: 5.8,
  iconAndPadding: 58,
  minHeight: 54,
  lineHeight: 12
};

export function computeLayout({ board, enclaves, nodes, annotations, links = [], steps = [], stage }) {
  const candidates = Object.keys(PROFILES)
    .map(profileName => buildCandidate({ profileName, board, enclaves, nodes, annotations, links, steps, stage }))
    .sort((a, b) => a.audit.score - b.audit.score);
  const winner = candidates.find(candidate => !candidate.audit.errors.length) || candidates[0];
  return {
    ...winner,
    candidates: candidates.map(candidate => ({
      profile: candidate.profile,
      score: Number(candidate.audit.score.toFixed(2)),
      errors: candidate.audit.errors.slice(0, 8),
      fit: candidate.fit
    }))
  };
}

export function buildCandidate({ profileName, board, enclaves, nodes, annotations, links, steps, stage }) {
  const profile = PROFILES[profileName];
  const template = profile.template;
  const placedEnclaves = placeEnclaves(enclaves, template);
  const enclaveMap = new Map(placedEnclaves.map(enclave => [enclave.id, enclave]));
  const placedNodes = resolveNodeCollisions(placeNodes(nodes, template, enclaveMap), template);
  const adjusted = repairVerticalBands(expandEnclaves(placedEnclaves, placedNodes, template), placedNodes, template);
  const adjustedEnclaves = expandEnclaves(adjusted.enclaves, adjusted.nodes, template);
  const legend = { id: 'legend', group: 'monitoring', ...template.annotations.legend };
  const placedAnnotations = placeAnnotations(annotations, template, adjusted.nodes, adjustedEnclaves, legend);
  const lanes = deriveLanes(template.lanes, adjustedEnclaves, adjusted.nodes);
  const solvedBoard = boardBounds({ ...profile }, [...adjustedEnclaves, ...adjusted.nodes, ...placedAnnotations, legend]);
  const candidate = {
    profile: profileName,
    board: { ...board, ...solvedBoard, minScale: profile.minScale, maxScale: profile.maxScale },
    enclaves: adjustedEnclaves,
    nodes: adjusted.nodes,
    annotations: placedAnnotations,
    legend,
    labelSlots: template.labelSlots,
    lanes,
    rules: template.rules,
    fit: scaleMetrics({ ...solvedBoard, minScale: profile.minScale, maxScale: profile.maxScale }, stage)
  };
  const audit = auditLayoutCandidate({ layout: candidate, links, steps });
  return { ...candidate, audit };
}

function placeEnclaves(enclaves, template) {
  return enclaves.map(enclave => ({ ...enclave, ...template.enclaves[enclave.id] }));
}

function placeNodes(nodes, template, enclaveMap) {
  return nodes.map(node => {
    const [enclaveId, offsetX, offsetY, w, h] = template.slots[node.id];
    const enclave = enclaveMap.get(enclaveId);
    const size = measureNode(node, w, h);
    return {
      ...node,
      group: enclaveId,
      x: enclave.x + offsetX,
      y: enclave.y + offsetY,
      w: size.w,
      h: size.h
    };
  });
}

function placeAnnotations(annotations, template, nodes, enclaves, legend) {
  const headers = enclaves.map(enclave => ({
    id: `${enclave.id}-header`,
    x: enclave.x,
    y: enclave.y,
    w: enclave.w,
    h: template.rules?.enclaveHeaderHeight || 56
  }));
  const borderBands = enclaves.flatMap(enclave => enclaveBorderBands(enclave, 16));
  const blockers = [...nodes, legend, ...headers, ...borderBands].filter(Boolean);
  return annotations.map(annotation => {
    const requested = { ...annotation, ...template.annotations[annotation.id] };
    return findClearAnnotation(requested, blockers);
  });
}

function expandEnclaves(enclaves, nodes, template) {
  return enclaves.map(enclave => {
    const children = nodes.filter(node => node.group === enclave.id);
    const requiredRight = Math.max(enclave.x + enclave.w, ...children.map(node => node.x + node.w + (template.rules?.enclaveInsetX || 14)));
    const requiredBottom = Math.max(enclave.y + enclave.h, ...children.map(node => node.y + node.h + 16));
    return {
      ...enclave,
      w: Math.min(template.board?.width || Infinity, Math.ceil(requiredRight - enclave.x)),
      h: Math.min(template.board?.height || Infinity, Math.ceil(requiredBottom - enclave.y))
    };
  });
}

function boardBounds(profile, items) {
  const margin = 18;
  return {
    width: Math.max(profile.width, Math.ceil(Math.max(...items.map(item => item.x + item.w)) + margin)),
    height: Math.max(profile.height, Math.ceil(Math.max(...items.map(item => item.y + item.h)) + margin))
  };
}

function resolveNodeCollisions(nodes, template) {
  const gap = template.rules?.minNodeGap || 18;
  const byGroup = new Map();
  nodes.forEach(node => {
    if (!byGroup.has(node.group)) byGroup.set(node.group, []);
    byGroup.get(node.group).push(node);
  });
  byGroup.forEach(groupNodes => {
    let changed = true;
    while (changed) {
      changed = false;
      const ordered = [...groupNodes].sort((a, b) => a.y - b.y || a.x - b.x);
      for (let i = 0; i < ordered.length; i += 1) {
        for (let j = i + 1; j < ordered.length; j += 1) {
          const upper = ordered[i];
          const lower = ordered[j];
          if (!rangesOverlap(upper.x, upper.x + upper.w, lower.x, lower.x + lower.w)) continue;
          const minY = upper.y + upper.h + gap;
          if (lower.y < minY) {
            lower.y = minY;
            changed = true;
          }
        }
      }
    }
  });
  return nodes;
}

function repairVerticalBands(enclaves, nodes, template) {
  const gap = Math.max(28, template.rules?.minNodeGap || 28);
  const nextEnclaves = enclaves.map(enclave => ({ ...enclave }));
  const nextNodes = nodes.map(node => ({ ...node }));
  const byId = new Map(nextEnclaves.map(enclave => [enclave.id, enclave]));

  moveGroupAfter('control', 'operations', gap, byId, nextNodes);
  moveGroupAfter('field', 'control', gap, byId, nextNodes);
  const monitoringFloor = Math.max(bottom(byId.get('enterprise')), bottom(byId.get('boundary'))) + gap;
  moveGroupTo('monitoring', monitoringFloor, byId, nextNodes);
  reserveGroupTopBand('monitoring', 104, byId, nextNodes);
  reserveGroupTopBand('field', 150, byId, nextNodes);

  return { enclaves: nextEnclaves, nodes: nextNodes };
}

function moveGroupAfter(group, previousGroup, gap, enclaveMap, nodes) {
  moveGroupTo(group, bottom(enclaveMap.get(previousGroup)) + gap, enclaveMap, nodes);
}

function moveGroupTo(group, targetY, enclaveMap, nodes) {
  const enclave = enclaveMap.get(group);
  if (!enclave || enclave.y >= targetY) return;
  const delta = Math.ceil(targetY - enclave.y);
  enclave.y += delta;
  nodes.filter(node => node.group === group).forEach(node => {
    node.y += delta;
  });
}

function reserveGroupTopBand(group, minOffsetY, enclaveMap, nodes) {
  const enclave = enclaveMap.get(group);
  if (!enclave) return;
  const groupNodes = nodes.filter(node => node.group === group);
  if (!groupNodes.length) return;
  const currentTop = Math.min(...groupNodes.map(node => node.y));
  const requiredTop = enclave.y + minOffsetY;
  if (currentTop >= requiredTop) return;
  const delta = Math.ceil(requiredTop - currentTop);
  groupNodes.forEach(node => {
    node.y += delta;
  });
}

function deriveLanes(templateLanes, enclaves, nodes) {
  const lanes = { ...templateLanes };
  const enclaveById = new Map(enclaves.map(enclave => [enclave.id, enclave]));
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  const enterprise = enclaveById.get('enterprise');
  const boundary = enclaveById.get('boundary');
  const control = enclaveById.get('control');
  const field = enclaveById.get('field');
  const monitoring = enclaveById.get('monitoring');
  const core = nodeById.get('core');
  const historian = nodeById.get('historian');
  const dist = nodeById.get('dist');
  const sensorBoundary = nodeById.get('sensorBoundary');
  const sensorControl = nodeById.get('sensorControl');
  const siteStore = nodeById.get('siteStore');

  if (enterprise) {
    lanes.enterpriseReturnX = Math.max(12, enterprise.x + 12);
    lanes.enterpriseReturnY = enterprise.y + enterprise.h - 32;
    lanes.socHandoffX = Math.max(10, enterprise.x - 16);
  }
  if (boundary) {
    lanes.boundaryEastX = boundary.x + boundary.w + 2;
    lanes.boundarySpanExitY = boundary.y + boundary.h + 16;
  }
  if (core && historian) {
    lanes.opsServiceX = Math.round((core.x + core.w + historian.x) / 2);
    lanes.opsServiceY = Math.max(core.y + core.h + 22, (lanes.opsServiceY || core.y + core.h + 22));
  }
  if (control && dist) {
    lanes.controlWestX = control.x - 22;
    lanes.controlDropX = lanes.opsServiceX || dist.x + dist.w + 34;
    lanes.controlBusY = Math.min(control.y + control.h - 24, dist.y + dist.h + 56);
  }
  if (field) {
    lanes.fieldBusY = field.y + 102;
    lanes.fieldLowBusY = field.y + 126;
    lanes.fieldExitX = lanes.controlWestX || field.x - 22;
  }
  if (monitoring) {
    lanes.boundarySpanY = sensorBoundary ? sensorBoundary.y - 14 : monitoring.y + 64;
    lanes.monitoringFeedY = Math.max(
      (sensorBoundary ? sensorBoundary.y + sensorBoundary.h : monitoring.y + 130) + 34,
      (sensorControl ? sensorControl.y + sensorControl.h : monitoring.y + 130) + 34
    );
    lanes.monitoringStoreX = siteStore ? siteStore.x - 26 : monitoring.x + monitoring.w - 150;
    lanes.monitoringSouthY = monitoring.y + monitoring.h - 44;
  }
  return lanes;
}

function findClearAnnotation(annotation, blockers) {
  const search = [{ x: annotation.x, y: annotation.y, score: 0 }];
  for (let radius = 24; radius <= 260; radius += 24) {
    for (let dx = -radius; dx <= radius; dx += 24) {
      for (let dy = -radius; dy <= radius; dy += 24) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        search.push({ x: annotation.x + dx, y: annotation.y + dy, score: Math.abs(dx) + Math.abs(dy) });
      }
    }
  }
  const clear = search
    .filter(candidate => candidate.x >= 0 && candidate.y >= 0)
    .sort((a, b) => a.score - b.score)
    .find(candidate => !blockers.some(blocker => rectsOverlap(inflate({ ...annotation, ...candidate }, 8), inflate(blocker, 8))));
  return { ...annotation, x: Math.round(clear?.x ?? annotation.x), y: Math.round(clear?.y ?? annotation.y) };
}

function enclaveBorderBands(enclave, thickness) {
  return [
    { id: `${enclave.id}-top-border`, x: enclave.x - thickness, y: enclave.y - thickness, w: enclave.w + thickness * 2, h: thickness * 2 },
    { id: `${enclave.id}-right-border`, x: enclave.x + enclave.w - thickness, y: enclave.y - thickness, w: thickness * 2, h: enclave.h + thickness * 2 },
    { id: `${enclave.id}-bottom-border`, x: enclave.x - thickness, y: enclave.y + enclave.h - thickness, w: enclave.w + thickness * 2, h: thickness * 2 },
    { id: `${enclave.id}-left-border`, x: enclave.x - thickness, y: enclave.y - thickness, w: thickness * 2, h: enclave.h + thickness * 2 }
  ];
}

function bottom(item) {
  return item ? item.y + item.h : 0;
}

function measureNode(node, templateW, templateH) {
  const labelWidth = node.label.length * TEXT_RULES.labelChar;
  const subWidth = (node.sub || '').length * TEXT_RULES.subChar;
  const copyWidth = Math.max(1, templateW - TEXT_RULES.iconAndPadding);
  const labelLines = Math.max(1, Math.ceil(labelWidth / copyWidth));
  const subLines = Math.max(1, Math.ceil(subWidth / copyWidth));
  return {
    w: templateW,
    h: Math.max(templateH, TEXT_RULES.minHeight + (labelLines + subLines - 2) * TEXT_RULES.lineHeight)
  };
}

function rangesOverlap(a1, a2, b1, b2) {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)) > 0;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inflate(rect, pad) {
  return { ...rect, x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
}
