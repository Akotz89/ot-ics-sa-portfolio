import { byId, html, svg, text } from './dom.js';
import { labelPoint, nodeMap, pointsToPath, routeLink } from './routing.js?v=engine-22';

export function renderWhiteboard({ layout, links, flows = [] }) {
  const layers = getLayers();
  const { board, enclaves, nodes, annotations, legend } = layout;
  const nodesById = nodeMap(nodes);
  const linksById = new Map(links.map(link => [link.id, link]));
  const routesByLink = new Map();

  layers.enclaves.replaceChildren();
  layers.nodes.replaceChildren(titleBlock(board));
  layers.flow.setAttribute('width', board.width);
  layers.flow.setAttribute('height', board.height);
  layers.flow.setAttribute('viewBox', `0 0 ${board.width} ${board.height}`);
  layers.flow.querySelectorAll('.flow,.packet').forEach(element => element.remove());
  layers.labels.replaceChildren();
  layers.annotations.replaceChildren();

  enclaves.forEach(enclave => layers.enclaves.append(renderEnclave(enclave)));
  nodes.forEach(node => layers.nodes.append(renderNode(node)));
  links.forEach(link => routesByLink.set(link.id, renderLink(link, nodesById, layers, layout)));
  flows.forEach(flow => renderPacket(flow, linksById.get(flow.link), routesByLink.get(flow.link), layers));
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
  layers.flow.append(path);
  if (link.directional) renderDirectionCue(link, points, layers);

  const labelAt = labelPoint(link, points, layout);
  if (link.label && labelAt) {
    layers.labels.append(html('div', {
      class: `flow-label ${link.cls || ''}`.trim(),
      dataLinkGroup: link.group,
      dataLinkSource: link.id,
      style: { left: `${labelAt.x}px`, top: `${labelAt.y}px`, width: `${labelAt.w}px` }
    }, [text(link.label)]));
  }
  return points;
}

function renderDirectionCue(link, points, layers) {
  const segment = bestDirectionSegment(points);
  if (!segment || segment.length < 44) return;
  const center = pointOnSegment(segment, 0.58);
  const angle = segment.a.x === segment.b.x
    ? (segment.b.y > segment.a.y ? 90 : -90)
    : (segment.b.x > segment.a.x ? 0 : 180);
  layers.flow.append(svg('path', {
    class: `direction-cue ${link.cls || ''}`.trim(),
    d: 'M-5 -4L5 0L-5 4',
    transform: `translate(${Math.round(center.x)} ${Math.round(center.y)}) rotate(${angle})`,
    dataLinkGroup: link.group,
    dataLinkSource: link.id
  }));
}

function bestDirectionSegment(points) {
  return points.slice(1)
    .map((point, index) => {
      const previous = points[index];
      return { a: previous, b: point, length: Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y) };
    })
    .filter(segment => segment.a.x === segment.b.x || segment.a.y === segment.b.y)
    .sort((a, b) => b.length - a.length)[0];
}

function pointOnSegment(segment, ratio) {
  return {
    x: segment.a.x + (segment.b.x - segment.a.x) * ratio,
    y: segment.a.y + (segment.b.y - segment.a.y) * ratio
  };
}

function renderPacket(flow, link, points, layers) {
  if (!link || !points || points.length < 2) return;
  const pathId = `flow-${link.id}`;
  const packet = svg('circle', {
    class: `packet packet-${flow.kind || 'generic'} ${link.cls || ''}`.trim(),
    r: packetRadius(flow.kind),
    dataFlowGroup: link.group,
    dataFlowId: flow.id,
    dataFlowLink: link.id,
    dataFlowFrom: link.from,
    dataFlowTo: link.to
  });
  const motion = svg('animateMotion', {
    dur: `${flow.speed || 1.8}s`,
    begin: 'indefinite',
    repeatCount: '1',
    rotate: 'auto'
  });
  const mpath = svg('mpath', { href: `#${pathId}` });
  mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
  motion.append(mpath);
  packet.append(motion);
  layers.flow.append(packet);
}

function packetRadius(kind) {
  const sizes = {
    backbone: 5.2,
    protocol: 4.2,
    span: 4.4,
    detection: 4.8,
    handoff: 4.6
  };
  return sizes[kind] || 4;
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
