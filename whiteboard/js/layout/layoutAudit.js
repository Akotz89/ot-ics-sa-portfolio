import { labelPoint, nodeMap, routeLink } from '../routing.js?v=engine-22';
import { ENTITY_RULES, headerRect, headerTextRect } from './entityRules.js?v=engine-22';

const ENTITY_GAP = 6;
const LABEL_H = 20;

export function auditLayoutCandidate({ layout, links = [], steps = [] }) {
  const nodesById = nodeMap(layout.nodes);
  const linkRoutes = links.map(link => ({ link, points: routeLink(link, nodesById, layout) }));
  const labels = linkRoutes
    .filter(({ link }) => link.label)
    .map(({ link, points }) => {
      const point = labelPoint(link, points, layout);
      return point
        ? { id: `label-${link.id}`, link, ...labelRect(link, point) }
        : { id: `label-${link.id}`, link, missing: true };
    });
  const errors = [
    ...missingLabelErrors(labels),
    ...boxOverlapErrors(layout, labels, steps),
    ...headerErrors(layout, labels),
    ...routeErrors(layout, linkRoutes, steps),
    ...labelErrors(layout, linkRoutes, labels),
    ...boundsErrors(layout, labels)
  ];

  return {
    errors,
    labels,
    routes: linkRoutes,
    score: scoreCandidate(layout, errors)
  };
}

function missingLabelErrors(labels) {
  return labels
    .filter(label => label.missing)
    .map(label => `${label.id} has no anchored placement`);
}

export function scaleMetrics(board, stage) {
  const availableWidth = Math.max(1, stage?.clientWidth || board.width);
  const availableHeight = Math.max(1, stage?.clientHeight || board.height);
  const rawScale = Math.min(availableWidth / board.width, availableHeight / board.height, board.maxScale || 2);
  const scale = Math.max(0, rawScale);
  const scaledWidth = board.width * scale;
  const scaledHeight = board.height * scale;
  const widthFill = scaledWidth / availableWidth;
  const heightFill = scaledHeight / availableHeight;
  const areaFill = (scaledWidth * scaledHeight) / (availableWidth * availableHeight);
  return {
    availableWidth,
    availableHeight,
    scale,
    widthFill,
    heightFill,
    areaFill,
    belowReadableScale: scale < (board.minScale || 0.52)
  };
}

function scoreCandidate(layout, errors) {
  const metrics = layout.fit;
  const underfillPenalty = Math.max(0, 0.84 - metrics.areaFill) * 100;
  const shapePenalty = Math.max(0, 0.82 - Math.max(metrics.widthFill, metrics.heightFill)) * 80;
  const scalePenalty = metrics.belowReadableScale ? 500 : 0;
  return errors.length * 1000 + underfillPenalty + shapePenalty + scalePenalty - metrics.areaFill * 20;
}

function labelRect(link, point) {
  return { x: point?.x, y: point?.y, w: point?.w, h: LABEL_H };
}

function boxOverlapErrors(layout, labels, steps) {
  const items = [...layout.nodes, ...layout.annotations, layout.legend, ...labels].filter(item => item && !item.missing);
  const errors = [];
  const visibleForStep = step => new Set([...(step.groups || []), ...(step.links || [])]);
  const scopedSteps = steps.length ? steps : [{ label: 'layout', groups: [...new Set(items.map(item => item.group))], links: [...new Set(labels.map(label => label.link.group))] }];
  scopedSteps.forEach(step => {
    const visible = visibleForStep(step);
    const boxes = items.filter(item => visible.has(item.group) || visible.has(item.link?.group));
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (rectsOverlap(inflate(boxes[i], ENTITY_GAP), inflate(boxes[j], ENTITY_GAP))) {
          errors.push(`${step.label}: ${boxes[i].id} overlaps ${boxes[j].id}`);
        }
      }
    }
  });
  return errors;
}

function headerErrors(layout, labels) {
  const errors = [];
  layout.enclaves.forEach(enclave => {
    const nodeHeader = headerRect(enclave, 'node');
    layout.nodes
      .filter(node => node.group === enclave.id)
      .forEach(node => {
        if (rectsOverlap(nodeHeader, node)) errors.push(`${node.id} intrudes into ${enclave.id} header`);
      });
    const labelHeader = headerRect(enclave, 'label');
    labels.filter(label => !label.missing).forEach(label => {
      if (rectsOverlap(labelHeader, label)) errors.push(`${label.id} intrudes into ${enclave.id} header`);
    });
  });
  return errors;
}

function routeErrors(layout, linkRoutes, steps) {
  const errors = [];
  const headerText = layout.enclaves.map(enclave => headerTextRect(enclave));
  const blockers = [...layout.nodes, ...layout.annotations, layout.legend, ...headerText].filter(Boolean);
  const scopedSteps = steps.length ? steps : [{ label: 'layout', links: [...new Set(linkRoutes.map(({ link }) => link.group))] }];
  scopedSteps.forEach(step => {
    const visibleLinks = linkRoutes.filter(({ link }) => step.links?.includes(link.group));
    visibleLinks.forEach(({ link, points }) => {
      const ignored = new Set([link.from, link.to]);
      segments(points).forEach(segment => {
        blockers
          .filter(blocker => !ignored.has(blocker.id))
          .forEach(blocker => {
            if (segmentHitsRect(segment.a, segment.b, inflate(blocker, ENTITY_RULES.arrowClearance))) {
              errors.push(`${step.label}: ${link.id} crosses ${blocker.id}`);
            }
          });
      });
    });
    for (let i = 0; i < visibleLinks.length; i += 1) {
      for (let j = i + 1; j < visibleLinks.length; j += 1) {
        if (shareEndpoint(visibleLinks[i].link, visibleLinks[j].link)) continue;
        if (routesShareSegment(visibleLinks[i].points, visibleLinks[j].points)) {
          errors.push(`${step.label}: ${visibleLinks[i].link.id} overlaps ${visibleLinks[j].link.id}`);
        }
      }
    }
  });
  return errors;
}

function labelErrors(layout, linkRoutes, labels) {
  const errors = [];
  labels.filter(label => !label.missing).forEach(label => {
    const route = linkRoutes.find(item => item.link.id === label.link.id);
    if (!route) {
      errors.push(`${label.id} has no route`);
      return;
    }
    const center = { x: label.x + label.w / 2, y: label.y + label.h / 2 };
    const distance = Math.min(...segments(route.points).map(segment => distanceToSegment(center, segment.a, segment.b)));
    if (distance > ENTITY_RULES.labelLeaderDistance) errors.push(`${label.id} is orphaned from ${label.link.id}`);
  });
  return errors;
}

function boundsErrors(layout, labels) {
  const items = [...layout.nodes, ...layout.annotations, layout.legend, ...labels].filter(item => item && !item.missing);
  return items
    .filter(item => item.x < 0 || item.y < 0 || item.x + item.w > layout.board.width || item.y + item.h > layout.board.height)
    .map(item => `${item.id} leaves board bounds`);
}

function segments(points) {
  return points.slice(1).map((point, index) => ({ a: points[index], b: point }));
}

function shareEndpoint(a, b) {
  return a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to;
}

function routesShareSegment(a, b) {
  return segments(a).some(first => segments(b).some(second => sameAxisOverlap(first, second)));
}

function sameAxisOverlap(first, second) {
  if (first.a.y === first.b.y && second.a.y === second.b.y && first.a.y === second.a.y) {
    return rangeOverlap(first.a.x, first.b.x, second.a.x, second.b.x) > 18;
  }
  if (first.a.x === first.b.x && second.a.x === second.b.x && first.a.x === second.a.x) {
    return rangeOverlap(first.a.y, first.b.y, second.a.y, second.b.y) > 18;
  }
  return false;
}

function segmentHitsRect(a, b, rect) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;
  if (a.y === b.y) return a.y >= rect.y && a.y <= bottom && maxX >= rect.x && minX <= right;
  if (a.x === b.x) return a.x >= rect.x && a.x <= right && maxY >= rect.y && minY <= bottom;
  return true;
}

function distanceToSegment(point, a, b) {
  if (a.x === b.x) {
    const y = Math.min(Math.max(point.y, Math.min(a.y, b.y)), Math.max(a.y, b.y));
    return Math.hypot(point.x - a.x, point.y - y);
  }
  if (a.y === b.y) {
    const x = Math.min(Math.max(point.x, Math.min(a.x, b.x)), Math.max(a.x, b.x));
    return Math.hypot(point.x - x, point.y - a.y);
  }
  return Infinity;
}

function rangeOverlap(a1, a2, b1, b2) {
  return Math.max(0, Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2)));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inflate(rect, pad) {
  return { ...rect, x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
}
