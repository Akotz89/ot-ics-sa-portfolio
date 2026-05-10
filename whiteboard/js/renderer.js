import { byId, html, svg, text } from './dom.js';
import { labelPoint, nodeMap, pointsToPath, routeLink } from './routing.js';

export function renderWhiteboard({ layout, links }) {
  const layers = getLayers();
  const { board, enclaves, nodes, annotations, legend } = layout;
  const nodesById = nodeMap(nodes);

  layers.enclaves.replaceChildren();
  layers.nodes.replaceChildren(titleBlock(board));
  layers.flow.querySelectorAll('.flow').forEach(path => path.remove());
  layers.labels.replaceChildren();
  layers.annotations.replaceChildren();

  enclaves.forEach(enclave => layers.enclaves.append(renderEnclave(enclave)));
  nodes.forEach(node => layers.nodes.append(renderNode(node)));
  links.forEach(link => renderLink(link, nodesById, layers, layout));
  annotations.forEach(annotation => layers.annotations.append(renderAnnotation(annotation)));
  layers.annotations.append(renderLegend(legend));
}

function getLayers() {
  return {
    enclaves: byId('enclave-layer'),
    nodes: byId('node-layer'),
    flow: byId('flow-layer'),
    labels: byId('flow-label-layer'),
    annotations: byId('annotation-layer')
  };
}

function titleBlock(board) {
  return html('div', { class: 'title-block' }, [
    html('h2', {}, [text(board.title)]),
    html('p', {}, [text(board.subtitle)])
  ]);
}

function renderEnclave(enclave) {
  return html('section', {
    class: `enclave ${enclave.variant || ''}`.trim(),
    dataGroup: enclave.group,
    style: pxBox(enclave)
  }, [
    html('h3', { class: 'enclave-title' }, [text(enclave.title)]),
    html('p', { class: 'enclave-sub' }, [text(enclave.sub)])
  ]);
}

function renderNode(node) {
  return html('article', {
    class: `node ${node.variant || ''} kind-${node.kind || 'generic'}`.trim(),
    dataGroup: node.group,
    dataNodeId: node.id,
    style: pxBox(node)
  }, [
    html('span', { class: `node-icon icon-${node.kind || 'generic'}`, ariaHidden: 'true' }),
    html('div', { class: 'node-copy' }, [
      html('div', { class: 'label' }, [text(node.label)]),
      node.sub ? html('div', { class: 'sub' }, [text(node.sub)]) : ''
    ].filter(Boolean))
  ].filter(Boolean));
}

function renderLink(link, nodesById, layers, layout) {
  const points = routeLink(link, nodesById, layout);
  const path = svg('path', {
    id: `flow-${link.id}`,
    class: `flow ${link.cls || 'gray'}`.trim(),
    d: pointsToPath(points),
    dataLinkGroup: link.group,
    dataLinkSource: link.id,
    dataInvalid: String(!nodesById.has(link.from) || !nodesById.has(link.to))
  });
  if (link.marker) path.setAttribute('marker-end', `url(#${link.marker})`);
  layers.flow.append(path);

  points.labelSlot = layout.labelSlots?.[link.id];
  const labelAt = labelPoint(link, points);
  if (link.label && labelAt) {
    layers.labels.append(html('div', {
      class: `flow-label ${link.cls || ''}`.trim(),
      dataLinkGroup: link.group,
      style: { left: `${labelAt.x}px`, top: `${labelAt.y}px` }
    }, [text(link.label)]));
  }
}

function renderAnnotation(annotation) {
  return html('aside', {
    class: `annotation ${annotation.variant || ''}`.trim(),
    dataGroup: annotation.group,
    style: pxBox(annotation)
  }, [
    html('h3', {}, [text(annotation.title)]),
    ...annotation.lines.map(line => html('p', {}, [text(line)]))
  ]);
}

function renderLegend(legend) {
  const rows = [
    ['legend-symbol firewall-symbol', 'firewall / boundary control'],
    ['legend-symbol switch-symbol', 'switch / trunk point'],
    ['legend-symbol server-symbol', 'server / historian / app'],
    ['legend-symbol controller-symbol', 'PLC / RTU controller'],
    ['legend-line gray', 'allowed / reviewed enterprise path'],
    ['legend-line protocol', 'controller protocol'],
    ['legend-line orange', 'passive SPAN / sensor feed'],
    ['legend-line blue', 'metadata / SOC handoff']
  ];
  return html('aside', { class: 'legend', dataGroup: 'monitoring', style: pxBox(legend) }, [
    html('h3', {}, [text('Whiteboard legend')]),
    ...rows.map(([cls, label]) => html('div', { class: 'legend-row' }, [
      html('span', { class: cls }),
      html('span', {}, [text(label)])
    ]))
  ]);
}

function pxBox(item) {
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${item.w}px`,
    height: `${item.h}px`
  };
}
