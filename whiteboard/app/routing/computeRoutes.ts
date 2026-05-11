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
  type RouteLabelPolicy,
} from '../model/topology'
import type { StepModel } from '../model/steps'
import type { Obstacle, Point, RouteLabelLayout, RouteLayout, RouteSceneLayout } from './types'

const DEVICE_CLEARANCE = 24
const HEADER_CLEARANCE = 8
const ROUTE_CLEARANCE = 7
const ROUTE_BUNDLE_CLEARANCE = 5
const ENDPOINT_STUB = 38
const LABEL_W_PAD = 34
const LABEL_H = 24
const LABEL_GAP = 16
const GRID_LIMIT = 58
const SEARCH_LIMIT = 5000

export function computeRouteScene(editor: Editor, step: StepModel): RouteSceneLayout {
  const visibleEntityIds = new Set(step.visibleEntities)
  const visibleZoneIds = new Set(step.visibleZones)
  const visibleLinkIds = new Set(step.visibleLinks)
  const obstacles = buildObstacles(editor, visibleEntityIds, visibleZoneIds)
  const routes: RouteLayout[] = []
  const labels: RouteLabelLayout[] = []
  const errors: string[] = []
  const warnings: string[] = []

  for (const link of links) {
    if (!visibleLinkIds.has(link.id)) continue
    const route = routeLink(editor, link, obstacles, routes)
    if (!route) {
      errors.push(`${link.id} could not route around visible entities`)
      continue
    }
    routes.push(route)
  }

  const labelObstacles = [...obstacles]
  for (const route of routes) {
    const label = placeRouteLabel(route, labelObstacles, step)
    if (label) {
      route.label = label
      labels.push(label)
      labelObstacles.push({
        id: label.id,
        kind: 'label',
        box: new Box(label.x, label.y, label.w, label.h).expandBy(5),
        ownerId: route.id,
      })
    }
  }

  for (const route of routes) {
    for (const obstacle of labelObstacles) {
      if (obstacle.ownerId === route.sourceId || obstacle.ownerId === route.targetId || obstacle.ownerId === route.id) continue
      if (routeHitsBox(route.points, obstacle.box, ROUTE_CLEARANCE)) {
        errors.push(`${route.id} crosses ${obstacle.id}`)
        break
      }
    }
  }

  const routeConflicts = countRouteConflicts(routes)
  if (routeConflicts.errors.length) errors.push(...routeConflicts.errors)
  if (routeConflicts.warnings.length) warnings.push(...routeConflicts.warnings)

  return {
    routes,
    labels,
    errors,
    warnings,
    quality: {
      visibleRoutes: routes.length,
      visibleLabels: labels.length,
      bends: routes.reduce((total, route) => total + bends(route.points), 0),
      crossings: routeConflicts.crossings,
    },
  }
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
      box: new Box(bounds.x + 10, bounds.y + 8, Math.min(330, bounds.w - 20), 52).expandBy(HEADER_CLEARANCE),
      ownerId: zone.id,
    })
  }

  return obstacles
}

function routeLink(editor: Editor, link: LinkModel, obstacles: Obstacle[], routed: RouteLayout[]): RouteLayout | null {
  const sourceBounds = editor.getShapePageBounds(shapeIdForEntity(link.source))
  const targetBounds = editor.getShapePageBounds(shapeIdForEntity(link.target))
  if (!sourceBounds || !targetBounds) return null

  const sourcePort = preferredPort(link, 'source')
  const targetPort = preferredPort(link, 'target')
  const source = anchorFor(sourceBounds, sourcePort, cueFor(link) === 'reverse' ? 10 : 0)
  const target = anchorFor(targetBounds, targetPort, cueFor(link) === 'forward' || cueFor(link) === 'passive' ? 12 : 0)
  const start = endpointStub(source, sourcePort)
  const end = endpointStub(target, targetPort)
  const blocked = obstacles.filter((obstacle) => obstacle.ownerId !== link.source && obstacle.ownerId !== link.target)
  const routeClass = routeClassFor(link)
  const grid = buildRouteGrid({ source, start, end, target }, sourceBounds, targetBounds, blocked, routeClass)
  const core = searchGridRoute(start, end, grid, blocked, routeClass, routed)
  if (!core) return null

  const points = cleanPath([source, ...core, target])
  if (!terminalSegmentsRespectPorts(points, sourcePort, targetPort)) return null
  if (routeScore(points, blocked, routeClass, routed) >= 100000) return null

  return {
    id: link.id,
    kind: link.kind,
    routeClass,
    directionCue: cueFor(link),
    sourceId: link.source,
    targetId: link.target,
    sourcePort,
    targetPort,
    points,
  }
}

function buildRouteGrid(
  endpoints: { source: Point; start: Point; end: Point; target: Point },
  sourceBounds: Box,
  targetBounds: Box,
  obstacles: Obstacle[],
  routeClass: RouteClass
) {
  const xs = new Set<number>([endpoints.source.x, endpoints.start.x, endpoints.end.x, endpoints.target.x])
  const ys = new Set<number>([endpoints.source.y, endpoints.start.y, endpoints.end.y, endpoints.target.y])
  const ownerBounds = [sourceBounds, targetBounds]

  for (const bounds of ownerBounds) {
    addAxis(xs, bounds.x - ENDPOINT_STUB, bounds.x - 54, bounds.midX, bounds.maxX + 54, bounds.maxX + ENDPOINT_STUB)
    addAxis(ys, bounds.y - ENDPOINT_STUB, bounds.y - 54, bounds.midY, bounds.maxY + 54, bounds.maxY + ENDPOINT_STUB)
  }

  for (const obstacle of obstacles) {
    addAxis(xs, obstacle.box.x - 28, obstacle.box.x - 12, obstacle.box.midX, obstacle.box.maxX + 12, obstacle.box.maxX + 28)
    addAxis(ys, obstacle.box.y - 28, obstacle.box.y - 12, obstacle.box.midY, obstacle.box.maxY + 12, obstacle.box.maxY + 28)
  }

  const lane = laneCoordinates(endpoints, sourceBounds, targetBounds, routeClass)
  addAxis(xs, ...lane.xs)
  addAxis(ys, ...lane.ys)

  return {
    xs: limitAxis(xs, endpoints.start.x, endpoints.end.x),
    ys: limitAxis(ys, endpoints.start.y, endpoints.end.y),
  }
}

function searchGridRoute(
  start: Point,
  end: Point,
  grid: { xs: number[]; ys: number[] },
  obstacles: Obstacle[],
  routeClass: RouteClass,
  routed: RouteLayout[]
) {
  const startKey = key(start)
  const endKey = key(end)
  const open = new Map<string, SearchNode>()
  const closed = new Set<string>()
  const first: SearchNode = { point: start, cost: 0, estimate: distance(start, end), previous: undefined, direction: undefined, bends: 0 }
  open.set(startKey, first)
  let iterations = 0

  while (open.size && iterations < SEARCH_LIMIT) {
    iterations += 1
    const current = bestNode(open)
    const currentKey = key(current.point)
    open.delete(currentKey)
    if (currentKey === endKey) return reconstruct(current)
    closed.add(currentKey)

    for (const next of neighbors(current.point, grid)) {
      const nextKey = key(next)
      if (closed.has(nextKey)) continue
      if (routeSegmentBlocked(current.point, next, obstacles)) continue
      const direction = segmentDirection(current.point, next)
      const bendPenalty = current.direction && current.direction !== direction ? 30 : 0
      const routePenalty = routeSegmentPenalty(current.point, next, routeClass, routed)
      if (routePenalty >= 100000) continue
      const nextCost = current.cost + distance(current.point, next) + bendPenalty + routePenalty
      const known = open.get(nextKey)
      if (known && known.cost <= nextCost) continue
      open.set(nextKey, {
        point: next,
        cost: nextCost,
        estimate: distance(next, end),
        previous: current,
        direction,
        bends: current.bends + (bendPenalty ? 1 : 0),
      })
    }
  }

  return directFallback(start, end, obstacles)
}

function directFallback(start: Point, end: Point, obstacles: Obstacle[]) {
  const midX = round((start.x + end.x) / 2)
  const midY = round((start.y + end.y) / 2)
  const candidates = [
    [start, { x: end.x, y: start.y }, end],
    [start, { x: start.x, y: end.y }, end],
    [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end],
    [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end],
  ].map(cleanPath)

  return candidates.find((points) => !routeHitsAny(points, obstacles, ROUTE_CLEARANCE)) ?? null
}

interface SearchNode {
  point: Point
  cost: number
  estimate: number
  previous?: SearchNode
  direction?: 'h' | 'v'
  bends: number
}

function bestNode(open: Map<string, SearchNode>) {
  let best: SearchNode | undefined
  for (const node of open.values()) {
    if (!best || node.cost + node.estimate + node.bends * 6 < best.cost + best.estimate + best.bends * 6) best = node
  }
  return best!
}

function reconstruct(node: SearchNode) {
  const points: Point[] = []
  let current: SearchNode | undefined = node
  while (current) {
    points.push(current.point)
    current = current.previous
  }
  return cleanPath(points.reverse())
}

function neighbors(point: Point, grid: { xs: number[]; ys: number[] }) {
  const result: Point[] = []
  const xIndex = grid.xs.indexOf(point.x)
  const yIndex = grid.ys.indexOf(point.y)
  if (xIndex > 0) result.push({ x: grid.xs[xIndex - 1], y: point.y })
  if (xIndex >= 0 && xIndex < grid.xs.length - 1) result.push({ x: grid.xs[xIndex + 1], y: point.y })
  if (yIndex > 0) result.push({ x: point.x, y: grid.ys[yIndex - 1] })
  if (yIndex >= 0 && yIndex < grid.ys.length - 1) result.push({ x: point.x, y: grid.ys[yIndex + 1] })
  return result
}

function laneCoordinates(endpoints: { start: Point; end: Point }, sourceBounds: Box, targetBounds: Box, routeClass: RouteClass) {
  const top = round(Math.min(sourceBounds.y, targetBounds.y) - 58)
  const bottom = round(Math.max(sourceBounds.maxY, targetBounds.maxY) + 58)
  const left = round(Math.min(sourceBounds.x, targetBounds.x) - 70)
  const right = round(Math.max(sourceBounds.maxX, targetBounds.maxX) + 70)
  const middleX = round((endpoints.start.x + endpoints.end.x) / 2)
  const middleY = round((endpoints.start.y + endpoints.end.y) / 2)

  if (routeClass === 'protocol-bus') {
    const busY = round(Math.max(sourceBounds.maxY + 72, targetBounds.y - 44))
    return { xs: [left, right, middleX], ys: [busY, busY - 18, busY + 18, bottom] }
  }
  if (routeClass === 'span-feed') {
    return { xs: [left, left - 52, middleX], ys: [top, bottom, middleY] }
  }
  if (routeClass === 'metadata-handoff') {
    return { xs: [left, left - 72, middleX], ys: [bottom, bottom + 36, middleY] }
  }
  if (routeClass === 'trunk') {
    return { xs: [middleX], ys: [middleY] }
  }
  return { xs: [left, right, middleX], ys: [top, bottom, middleY] }
}

function routeSegmentBlocked(a: Point, b: Point, obstacles: Obstacle[]) {
  return obstacles.some((obstacle) => segmentHitsBox(a, b, obstacle.box.clone().expandBy(ROUTE_CLEARANCE)))
}

function routeSegmentPenalty(a: Point, b: Point, routeClass: RouteClass, routed: RouteLayout[]) {
  let penalty = 0
  for (const route of routed) {
    for (const segment of segmentsFor(route.points)) {
      if (segmentsOverlap(a, b, segment.a, segment.b)) {
        if (route.routeClass === routeClass) penalty += 22
        else return 100000
      }
      if (segmentsCross(a, b, segment.a, segment.b)) {
        if (route.routeClass === routeClass) penalty += 140
        else return 100000
      }
    }
  }
  return penalty
}

function routeScore(points: Point[], obstacles: Obstacle[], routeClass: RouteClass, routed: RouteLayout[]) {
  if (segmentsFor(points).some((segment) => !isOrthogonal(segment.a, segment.b))) return 100000
  if (routeHitsAny(points, obstacles, ROUTE_CLEARANCE)) return 100000
  let score = routeLength(points) + bends(points) * 28
  for (const obstacle of obstacles) score += nearMissPenalty(points, obstacle.box)
  for (const route of routed) score += routeSegmentPenaltyForPath(points, routeClass, route)
  return score
}

function routeSegmentPenaltyForPath(points: Point[], routeClass: RouteClass, route: RouteLayout) {
  let penalty = 0
  for (const segment of segmentsFor(points)) {
    const segmentPenalty = routeSegmentPenalty(segment.a, segment.b, routeClass, [route])
    if (segmentPenalty >= 100000) return 100000
    penalty += segmentPenalty
  }
  return penalty
}

function preferredPort(link: LinkModel, end: 'source' | 'target'): PortName {
  const explicit = end === 'source' ? link.sourcePort ?? link.preferredSourcePort : link.targetPort ?? link.preferredTargetPort
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

function endpointStub(point: Point, port: PortName): Point {
  const vector = outwardVector(port)
  return { x: round(point.x + vector.x * ENDPOINT_STUB), y: round(point.y + vector.y * ENDPOINT_STUB) }
}

function terminalSegmentsRespectPorts(points: Point[], sourcePort: PortName, targetPort: PortName) {
  if (points.length < 4) return false
  return firstSegmentLeavesPort(points[0], points[1], sourcePort) && lastSegmentEntersPort(points[points.length - 2], points[points.length - 1], targetPort)
}

function firstSegmentLeavesPort(source: Point, next: Point, port: PortName) {
  return directionMatches(source, next, outwardVector(port))
}

function lastSegmentEntersPort(prev: Point, target: Point, port: PortName) {
  return directionMatches(target, prev, outwardVector(port))
}

function directionMatches(origin: Point, next: Point, vector: Point) {
  if (vector.x !== 0) return Math.abs(origin.y - next.y) < 0.5 && (next.x - origin.x) * vector.x > 0
  return Math.abs(origin.x - next.x) < 0.5 && (next.y - origin.y) * vector.y > 0
}

function outwardVector(port: PortName): Point {
  switch (port) {
    case 'left':
    case 'metadata':
      return { x: -1, y: 0 }
    case 'right':
    case 'service':
    case 'span':
      return { x: 1, y: 0 }
    case 'top':
    case 'uplink':
      return { x: 0, y: -1 }
    case 'bottom':
    case 'downlink':
    case 'fieldbus':
      return { x: 0, y: 1 }
  }
}

function placeRouteLabel(route: RouteLayout, obstacles: Obstacle[], step: StepModel): RouteLabelLayout | undefined {
  const text = labelForRoute(route, step)
  if (!text) return undefined
  const w = Math.max(70, Math.min(210, text.length * 7 + LABEL_W_PAD))
  const segments = segmentsFor(route.points)
    .map((segment) => ({ ...segment, length: distance(segment.a, segment.b) }))
    .filter((segment) => segment.length > w + 36)
    .sort((a, b) => labelSegmentPreference(b, route) - labelSegmentPreference(a, route))

  for (const segment of segments) {
    const center = midpoint(segment.a, segment.b)
    const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
    const offsets = horizontal ? [-LABEL_H - LABEL_GAP, LABEL_GAP, -LABEL_H - 34, 34] : [LABEL_GAP, -w - LABEL_GAP, 30, -w - 30]
    for (const offset of offsets) {
      const box = horizontal
        ? new Box(center.x - w / 2, center.y + offset, w, LABEL_H)
        : new Box(center.x + offset, center.y - LABEL_H / 2, w, LABEL_H)
      if (boxIntersectsAny(box.clone().expandBy(6), obstacles)) continue
      return { id: `${route.id}-label`, linkId: route.id, text, x: round(box.x), y: round(box.y), w, h: LABEL_H }
    }
  }

  return undefined
}

function labelSegmentPreference(segment: { a: Point; b: Point; length: number }, route: RouteLayout) {
  const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
  let score = segment.length
  if (horizontal) score += 90
  if (route.routeClass === 'protocol-bus' && horizontal) score += 120
  if (route.routeClass === 'span-feed' && horizontal) score += 70
  if (route.routeClass === 'metadata-handoff' && horizontal) score += 80
  return score
}

function labelForRoute(route: RouteLayout, step: StepModel) {
  const link = links.find((item) => item.id === route.id)
  if (!link?.label) return ''
  const policy = labelPolicyFor(link)
  if (policy === 'none') return ''
  if (policy === 'first-visible' && !step.introduced?.includes(route.id)) return ''
  return link.label
}

function labelPolicyFor(link: LinkModel): RouteLabelPolicy {
  if (link.labelPolicy) return link.labelPolicy
  if (link.kind === 'trunk') return 'first-visible'
  if (link.kind === 'protocol' || link.kind === 'span' || link.kind === 'metadata') return 'always'
  return 'none'
}

function boxIntersectsAny(box: Box, obstacles: Obstacle[]) {
  return obstacles.some((obstacle) => obstacle.box.collides(box))
}

function routeHitsAny(points: Point[], obstacles: Obstacle[], clearance: number) {
  return obstacles.some((obstacle) => routeHitsBox(points, obstacle.box, clearance))
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
    if (horizontal && segment.a.y > box.y - 34 && segment.a.y < box.maxY + 34) penalty += 14
    if (!horizontal && segment.a.x > box.x - 34 && segment.a.x < box.maxX + 34) penalty += 14
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
  for (let index = 1; index < points.length; index += 1) segments.push({ a: points[index - 1], b: points[index] })
  return segments
}

function countRouteConflicts(routes: RouteLayout[]) {
  const errors: string[] = []
  const warnings: string[] = []
  let crossings = 0

  for (let aIndex = 0; aIndex < routes.length; aIndex += 1) {
    const a = routes[aIndex]
    for (let bIndex = aIndex + 1; bIndex < routes.length; bIndex += 1) {
      const b = routes[bIndex]
      const related = a.sourceId === b.sourceId || a.sourceId === b.targetId || a.targetId === b.sourceId || a.targetId === b.targetId
      for (const aSegment of segmentsFor(a.points)) {
        for (const bSegment of segmentsFor(b.points)) {
          if (segmentsOverlap(aSegment.a, aSegment.b, bSegment.a, bSegment.b)) {
            if (!related && a.routeClass !== b.routeClass) errors.push(`${a.id} overlaps unrelated ${b.id}`)
          } else if (segmentsCross(aSegment.a, aSegment.b, bSegment.a, bSegment.b)) {
            crossings += 1
            if (!related && a.routeClass !== b.routeClass) errors.push(`${a.id} crosses unrelated ${b.id}`)
            else warnings.push(`${a.id} crosses ${b.id}`)
          }
        }
      }
    }
  }

  return { crossings, errors: unique(errors), warnings: unique(warnings) }
}

function segmentsOverlap(a1: Point, a2: Point, b1: Point, b2: Point) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.5
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.5
  if (aHorizontal !== bHorizontal) return false
  if (aHorizontal) {
    if (Math.abs(a1.y - b1.y) > ROUTE_BUNDLE_CLEARANCE) return false
    return rangesOverlap(Math.min(a1.x, a2.x), Math.max(a1.x, a2.x), Math.min(b1.x, b2.x), Math.max(b1.x, b2.x), 8)
  }
  if (Math.abs(a1.x - b1.x) > ROUTE_BUNDLE_CLEARANCE) return false
  return rangesOverlap(Math.min(a1.y, a2.y), Math.max(a1.y, a2.y), Math.min(b1.y, b2.y), Math.max(b1.y, b2.y), 8)
}

function segmentsCross(a1: Point, a2: Point, b1: Point, b2: Point) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.5
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.5
  if (aHorizontal === bHorizontal) return false
  const h1 = aHorizontal ? a1 : b1
  const h2 = aHorizontal ? a2 : b2
  const v1 = aHorizontal ? b1 : a1
  const v2 = aHorizontal ? b2 : a2
  const hMin = Math.min(h1.x, h2.x)
  const hMax = Math.max(h1.x, h2.x)
  const vMin = Math.min(v1.y, v2.y)
  const vMax = Math.max(v1.y, v2.y)
  return v1.x > hMin + 8 && v1.x < hMax - 8 && h1.y > vMin + 8 && h1.y < vMax - 8
}

function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number, clearance: number) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin) > clearance
}

function routeLength(points: Point[]) {
  return segmentsFor(points).reduce((total, segment) => total + distance(segment.a, segment.b), 0)
}

function bends(points: Point[]) {
  let count = 0
  for (let index = 2; index < points.length; index += 1) {
    const prev = segmentDirection(points[index - 2], points[index - 1])
    const next = segmentDirection(points[index - 1], points[index])
    if (prev !== next) count += 1
  }
  return count
}

function segmentDirection(a: Point, b: Point): 'h' | 'v' {
  return Math.abs(a.y - b.y) < 0.5 ? 'h' : 'v'
}

function distance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function addAxis(axis: Set<number>, ...values: number[]) {
  for (const value of values) {
    if (Number.isFinite(value)) axis.add(round(value))
  }
}

function limitAxis(values: Set<number>, a: number, b: number) {
  const sorted = [...values].sort((left, right) => left - right)
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  const important = new Set([round(a), round(b)])
  const between = sorted.filter((value) => value >= min - 340 && value <= max + 340)
  const sampled = between.length > GRID_LIMIT ? sampleAxis(between, GRID_LIMIT, important) : between
  return unique([...sampled, ...important]).sort((left, right) => left - right)
}

function sampleAxis(values: number[], limit: number, important: Set<number>) {
  const result = new Set<number>(important)
  const step = Math.ceil(values.length / limit)
  for (let index = 0; index < values.length; index += step) result.add(values[index])
  for (const value of values) {
    if (result.size >= limit) break
    result.add(value)
  }
  return [...result]
}

function key(point: Point) {
  return `${round(point.x)},${round(point.y)}`
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}

function round(value: number) {
  return Math.round(value)
}
