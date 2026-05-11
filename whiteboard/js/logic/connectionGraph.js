export function buildConnectionGraph({ nodes, links, flows }) {
  const nodeIds = new Set(nodes.map(node => node.id));
  const linksById = new Map(links.map(link => [link.id, link]));
  const edges = new Map();
  const errors = [];

  links.forEach(link => {
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) return;
    addEdge(edges, link.from, link.to, link);
    addEdge(edges, link.to, link.from, link);
  });

  flows.forEach(flow => {
    const link = linksById.get(flow.link);
    if (!link) {
      errors.push(`${flow.id} references missing link ${flow.link}`);
      return;
    }
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
      errors.push(`${flow.id} rides ${link.id}, but the link endpoints are not valid`);
    }
  });

  return { nodeIds, linksById, edges, errors };
}

export function validateConnectionGraph(graph) {
  if (graph.errors.length) {
    throw new Error(`Whiteboard connection graph failed validation:\n- ${graph.errors.join('\n- ')}`);
  }
}

function addEdge(edges, from, to, link) {
  if (!edges.has(from)) edges.set(from, []);
  edges.get(from).push({ to, link });
}
