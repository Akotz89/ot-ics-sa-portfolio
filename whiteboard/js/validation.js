import { routeLink, VALID_PORTS } from './routing.js?v=engine-22';
import { intersects, rectOf, segmentHitsRect } from './validation/geometry.js';

const NODE_PADDING = 8;

export function validateModel({ layout, links, steps }) {
  const nodes = layout.nodes;
  const nodesById = new Map(nodes.map(node => [node.id, node]));
  const errors = [];

  links.forEach(link => {
    if (!nodesById.has(link.from)) errors.push(`${link.id} missing from node ${link.from}`);
    if (!nodesById.has(link.to)) errors.push(`${link.id} missing to node ${link.to}`);
    if (!VALID_PORTS.has(link.fromPort)) errors.push(`${link.id} invalid fromPort ${link.fromPort}`);
    if (!VALID_PORTS.has(link.toPort)) errors.push(`${link.id} invalid toPort ${link.toPort}`);
    validateOrthogonalRoute(link, nodesById, layout, errors);
  });

  validateStepRevealOrder(steps, links, nodesById, errors);
  validateEnclaveHeaderClearance(layout, errors);
  validateStepBoxCollisions(steps, layout, errors);
  validateRouteCollisions(steps, layout, links, nodesById, errors);
  validateRouteOverlaps(steps, layout, links, nodesById, errors);

  if (errors.length) {
    throw new Error(`Whiteboard model failed validation:\n- ${errors.join('\n- ')}`);
  }
}

function validateEnclaveHeaderClearance(layout, errors) {
  const headerHeight = layout.rules?.enclaveHeaderHeight || 56;
  const enclavesById = new Map(layout.enclaves.map(enclave => [enclave.id, enclave]));
  layout.nodes.forEach(node => {
    const enclave = enclavesById.get(node.group);
    if (!enclave) return;
    const minY = enclave.y + headerHeight;
    if (node.y < minY) {
      errors.push(`${node.id} starts at ${node.y}, inside ${node.group} header band; minimum is ${minY}`);
    }
  });
}

function validateStepRevealOrder(steps, links, nodesById, errors) {
  steps.forEach(step => {
    const visibleGroups = new Set(step.groups);
    links
      .filter(link => step.links.includes(link.group))
      .forEach(link => {
        const from = nodesById.get(link.from);
        const to = nodesById.get(link.to);
        if (!from || !to) return;
        if (!visibleGroups.has(from.group) || !visibleGroups.has(to.group)) {
          errors.push(`Step "${step.label}" reveals ${link.id} before both endpoint groups are visible`);
        }
      });
  });
}

function validateOrthogonalRoute(link, nodesById, layout, errors) {
  const points = routeLink(link, nodesById, layout);
  points.slice(1).forEach((point, index) => {
    const previous = points[index];
    if (previous.x !== point.x && previous.y !== point.y) {
      errors.push(`${link.id} has diagonal segment ${index + 1}; all routes must be orthogonal`);
    }
  });
}

function validateStepBoxCollisions(steps, layout, errors) {
  const items = [...layout.nodes, ...layout.annotations, layout.legend];
  steps.forEach(step => {
    const visibleGroups = new Set(step.groups);
    const boxes = items
      .filter(item => visibleGroups.has(item.group))
      .map(item => rectOf(item, 4));
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (intersects(boxes[i], boxes[j])) errors.push(`Step "${step.label}" has ${boxes[i].id} overlapping ${boxes[j].id}`);
      }
    }
  });
}

function validateRouteCollisions(steps, layout, links, nodesById, errors) {
  const blockers = [...layout.nodes, ...layout.annotations, layout.legend];
  steps.forEach(step => {
    const visibleGroups = new Set(step.groups);
    links
      .filter(link => step.links.includes(link.group))
      .forEach(link => {
        const points = routeLink(link, nodesById, layout);
        const ignored = new Set([link.from, link.to]);
        points.slice(1).forEach((point, index) => {
          const previous = points[index];
          blockers
            .filter(node => visibleGroups.has(node.group) && !ignored.has(node.id))
            .forEach(node => {
              if (segmentHitsRect(previous, point, rectOf(node, NODE_PADDING))) {
                errors.push(`Step "${step.label}" ${link.id} crosses ${node.id}; adjust route waypoints`);
              }
            });
        });
      });
  });
}

function validateRouteOverlaps(steps, layout, links, nodesById, errors) {
  steps.forEach(step => {
    const visibleRoutes = links
      .filter(link => step.links.includes(link.group))
      .map(link => ({ link, points: routeLink(link, nodesById, layout) }));
    for (let i = 0; i < visibleRoutes.length; i += 1) {
      for (let j = i + 1; j < visibleRoutes.length; j += 1) {
        if (shareEndpoint(visibleRoutes[i].link, visibleRoutes[j].link)) continue;
        if (routesShareSegment(visibleRoutes[i].points, visibleRoutes[j].points)) {
          errors.push(`Step "${step.label}" routes ${visibleRoutes[i].link.id} and ${visibleRoutes[j].link.id} overlap; reserve separate lanes`);
        }
      }
    }
  });
}

function shareEndpoint(a, b) {
  return a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to;
}

function routesShareSegment(a, b) {
  return segments(a).some(first => segments(b).some(second => sameAxisOverlap(first, second)));
}

function segments(points) {
  return points.slice(1).map((point, index) => ({ a: points[index], b: point }));
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

function rangeOverlap(a1, a2, b1, b2) {
  const minA = Math.min(a1, a2);
  const maxA = Math.max(a1, a2);
  const minB = Math.min(b1, b2);
  const maxB = Math.max(b1, b2);
  return Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
}
