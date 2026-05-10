export const VALID_PORTS = new Set(['left', 'right', 'top', 'bottom']);

export function nodeMap(nodes) {
  return new Map(nodes.map(node => [node.id, node]));
}

export function routeLink(link, nodesById, layout = { lanes: {} }) {
  const from = nodesById.get(link.from);
  const to = nodesById.get(link.to);
  const start = portPoint(from, link.fromPort);
  const end = portPoint(to, link.toPort);
  return [start, ...routeVia(link, start, end, layout.lanes || {}), end];
}

export function portPoint(node, port) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const points = {
    left: { x: node.x, y: cy },
    right: { x: node.x + node.w, y: cy },
    top: { x: cx, y: node.y },
    bottom: { x: cx, y: node.y + node.h }
  };
  return points[port];
}

export function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}

export function labelPoint(link, points) {
  if (!link.label) return null;
  if (points.labelSlot) return points.labelSlot;
  const segment = longestSegment(points);
  if (!segment) return null;
  return {
    x: Math.round((segment.a.x + segment.b.x) / 2 - Math.min(link.label.length * 2.6, 70)),
    y: Math.round((segment.a.y + segment.b.y) / 2 - 14)
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
    'ops-services-direct': [{ x: lanes.opsServiceX, y: start.y }, { x: lanes.opsServiceX, y: lanes.opsServiceUpperY }, { x: end.x, y: lanes.opsServiceUpperY }],
    'control-up': [{ x: midX, y: start.y }, { x: midX, y: end.y }],
    'control-bus': [{ x: start.x, y: lanes.controlBusY }, { x: end.x, y: lanes.controlBusY }],
    'control-mirror': [{ x: start.x, y: lanes.controlBusY }, { x: end.x, y: lanes.controlBusY }],
    'field-bus': [{ x: start.x, y: lanes.fieldBusY }, { x: end.x, y: lanes.fieldBusY }],
    'field-low-bus': [{ x: start.x, y: lanes.fieldLowBusY }, { x: end.x, y: lanes.fieldLowBusY }],
    'boundary-span': [{ x: lanes.boundaryEastX, y: start.y }, { x: lanes.boundaryEastX, y: lanes.boundarySpanY }, { x: end.x, y: lanes.boundarySpanY }],
    'control-span': [{ x: lanes.controlWestX, y: start.y }, { x: lanes.controlWestX, y: end.y }],
    'sensor-store-west': [{ x: start.x, y: lanes.monitoringFeedY }, { x: lanes.monitoringStoreX, y: lanes.monitoringFeedY }, { x: lanes.monitoringStoreX, y: end.y }],
    'sensor-store-direct': [{ x: start.x, y: lanes.monitoringFeedY }, { x: end.x, y: lanes.monitoringFeedY }],
    'soc-handoff': [{ x: lanes.enterpriseReturnX, y: start.y }, { x: lanes.enterpriseReturnX, y: end.y }]
  };

  if (routes[link.route]) return routes[link.route];
  if (start.x === end.x || start.y === end.y) return [];
  return [{ x: midX, y: start.y }, { x: midX, y: end.y }];
}

function longestSegment(points) {
  return points.slice(1).reduce((best, point, index) => {
    const previous = points[index];
    const length = Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y);
    if (!best || length > best.length) return { a: previous, b: point, length };
    return best;
  }, null);
}
