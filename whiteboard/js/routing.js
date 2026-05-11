import { ENTITY_RULES, allowedAnchors, entityRect, headerRect, headerTextRect } from './layout/entityRules.js?v=engine-22';

export const VALID_PORTS = new Set(['left', 'right', 'top', 'bottom']);

export function nodeMap(nodes) {
  return new Map(nodes.map(node => [node.id, node]));
}

export function routeLink(link, nodesById, layout = { lanes: {} }) {
  const from = nodesById.get(link.from);
  const to = nodesById.get(link.to);
  const startPort = resolvePort(from, link.route === 'boundary-span' ? 'right' : link.fromPort);
  const endPort = resolvePort(to, link.toPort);
  const start = portPoint(from, startPort, 0);
  const end = portPoint(to, endPort, 0);
  const manual = routeVia(link, start, end, layout.lanes || {});
  const candidate = simplifyPath([start, ...manual, end]);
  if (isReservedLaneRoute(link)) return candidate;
  if (isRouteClear(candidate, link, layout)) return candidate;
  return autoRoute(link, start, end, layout);
}

export function portPoint(node, port, offset = 0) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const points = {
    left: { x: node.x - offset, y: cy },
    right: { x: node.x + node.w + offset, y: cy },
    top: { x: cx, y: node.y - offset },
    bottom: { x: cx, y: node.y + node.h + offset }
  };
  return points[port];
}

export function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}

export function labelPoint(link, points, layout) {
  if (!link.label) return null;
  const width = Math.min(Math.max(link.label.length * 6.2, 54), 150) + 14;
  const ranked = rankedSegments(points, link, layout);
  if (!ranked.length) return null;
  const segments = ranked.filter(segment => segment.a.x === segment.b.x || segment.length > width + 24);
  const label = { w: width, h: 20 };
  const blockers = labelBlockers(layout);
  for (const segment of segments.length ? segments : ranked) {
    const candidates = labelCandidates(segment, label);
    const clear = candidates.find(candidate => placementClear({ ...candidate, ...label }, blockers, layout));
    if (clear) return offsetLabel(link, clear, label, layout);
  }
  const searched = searchLabelSpot(ranked, label, blockers, layout);
  if (searched) return offsetLabel(link, searched, label, layout);
  return null;
}

function offsetLabel(link, point, label, layout) {
  const x = point.x + (link.labelOffsetX || 0);
  const y = point.y + (link.labelOffsetY || 0);
  return {
    x: Math.round(Math.min(Math.max(0, x), layout.board.width - label.w)),
    y: Math.round(Math.min(Math.max(0, y), layout.board.height - label.h)),
    w: label.w,
    h: label.h
  };
}

function routeVia(link, start, end, lanes) {
  const midX = Math.round((start.x + end.x) / 2);
  const midY = Math.round((start.y + end.y) / 2);
  const routes = {
    'enterprise-return': [{ x: lanes.enterpriseReturnX, y: start.y }, { x: lanes.enterpriseReturnX, y: lanes.enterpriseReturnY }, { x: end.x, y: lanes.enterpriseReturnY }],
    'ops-up': [{ x: lanes.opsServiceX, y: start.y }, { x: lanes.opsServiceX, y: end.y }],
    'ops-down': [{ x: lanes.opsServiceX, y: start.y }, { x: lanes.opsServiceX, y: end.y }],
    'ops-service': [{ x: lanes.opsServiceX, y: start.y }, { x: lanes.opsServiceX, y: lanes.opsServiceY }, { x: end.x, y: lanes.opsServiceY }],
    'ops-services-direct': [{ x: start.x, y: lanes.opsServiceY }, { x: end.x, y: lanes.opsServiceY }],
    'core-trunk': [{ x: lanes.controlDropX || midX, y: start.y }, { x: lanes.controlDropX || midX, y: end.y }],
    'control-up': [{ x: lanes.controlDropX || midX, y: start.y }, { x: lanes.controlDropX || midX, y: end.y }],
    'control-bus': [{ x: start.x, y: lanes.controlBusY }, { x: end.x, y: lanes.controlBusY }],
    'control-mirror': [{ x: start.x, y: lanes.controlBusY }, { x: end.x, y: lanes.controlBusY }],
    'field-bus': [{ x: start.x, y: laneForLink(link, lanes.fieldBusY) }, { x: end.x, y: laneForLink(link, lanes.fieldBusY) }],
    'field-low-bus': fieldLowRoute(link, start, end, lanes),
    'boundary-span': [{ x: lanes.boundaryEastX, y: start.y }, { x: lanes.boundaryEastX, y: lanes.boundarySpanExitY || start.y }, { x: lanes.boundaryEastX, y: lanes.boundarySpanY }, { x: end.x, y: lanes.boundarySpanY }],
    'control-span': [{ x: lanes.controlWestX, y: start.y }, { x: lanes.controlWestX, y: end.y }],
    'sensor-store-west': [{ x: start.x, y: lanes.monitoringFeedY }, { x: lanes.monitoringStoreX, y: lanes.monitoringFeedY }, { x: lanes.monitoringStoreX, y: end.y }],
    'sensor-store-direct': [{ x: start.x, y: lanes.monitoringFeedY }, { x: end.x, y: lanes.monitoringFeedY }],
    'soc-handoff': [{ x: lanes.socHandoffX || lanes.enterpriseReturnX, y: start.y }, { x: lanes.socHandoffX || lanes.enterpriseReturnX, y: end.y }]
  };

  if (routes[link.route]) return routes[link.route];
  if (start.x === end.x || start.y === end.y) return [];
  return [{ x: midX, y: start.y }, { x: midX, y: end.y }];
}

function laneForLink(link, base) {
  const offsets = {
    'markvie-scada': 0,
    'clx-hmi': 16,
    'rtu-mirror': 32,
    's7-dist': 0
  };
  return base + (offsets[link.id] || 0);
}

function isReservedLaneRoute(link) {
  return ['core-trunk', 'field-bus', 'field-low-bus', 'boundary-span'].includes(link.route);
}

function autoRoute(link, start, end, layout) {
  const obstacles = routeObstacles(link, layout, 18);
  const xs = candidateAxis([start.x, end.x, 0, layout.board.width], obstacles, 'x', 'w');
  const ys = candidateAxis([start.y, end.y, 0, layout.board.height], obstacles, 'y', 'h');
  const startKey = keyOf(start);
  const endKey = keyOf(end);
  const open = [{ key: startKey, point: start, cost: 0, score: distance(start, end), previous: null }];
  const seen = new Map([[startKey, open[0]]]);
  const closed = new Set();

  while (open.length) {
    open.sort((a, b) => a.score - b.score);
    const current = open.shift();
    if (current.key === endKey) return simplifyPath(unwind(current));
    if (closed.has(current.key)) continue;
    closed.add(current.key);

    neighbors(current.point, xs, ys).forEach(point => {
      const nextKey = keyOf(point);
      if (closed.has(nextKey)) return;
      if (!segmentClear(current.point, point, obstacles)) return;
      const turnPenalty = current.previous && direction(current.previous.point, current.point) !== direction(current.point, point) ? 28 : 0;
      const cost = current.cost + distance(current.point, point) + turnPenalty;
      const existing = seen.get(nextKey);
      if (existing && existing.cost <= cost) return;
      const next = { key: nextKey, point, cost, score: cost + distance(point, end), previous: current };
      seen.set(nextKey, next);
      open.push(next);
    });
  }

  return simplifyPath([start, { x: Math.round((start.x + end.x) / 2), y: start.y }, { x: Math.round((start.x + end.x) / 2), y: end.y }, end]);
}

function routeObstacles(link, layout, pad) {
  const ignored = new Set([link.from, link.to]);
  const headerText = layout.enclaves.map(enclave => headerTextRect(enclave));
  return [...layout.nodes, ...layout.annotations, layout.legend, ...headerText]
    .filter(item => item && !ignored.has(item.id))
    .map(item => entityRect(item, pad));
}

function fieldLowRoute(link, start, end, lanes) {
  const busY = laneForLink(link, lanes.fieldLowBusY);
  if (link.to === 'dist' || link.from === 'dist') {
    const exitX = lanes.fieldExitX || Math.round((start.x + end.x) / 2);
    return [{ x: start.x, y: busY }, { x: exitX, y: busY }, { x: exitX, y: end.y }, { x: end.x, y: end.y }];
  }
  return [{ x: start.x, y: busY }, { x: end.x, y: busY }];
}

function candidateAxis(seed, obstacles, axis, size) {
  const values = new Set(seed.map(Math.round));
  obstacles.forEach(rect => {
    [rect[axis] - 18, rect[axis], rect[axis] + rect[size], rect[axis] + rect[size] + 18].forEach(value => values.add(Math.round(value)));
  });
  return [...values].sort((a, b) => a - b);
}

function neighbors(point, xs, ys) {
  return [
    ...xs.filter(x => x !== point.x).map(x => ({ x, y: point.y })),
    ...ys.filter(y => y !== point.y).map(y => ({ x: point.x, y }))
  ];
}

function isRouteClear(points, link, layout) {
  const obstacles = routeObstacles(link, layout, 12);
  return points.slice(1).every((point, index) => segmentClear(points[index], point, obstacles));
}

function segmentClear(a, b, obstacles) {
  if (a.x !== b.x && a.y !== b.y) return false;
  return obstacles.every(rect => !segmentHitsRect(a, b, rect));
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

function simplifyPath(points) {
  return points.reduce((result, point) => {
    const previous = result[result.length - 1];
    if (previous && previous.x === point.x && previous.y === point.y) return result;
    const before = result[result.length - 2];
    if (before && previous && direction(before, previous) === direction(previous, point)) {
      result[result.length - 1] = point;
      return result;
    }
    result.push(point);
    return result;
  }, []);
}

function unwind(item) {
  const points = [];
  let current = item;
  while (current) {
    points.unshift(current.point);
    current = current.previous;
  }
  return points;
}

function keyOf(point) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function direction(a, b) {
  if (a.x === b.x) return 'v';
  if (a.y === b.y) return 'h';
  return 'd';
}

function resolvePort(entity, requested) {
  const allowed = allowedAnchors(entity);
  if (allowed.includes(requested)) return requested;
  return allowed[0] || requested;
}

function labelCandidates(segment, label) {
  const midX = (segment.a.x + segment.b.x) / 2;
  const midY = (segment.a.y + segment.b.y) / 2;
  if (segment.a.x === segment.b.x) {
    const yValues = [midY - label.h / 2, midY + 12, midY - label.h - 12, midY + 32, midY - label.h - 32, midY + 56, midY - label.h - 56];
    const candidates = [];
    yValues.forEach(y => {
      [14, 34, 58, 84, 112, 146].forEach(offset => {
        candidates.push({ x: segment.a.x + offset, y });
        candidates.push({ x: segment.a.x - label.w - offset, y });
      });
    });
    return candidates;
  }
  const yOffsets = [-label.h - 10, 10, -label.h - 30, 30, 54, -label.h - 54];
  const xOffsets = [0, -48, 48, -96, 96, -144, 144];
  return yOffsets.flatMap(yOffset => xOffsets.map(xOffset => ({
    x: midX - label.w / 2 + xOffset,
    y: segment.a.y + yOffset
  })));
}

function searchLabelSpot(segments, label, blockers, layout) {
  const base = segments[0];
  const midX = (base.a.x + base.b.x) / 2;
  const midY = (base.a.y + base.b.y) / 2;
  const candidates = [];
  for (let radius = 36; radius <= ENTITY_RULES.labelLeaderDistance; radius += 20) {
    for (let dx = -radius; dx <= radius; dx += 20) {
      for (let dy = -radius; dy <= radius; dy += 20) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        candidates.push({
          x: midX + dx - label.w / 2,
          y: midY + dy - label.h / 2,
          score: Math.abs(dx) + Math.abs(dy)
        });
      }
    }
  }
  return candidates
    .sort((a, b) => a.score - b.score)
    .find(candidate => placementClear({ ...candidate, ...label }, blockers, layout));
}

function placementClear(rect, blockers, layout) {
  if (layout && (rect.x < 0 || rect.y < 0 || rect.x + rect.w > layout.board.width || rect.y + rect.h > layout.board.height)) return false;
  return !blockers.some(blocker => rectsOverlap(inflate(rect, 6), blocker));
}

function labelBlockers(layout) {
  if (!layout) return [];
  return [...layout.nodes, ...layout.annotations, layout.legend, ...layout.enclaves.map(enclave => headerRect(enclave, 'label'))]
    .filter(Boolean)
    .map(item => ({ x: item.x - ENTITY_RULES.labelPadding, y: item.y - ENTITY_RULES.labelPadding, w: item.w + ENTITY_RULES.labelPadding * 2, h: item.h + ENTITY_RULES.labelPadding * 2 }));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inflate(rect, pad) {
  return { ...rect, x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
}

function rankedSegments(points, link, layout) {
  const field = layout?.enclaves?.find(enclave => enclave.id === 'field');
  return points.slice(1).reduce((best, point, index) => {
    const previous = points[index];
    const length = Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y);
    best.push({ a: previous, b: point, length, priority: segmentPriority(link, field, previous, point) });
    return best;
  }, []).sort((a, b) => b.priority - a.priority || b.length - a.length);
}

function segmentPriority(link, field, a, b) {
  if (!['field-bus', 'field-low-bus'].includes(link?.route) || !field) return 0;
  const horizontal = a.y === b.y;
  const insideField = a.y >= field.y + ENTITY_RULES.header.route && a.y <= field.y + field.h;
  return horizontal && insideField ? 1000 : 0;
}
