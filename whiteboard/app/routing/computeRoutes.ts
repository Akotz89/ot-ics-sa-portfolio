import { Box, type Editor } from 'tldraw'
import { shapeIdForEntity, shapeIdForZone } from '../canvas/ids'
import {
  entities,
  links,
  zones,
  type DirectionCue,
  type LinkKind,
  type LinkModel,
  type PortName,
  type RouteClass,
} from '../model/topology'
import type { StepModel } from '../model/steps'
import type { Obstacle, Point, RouteLabelLayout, RouteLayout, RouteSceneLayout } from './types'

const DEVICE_CLEARANCE = 18
const HEADER_CLEARANCE = 0
const ROUTE_CLEARANCE = 8
const LABEL_W_PAD = 28
const LABEL_H = 24
const LABEL_GAP = 14

export function computeRouteScene(editor: Editor, step: StepModel): RouteSceneLayout {
  const visibleEntityIds = new Set(step.visibleEntities)
  const visibleZoneIds = new Set(step.visibleZones)
  const visibleLinkIds = new Set(step.visibleLinks)
  const obstacles = buildObstacles(editor, visibleEntityIds, visibleZoneIds)
  const routes: RouteLayout[] = []
  const labels: RouteLabelLayout[] = []
  const errors: string[] = []

  for (const link of links) {
    if (!visibleLinkIds.has(link.id)) continue
    const route = routeLink(editor, link, obstacles)
    if (!route) {
      errors.push(`${link.id} could not route around visible entities`)
      continue
    }
    routes.push(route)
  }

  const labelObstacles = [...obstacles]
  for (const route of routes) {
    const label = placeRouteLabel(route, labelObstacles)
    if (label) {
      route.label = label
      labels.push(label)
      labelObstacles.push({
        id: label.id,
        kind: 'label',
        box: new Box(label.x, label.y, label.w, label.h).expandBy(4),
        ownerId: route.id,
      })
    }
  }

  for (const route of routes) {
    for (const obstacle of labelObstacles) {
      if (obstacle.ownerId === route.sourceId || obstacle.ownerId === route.targetId) continue
      if (obstacle.ownerId === route.id) continue
      if (routeHitsBox(route.points, obstacle.box, ROUTE_CLEARANCE)) {
        errors.push(`${route.id} crosses ${obstacle.id}`)
        break
      }
    }
  }

  return { routes, labels, errors }
}

function buildObstacles(editor: Editor, visibleEntityIds: Set<string>, visibleZoneIds: Set<string>) {
  const obstacles: Obstacle[] = []

  for (const entity of entities) {
    if (!visibleEntityIds.has(entity.id)) continue
    const bounds = editor.getShapePageBounds(shapeIdForEntity(entity.id))
    if (!bounds) continue
    obstacles.push({
      id: entity.id,
      kind: 'device',
      box: bounds.clone().expandBy(DEVICE_CLEARANCE),
      ownerId: entity.id,
    })
  }

  for (const zone of zones) {
    if (!visibleZoneIds.has(zone.id)) continue
    const bounds = editor.getShapePageBounds(shapeIdForZone(zone.id))
    if (!bounds) continue
    obstacles.push({
      id: `${zone.id}-header`,
      kind: 'zone-header',
      box: new Box(bounds.x + 8, bounds.y + 8, Math.min(260, bounds.w - 16), 44).expandBy(HEADER_CLEARANCE),
      ownerId: zone.id,
    })
  }

  return obstacles
}

function routeLink(editor: Editor, link: LinkModel, obstacles: Obstacle[]): RouteLayout | null {
  const sourceBounds = editor.getShapePageBounds(shapeIdForEntity(link.source))
  const targetBounds = editor.getShapePageBounds(shapeIdForEntity(link.target))
  if (!sourceBounds || !targetBounds) return null

  const sourcePort = preferredPort(link, 'source')
  const targetPort = preferredPort(link, 'target')
  const source = anchorFor(sourceBounds, sourcePort, 0)
  const target = anchorFor(targetBounds, targetPort, cueFor(link) === 'forward' ? 10 : 0)
  const blocked = obstacles.filter((obstacle) => obstacle.ownerId !== link.source && obstacle.ownerId !== link.target)
  const candidates = candidatePaths(source, target, sourceBounds, targetBounds, routeClassFor(link))
    .map(cleanPath)
    .filter((path) => path.length >= 2)
  const clean = candidates
    .map((points) => ({ points, score: routeScore(points, blocked) }))
    .filter((candidate) => candidate.score < 100000)
    .sort((a, b) => a.score - b.score)[0]

  if (!clean) return null

  return {
    id: link.id,
    kind: link.kind,
    routeClass: routeClassFor(link),
    directionCue: cueFor(link),
    sourceId: link.source,
    targetId: link.target,
    sourcePort,
    targetPort,
    points: clean.points,
  }
}

function preferredPort(link: LinkModel, end: 'source' | 'target'): PortName {
  const explicit = end === 'source' ? link.preferredSourcePort : link.preferredTargetPort
  if (explicit) return explicit
  const anchor = end === 'source' ? link.sourceAnchor : link.targetAnchor
  if (anchor && anchor !== 'center') return anchor
  if (link.kind === 'trunk') return end === 'source' ? 'downlink' : 'uplink'
  if (link.kind === 'protocol') return end === 'source' ? 'fieldbus' : 'uplink'
  if (link.kind === 'span') return end === 'source' ? 'span' : 'uplink'
  if (link.kind === 'metadata') return end === 'source' ? 'metadata' : 'right'
  return end === 'source' ? 'right' : 'left'
}

function routeClassFor(link: LinkModel): RouteClass {
  if (link.routeClass) return link.routeClass
  switch (link.kind) {
    case 'trunk':
      return 'trunk'
    case 'protocol':
      return 'protocol-bus'
    case 'span':
      return 'span-feed'
    case 'metadata':
      return 'metadata-handoff'
    case 'service':
      return 'service'
    default:
      return 'enterprise'
  }
}

function cueFor(link: LinkModel): DirectionCue {
  if (link.directionCue) return link.directionCue
  if (link.direction === 'one-way') return 'forward'
  if (link.direction === 'bidirectional') return 'none'
  if (link.direction === 'passive') return 'passive'
  return 'none'
}

function anchorFor(bounds: Box, port: PortName, arrowClearance: number): Point {
  switch (port) {
    case 'left':
    case 'metadata':
      return { x: bounds.x - arrowClearance, y: bounds.midY }
    case 'right':
    case 'service':
    case 'span':
      return { x: bounds.maxX + arrowClearance, y: bounds.midY }
    case 'top':
    case 'uplink':
      return { x: bounds.midX, y: bounds.y - arrowClearance }
    case 'bottom':
    case 'downlink':
    case 'fieldbus':
      return { x: bounds.midX, y: bounds.maxY + arrowClearance }
  }
}

function candidatePaths(source: Point, target: Point, sourceBounds: Box, targetBounds: Box, routeClass: RouteClass) {
  const midX = round((source.x + target.x) / 2)
  const midY = round((source.y + target.y) / 2)
  const leftLane = round(Math.min(sourceBounds.x, targetBounds.x) - 48)
  const rightLane = round(Math.max(sourceBounds.maxX, targetBounds.maxX) + 48)
  const topLane = round(Math.min(sourceBounds.y, targetBounds.y) - 42)
  const bottomLane = round(Math.max(sourceBounds.maxY, targetBounds.maxY) + 42)
  const paths: Point[][] = [
    [source, target],
    [source, { x: target.x, y: source.y }, target],
    [source, { x: source.x, y: target.y }, target],
    [source, { x: midX, y: source.y }, { x: midX, y: target.y }, target],
    [source, { x: source.x, y: midY }, { x: target.x, y: midY }, target],
    [source, { x: leftLane, y: source.y }, { x: leftLane, y: target.y }, target],
    [source, { x: rightLane, y: source.y }, { x: rightLane, y: target.y }, target],
    [source, { x: source.x, y: topLane }, { x: target.x, y: topLane }, target],
    [source, { x: source.x, y: bottomLane }, { x: target.x, y: bottomLane }, target],
  ]

  if (routeClass === 'protocol-bus') {
    const busY = round(Math.max(sourceBounds.maxY + 56, targetBounds.y - 30))
    paths.unshift([source, { x: source.x, y: busY }, { x: target.x, y: busY }, target])
  }

  if (routeClass === 'span-feed' || routeClass === 'metadata-handoff') {
    const laneY = routeClass === 'span-feed' ? round(Math.min(source.y, target.y) + 70) : round(Math.max(source.y, target.y) - 42)
    paths.unshift([source, { x: source.x, y: laneY }, { x: target.x, y: laneY }, target])
    if (routeClass === 'span-feed') {
      const sourceGutterX = round(sourceBounds.x - 42)
      const exteriorX = round(Math.min(sourceBounds.x, targetBounds.x) - 84)
      const stagingY = round(target.y - 110)
      const targetApproachY = round(target.y - 44)
      paths.unshift([
        source,
        { x: sourceGutterX, y: source.y },
        { x: sourceGutterX, y: stagingY },
        { x: exteriorX, y: stagingY },
        { x: exteriorX, y: target.y },
        target,
      ])
      paths.unshift([
        source,
        { x: sourceGutterX, y: source.y },
        { x: sourceGutterX, y: targetApproachY },
        { x: target.x, y: targetApproachY },
        target,
      ])
      paths.unshift([source, { x: sourceGutterX, y: source.y }, { x: sourceGutterX, y: target.y }, target])
    }
  }

  return paths
}

function routeScore(points: Point[], obstacles: Obstacle[]) {
  if (segmentsFor(points).some((segment) => !isOrthogonal(segment.a, segment.b))) return 100000
  let score = routeLength(points) + bends(points) * 18
  for (const obstacle of obstacles) {
    if (routeHitsBox(points, obstacle.box, ROUTE_CLEARANCE)) return 100000
    score += nearMissPenalty(points, obstacle.box)
  }
  return score
}

function placeRouteLabel(route: RouteLayout, obstacles: Obstacle[]): RouteLabelLayout | undefined {
  const text = labelForRoute(route)
  if (!text) return undefined
  const w = Math.max(58, Math.min(190, text.length * 7 + LABEL_W_PAD))
  const segments = segmentsFor(route.points)
    .map((segment) => ({ ...segment, length: distance(segment.a, segment.b) }))
    .filter((segment) => segment.length > w + 24)
    .sort((a, b) => b.length - a.length)

  for (const segment of segments) {
    const center = midpoint(segment.a, segment.b)
    const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
    const offsets = horizontal ? [-LABEL_H - LABEL_GAP, LABEL_GAP, -LABEL_H - 32, 32] : [LABEL_GAP, -w - LABEL_GAP, 28, -w - 28]
    for (const offset of offsets) {
      const box = horizontal
        ? new Box(center.x - w / 2, center.y + offset, w, LABEL_H)
        : new Box(center.x + offset, center.y - LABEL_H / 2, w, LABEL_H)
      if (boxIntersectsAny(box.clone().expandBy(4), obstacles)) continue
      return { id: `${route.id}-label`, linkId: route.id, text, x: round(box.x), y: round(box.y), w, h: LABEL_H }
    }
  }

  return undefined
}

function labelForRoute(route: RouteLayout) {
  if (route.kind === 'service' || route.kind === 'enterprise' || route.kind === 'protocol') return ''
  const link = links.find((item) => item.id === route.id)
  return link?.label ?? ''
}

function boxIntersectsAny(box: Box, obstacles: Obstacle[]) {
  return obstacles.some((obstacle) => obstacle.box.collides(box))
}

function routeHitsBox(points: Point[], box: Box, clearance: number) {
  const target = box.clone().expandBy(clearance)
  return segmentsFor(points).some((segment) => segmentHitsBox(segment.a, segment.b, target))
}

function segmentHitsBox(a: Point, b: Point, box: Box) {
  if (Math.abs(a.x - b.x) < 0.5) {
    const y1 = Math.min(a.y, b.y)
    const y2 = Math.max(a.y, b.y)
    return a.x >= box.x && a.x <= box.maxX && y2 >= box.y && y1 <= box.maxY
  }
  if (Math.abs(a.y - b.y) < 0.5) {
    const x1 = Math.min(a.x, b.x)
    const x2 = Math.max(a.x, b.x)
    return a.y >= box.y && a.y <= box.maxY && x2 >= box.x && x1 <= box.maxX
  }
  return false
}

function isOrthogonal(a: Point, b: Point) {
  return Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5
}

function nearMissPenalty(points: Point[], box: Box) {
  let penalty = 0
  for (const segment of segmentsFor(points)) {
    const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
    if (horizontal && segment.a.y > box.y - 26 && segment.a.y < box.maxY + 26) penalty += 8
    if (!horizontal && segment.a.x > box.x - 26 && segment.a.x < box.maxX + 26) penalty += 8
  }
  return penalty
}

function cleanPath(points: Point[]) {
  const rounded = points.map((point) => ({ x: round(point.x), y: round(point.y) }))
  const deduped = rounded.filter((point, index) => {
    const prev = rounded[index - 1]
    return !prev || Math.abs(prev.x - point.x) > 0.5 || Math.abs(prev.y - point.y) > 0.5
  })
  return deduped.filter((point, index) => {
    const prev = deduped[index - 1]
    const next = deduped[index + 1]
    if (!prev || !next) return true
    return !((prev.x === point.x && point.x === next.x) || (prev.y === point.y && point.y === next.y))
  })
}

function segmentsFor(points: Point[]) {
  const segments: Array<{ a: Point; b: Point }> = []
  for (let index = 1; index < points.length; index += 1) {
    segments.push({ a: points[index - 1], b: points[index] })
  }
  return segments
}

function routeLength(points: Point[]) {
  return segmentsFor(points).reduce((total, segment) => total + distance(segment.a, segment.b), 0)
}

function bends(points: Point[]) {
  return Math.max(0, points.length - 2)
}

function distance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function round(value: number) {
  return Math.round(value)
}
