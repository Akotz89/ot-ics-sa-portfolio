import { routeLink, VALID_PORTS } from './routing.js';
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
