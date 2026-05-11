import type { BoardLayout } from '../engine/diagramModel'
import {
  cleanPath,
  distance,
  inflate,
  rectMaxX,
  rectMaxY,
  rectMidX,
  rectMidY,
  segmentIntersectsRect,
  segmentsCross,
  segmentsFor,
  segmentsOverlap,
} from '../engine/geometry'
import { links, type DirectionCue, type LinkModel, type PortName, type RouteClass, type RouteLabelPolicy } from '../model/topology'
import type { StepModel } from '../model/steps'
import type { Obstacle, Point, Rect, RouteLabelLayout, RouteLayout, RouteSceneLayout } from './types'

const ROUTE_CLEARANCE = 14
const DEVICE_CLEARANCE = 18
const HEADER_CLEARANCE = 6
const ENDPOINT_STUB = 32
const LABEL_W_PAD = 36
const LABEL_H = 24
const LABEL_H_COMPACT = 34
const LABEL_GAP = 14
const GRID_LIMIT = 72
const SEARCH_LIMIT = 8000

export function computeRouteScene(layout: BoardLayout, step: StepModel): RouteSceneLayout {
  const hiddenIds = new Set(step.hidden ?? [])
  const visibleEntityIds = new Set(step.visibleEntities.filter((id) => !hiddenIds.has(id)))
  const visibleZoneIds = new Set(step.visibleZones.filter((id) => !hiddenIds.has(id)))
  const visibleLinkIds = new Set(step.visibleLinks)
  const obstacles = buildObstacles(layout, visibleEntityIds, visibleZoneIds)
  const routes: RouteLayout[] = []
  const labels: RouteLabelLayout[] = []
  const errors: string[] = []
  const warnings: string[] = []

  for (const link of links) {
    if (!visibleLinkIds.has(link.id)) continue
    if (!visibleEntityIds.has(link.source) || !visibleEntityIds.has(link.target)) {
      errors.push(`${link.id} is visible before both endpoints`)
      continue
    }
    const route = routeLink(layout, link, obstacles, routes)
    if (!route) {
      errors.push(`${link.id} could not route around visible entities`)
      continue
    }
    routes.push(route)
  }

  const labelObstacles = [...obstacles]
  for (const route of routes) {
    const label = placeRouteLabel(route, labelObstacles, step, routes)
    if (label) {
      route.label = label
      labels.push(label)
      labelObstacles.push({ id: label.id, kind: 'label', box: inflate(label, 6), ownerId: route.id })
    }
  }

  for (const route of routes) {
    for (const obstacle of labelObstacles) {
      if (obstacle.ownerId === route.sourceId || obstacle.ownerId === route.targetId || obstacle.ownerId === route.id) continue
      const ownerRoute = routes.find((item) => item.id === obstacle.ownerId)
      if (obstacle.kind === 'zone-header' && (route.routeClass === 'trunk' || route.routeClass === 'protocol-bus' || route.routeClass === 'span-feed')) continue
      if (obstacle.kind === 'label' && ownerRoute?.routeClass === route.routeClass && route.routeClass === 'protocol-bus') continue
      if (routeHitsBox(route.points, obstacle.box, ROUTE_CLEARANCE)) {
        errors.push(`${route.id} crosses ${obstacle.id}`)
        break
      }
    }
  }

  const routeConflicts = countRouteConflicts(routes)
  errors.push(...routeConflicts.errors)
  warnings.push(...routeConflicts.warnings)

  return {
    routes,
    labels,
    errors: unique(errors),
    warnings: unique(warnings),
    quality: {
      visibleRoutes: routes.length,
      visibleLabels: labels.length,
      bends: routes.reduce((total, route) => total + bendCount(route.points), 0),
      crossings: routeConflicts.crossings,
    },
  }
}

function buildObstacles(layout: BoardLayout, visibleEntityIds: Set<string>, visibleZoneIds: Set<string>) {
  const obstacles: Obstacle[] = []
  for (const id of visibleEntityIds) {
    const box = layout.entityBoxes[id]
    if (box) obstacles.push({ id, kind: 'device', box: inflate(box, DEVICE_CLEARANCE), ownerId: id })
  }
  for (const id of visibleZoneIds) {
    const box = layout.headerBoxes[id]
    if (box) obstacles.push({ id: `${id}-header`, kind: 'zone-header', box: inflate(box, HEADER_CLEARANCE), ownerId: id })
  }
  return obstacles
}

function routeLink(layout: BoardLayout, link: LinkModel, obstacles: Obstacle[], routed: RouteLayout[]) {
  const sourceBounds = layout.entityBoxes[link.source]
  const targetBounds = layout.entityBoxes[link.target]
  if (!sourceBounds || !targetBounds) return null
  const routeClass = routeClassFor(link)
  const sourcePort = preferredPort(link, 'source')
  const targetPort = preferredPort(link, 'target')
  const source = anchorFor(sourceBounds, sourcePort, cueFor(link) === 'reverse' ? 10 : 0)
  const target = anchorFor(targetBounds, targetPort, cueFor(link) === 'forward' || cueFor(link) === 'passive' ? 10 : 0)
  const start = endpointStub(source, sourcePort, routeClass)
  const end = endpointStub(target, targetPort, routeClass)
  const blocked = obstacles.filter((obstacle) => {
    if (obstacle.ownerId === link.source || obstacle.ownerId === link.target) return false
    if ((routeClass === 'trunk' || routeClass === 'protocol-bus' || routeClass === 'span-feed') && obstacle.kind === 'zone-header') return false
    return true
  })

  const routeOwner = { sourceId: link.source, targetId: link.target }
  const semantic = semanticRoute(link, routeClass, source, start, end, target, sourceBounds, targetBounds, blocked, routed)
  if (semantic) return semantic

  const grid = buildRouteGrid({ source, start, end, target }, sourceBounds, targetBounds, blocked, routeClass, layout)
  const core = searchGridRoute(start, end, grid, blocked, routeClass, routed)
  if (!core) return null

  const points = cleanPath([source, ...core, target])
  if (!terminalSegmentsRespectPorts(points, sourcePort, targetPort)) return null
  if (routeScore(points, blocked, routeClass, routed, routeOwner) >= 100000) return null

  return routeFrom(link, routeClass, sourcePort, targetPort, points)
}

function semanticRoute(
  link: LinkModel,
  routeClass: RouteClass,
  source: Point,
  start: Point,
  end: Point,
  target: Point,
  sourceBounds: Rect,
  targetBounds: Rect,
  obstacles: Obstacle[],
  routed: RouteLayout[]
) {
  const sourcePort = preferredPort(link, 'source')
  const targetPort = preferredPort(link, 'target')
  const candidates: Point[][] = []

  const straight = straightHorizontalCandidate(sourceBounds, targetBounds, sourcePort, targetPort, cueFor(link))
  if (straight && (routeClass === 'enterprise' || routeClass === 'service')) candidates.push(straight)

  if (routeClass === 'trunk') {
    const x = Math.round((start.x + end.x) / 2)
    candidates.push([source, start, { x, y: start.y }, { x, y: end.y }, end, target])
  }

  if (routeClass === 'service') {
    const dynamic = dynamicServiceCandidate(sourceBounds, targetBounds, source, sourcePort, targetPort, cueFor(link))
    if (dynamic) candidates.push(dynamic)
  }

  if (routeClass === 'protocol-bus') {
    const vertical = straightVerticalCandidate(sourceBounds, targetBounds, sourcePort, targetPort, cueFor(link), routeClass)
    if (vertical) candidates.push(vertical)
    const busY = Math.round(Math.max(rectMaxY(sourceBounds) + 72, targetBounds.y - 22))
    candidates.push([source, start, { x: start.x, y: busY }, { x: end.x, y: busY }, end, target])
  }

  if (routeClass === 'span-feed') {
    if (link.source.startsWith('sensor-') && link.target === 'sitestore') {
      const vertical = straightVerticalCandidate(sourceBounds, targetBounds, sourcePort, targetPort, cueFor(link), routeClass)
      if (vertical) candidates.push(vertical)
      const controlSensor = obstacles.find((obstacle) => obstacle.id === 'sensor-control')?.box
      const topLaneY = Math.round(Math.min(sourceBounds.y, targetBounds.y) - 52)
      const lowerLaneY = Math.round(Math.max(rectMaxY(sourceBounds) + 42, targetBounds.y - 34))
      const rightOfSensorsX = Math.round(Math.max(rectMaxX(sourceBounds), controlSensor ? rectMaxX(controlSensor) : rectMaxX(sourceBounds)) + 38)
      const sourceExit = sourcePort === 'top' || sourcePort === 'uplink' ? { x: source.x, y: topLaneY } : start
      candidates.push(
        link.source === 'sensor-boundary'
          ? [source, sourceExit, { x: rightOfSensorsX, y: sourceExit.y }, { x: rightOfSensorsX, y: lowerLaneY }, { x: end.x, y: lowerLaneY }, end, target]
          : [source, start, { x: rightOfSensorsX, y: start.y }, { x: rightOfSensorsX, y: lowerLaneY }, { x: end.x, y: lowerLaneY }, end, target]
      )
    }
    if (!(link.source.startsWith('sensor-') && link.target === 'sitestore')) {
      const directCollection = directLateralSpanCandidate(source, start, end, target, sourceBounds, targetBounds, sourcePort, targetPort)
      if (directCollection) candidates.push(directCollection)
      const topLane = Math.round(Math.max(rectMaxY(sourceBounds) + 58, targetBounds.y - 46))
      const bottomLane = Math.round(Math.max(rectMaxY(sourceBounds) + 82, rectMaxY(targetBounds) + 36))
      const leftLane = Math.round(Math.min(sourceBounds.x, targetBounds.x) - 88)
      const rightLane = Math.round(Math.max(rectMaxX(sourceBounds), rectMaxX(targetBounds)) + 88)
      const obstacleLeftLane = Math.round(Math.min(...obstacles.map((obstacle) => obstacle.box.x), sourceBounds.x, targetBounds.x) - 42)
      const obstacleRightLane = Math.round(Math.max(...obstacles.map((obstacle) => rectMaxX(obstacle.box)), rectMaxX(sourceBounds), rectMaxX(targetBounds)) + 42)
      for (const x of [leftLane, rightLane]) {
        for (const y of [topLane, bottomLane]) {
          candidates.push([source, start, { x: start.x, y }, { x, y }, { x, y: end.y }, end, target])
        }
      }
      for (const x of [obstacleLeftLane, obstacleRightLane]) {
        candidates.push([source, start, { x: start.x, y: bottomLane }, { x, y: bottomLane }, { x, y: end.y }, end, target])
      }
    }
  }

  if (routeClass === 'metadata-handoff') {
    if (link.id === 'sitestore-centralstore') {
      const directY = Math.round(source.y)
      candidates.push([source, start, { x: end.x, y: directY }, end, target])
    }
    const y = Math.round(Math.max(rectMaxY(sourceBounds), rectMaxY(targetBounds)) + 54)
    candidates.push([source, start, { x: start.x, y }, { x: end.x, y }, end, target])
  }

  const best = candidates
    .map(cleanPath)
    .filter((points) => terminalSegmentsRespectPorts(points, sourcePort, targetPort))
    .map((points) => ({ points, score: routeScore(points, obstacles, routeClass, routed, { sourceId: link.source, targetId: link.target }) }))
    .filter((candidate) => candidate.score < 100000)
    .sort((a, b) => a.score - b.score)[0]

  return best ? routeFrom(link, routeClass, sourcePort, targetPort, best.points) : null
}

function straightHorizontalCandidate(sourceBounds: Rect, targetBounds: Rect, sourcePort: PortName, targetPort: PortName, cue: DirectionCue) {
  const sourceRight = sourcePort === 'right' || sourcePort === 'service' || sourcePort === 'span'
  const sourceLeft = sourcePort === 'left' || sourcePort === 'metadata'
  const targetRight = targetPort === 'right' || targetPort === 'service' || targetPort === 'span'
  const targetLeft = targetPort === 'left' || targetPort === 'metadata'
  const leftToRight = sourceRight && targetLeft && rectMaxX(sourceBounds) <= targetBounds.x
  const rightToLeft = sourceLeft && targetRight && rectMaxX(targetBounds) <= sourceBounds.x
  if (!leftToRight && !rightToLeft) return null

  const yMin = Math.max(sourceBounds.y + 18, targetBounds.y + 18)
  const yMax = Math.min(rectMaxY(sourceBounds) - 18, rectMaxY(targetBounds) - 18)
  if (yMin > yMax) return null

  const preferredY = (rectMidY(sourceBounds) + rectMidY(targetBounds)) / 2
  const y = Math.round(clamp(preferredY, yMin, yMax))
  const sourceArrowClearance = cue === 'reverse' ? 10 : 0
  const targetArrowClearance = cue === 'forward' || cue === 'passive' ? 10 : 0
  const source = leftToRight ? { x: rectMaxX(sourceBounds) + sourceArrowClearance, y } : { x: sourceBounds.x - sourceArrowClearance, y }
  const target = leftToRight ? { x: targetBounds.x - targetArrowClearance, y } : { x: rectMaxX(targetBounds) + targetArrowClearance, y }
  const start = endpointStub(source, sourcePort, 'enterprise')
  const end = endpointStub(target, targetPort, 'enterprise')
  return [source, start, end, target]
}

function dynamicServiceCandidate(sourceBounds: Rect, targetBounds: Rect, source: Point, sourcePort: PortName, targetPort: PortName, cue: DirectionCue) {
  const targetLeft = targetPort === 'left' || targetPort === 'metadata'
  const targetRight = targetPort === 'right' || targetPort === 'service' || targetPort === 'span'
  const sourceCanExitRight = sourcePort === 'right' || sourcePort === 'service' || sourcePort === 'span' || sourcePort === 'downlink' || sourcePort === 'bottom'
  const sourceCanExitLeft = sourcePort === 'left' || sourcePort === 'metadata'
  const leftToRight = sourceCanExitRight && targetLeft && source.x <= targetBounds.x
  const rightToLeft = sourceCanExitLeft && targetRight && source.x >= rectMaxX(targetBounds)
  if (!leftToRight && !rightToLeft) return null

  const yMin = targetBounds.y + 18
  const yMax = rectMaxY(targetBounds) - 18
  if (yMin > yMax) return null

  const targetArrowClearance = cue === 'forward' || cue === 'passive' ? 10 : 0
  const y = Math.round(clamp(source.y, yMin, yMax))
  const target = leftToRight ? { x: targetBounds.x - targetArrowClearance, y } : { x: rectMaxX(targetBounds) + targetArrowClearance, y }
  const start = endpointStub(source, sourcePort, 'service')
  const end = endpointStub(target, targetPort, 'service')
  return cleanPath([source, start, { x: start.x, y }, end, target])
}

function straightVerticalCandidate(sourceBounds: Rect, targetBounds: Rect, sourcePort: PortName, targetPort: PortName, cue: DirectionCue, routeClass: RouteClass) {
  const sourceBottom = sourcePort === 'bottom' || sourcePort === 'downlink' || sourcePort === 'fieldbus'
  const sourceTop = sourcePort === 'top' || sourcePort === 'uplink'
  const targetTop = targetPort === 'top' || targetPort === 'uplink'
  const targetBottom = targetPort === 'bottom' || targetPort === 'downlink' || targetPort === 'fieldbus'
  const topToBottom = sourceBottom && targetTop && rectMaxY(sourceBounds) <= targetBounds.y
  const bottomToTop = sourceTop && targetBottom && rectMaxY(targetBounds) <= sourceBounds.y
  if (!topToBottom && !bottomToTop) return null

  const xMin = Math.max(sourceBounds.x + 18, targetBounds.x + 18)
  const xMax = Math.min(rectMaxX(sourceBounds) - 18, rectMaxX(targetBounds) - 18)
  if (xMin > xMax) return null

  const preferredX = (rectMidX(sourceBounds) + rectMidX(targetBounds)) / 2
  const x = Math.round(clamp(preferredX, xMin, xMax))
  const sourceArrowClearance = cue === 'reverse' ? 10 : 0
  const targetArrowClearance = cue === 'forward' || cue === 'passive' ? 10 : 0
  const source = topToBottom ? { x, y: rectMaxY(sourceBounds) + sourceArrowClearance } : { x, y: sourceBounds.y - sourceArrowClearance }
  const target = topToBottom ? { x, y: targetBounds.y - targetArrowClearance } : { x, y: rectMaxY(targetBounds) + targetArrowClearance }
  const start = endpointStub(source, sourcePort, routeClass)
  const end = endpointStub(target, targetPort, routeClass)
  return [source, start, end, target]
}

function directLateralSpanCandidate(source: Point, start: Point, end: Point, target: Point, sourceBounds: Rect, targetBounds: Rect, sourcePort: PortName, targetPort: PortName) {
  const sourceLeft = sourcePort === 'left' || sourcePort === 'metadata'
  const sourceRight = sourcePort === 'right' || sourcePort === 'service' || sourcePort === 'span'
  const targetRight = targetPort === 'right' || targetPort === 'service' || targetPort === 'span'
  const targetLeft = targetPort === 'left' || targetPort === 'metadata'
  const rightToLeft = sourceLeft && targetRight && rectMaxX(targetBounds) <= sourceBounds.x
  const leftToRight = sourceRight && targetLeft && rectMaxX(sourceBounds) <= targetBounds.x
  if (!rightToLeft && !leftToRight) return null

  const yMin = Math.min(source.y, target.y)
  const yMax = Math.max(source.y, target.y)
  const laneY = Math.round(clamp(target.y, yMin, yMax))
  return cleanPath([source, start, { x: start.x, y: laneY }, { x: end.x, y: laneY }, end, target])
}

function buildRouteGrid(
  endpoints: { source: Point; start: Point; end: Point; target: Point },
  sourceBounds: Rect,
  targetBounds: Rect,
  obstacles: Obstacle[],
  routeClass: RouteClass,
  layout: BoardLayout
) {
  const xs = new Set<number>([endpoints.source.x, endpoints.start.x, endpoints.end.x, endpoints.target.x])
  const ys = new Set<number>([endpoints.source.y, endpoints.start.y, endpoints.end.y, endpoints.target.y])
  for (const bounds of [sourceBounds, targetBounds]) {
    addAxis(xs, bounds.x - 60, bounds.x - 30, rectMidX(bounds), rectMaxX(bounds) + 30, rectMaxX(bounds) + 60)
    addAxis(ys, bounds.y - 60, bounds.y - 30, rectMidY(bounds), rectMaxY(bounds) + 30, rectMaxY(bounds) + 60)
  }
  for (const obstacle of obstacles) {
    addAxis(xs, obstacle.box.x - 30, obstacle.box.x - 14, rectMidX(obstacle.box), rectMaxX(obstacle.box) + 14, rectMaxX(obstacle.box) + 30)
    addAxis(ys, obstacle.box.y - 30, obstacle.box.y - 14, rectMidY(obstacle.box), rectMaxY(obstacle.box) + 14, rectMaxY(obstacle.box) + 30)
  }
  addAxis(xs, 24, layout.width - 24)
  addAxis(ys, 24, layout.height - 24)

  const lane = laneCoordinates(endpoints, sourceBounds, targetBounds, routeClass)
  addAxis(xs, ...lane.xs)
  addAxis(ys, ...lane.ys)
  return { xs: limitAxis(xs, endpoints.start.x, endpoints.end.x), ys: limitAxis(ys, endpoints.start.y, endpoints.end.y) }
}

function searchGridRoute(start: Point, end: Point, grid: { xs: number[]; ys: number[] }, obstacles: Obstacle[], routeClass: RouteClass, routed: RouteLayout[]) {
  const open = new Map<string, SearchNode>()
  const closed = new Set<string>()
  open.set(key(start), { point: start, cost: 0, estimate: distance(start, end), previous: undefined, direction: undefined, bends: 0 })
  let iterations = 0

  while (open.size && iterations < SEARCH_LIMIT) {
    iterations += 1
    const current = bestNode(open)
    const currentKey = key(current.point)
    open.delete(currentKey)
    if (currentKey === key(end)) return reconstruct(current)
    closed.add(currentKey)

    for (const next of neighbors(current.point, grid)) {
      const nextKey = key(next)
      if (closed.has(nextKey)) continue
      if (routeSegmentBlocked(current.point, next, obstacles)) continue
      const direction = segmentDirection(current.point, next)
      const bendPenalty = current.direction && current.direction !== direction ? 34 : 0
      const routePenalty = routeSegmentPenalty(current.point, next, routeClass, routed)
      if (routePenalty >= 100000) continue
      const nextCost = current.cost + distance(current.point, next) + bendPenalty + routePenalty
      const known = open.get(nextKey)
      if (known && known.cost <= nextCost) continue
      open.set(nextKey, { point: next, cost: nextCost, estimate: distance(next, end), previous: current, direction, bends: current.bends + (bendPenalty ? 1 : 0) })
    }
  }
  return null
}

function routeFrom(link: LinkModel, routeClass: RouteClass, sourcePort: PortName, targetPort: PortName, points: Point[]): RouteLayout {
  return { id: link.id, kind: link.kind, routeClass, directionCue: cueFor(link), sourceId: link.source, targetId: link.target, sourcePort, targetPort, points }
}

function laneCoordinates(endpoints: { start: Point; end: Point }, sourceBounds: Rect, targetBounds: Rect, routeClass: RouteClass) {
  const top = Math.round(Math.min(sourceBounds.y, targetBounds.y) - 64)
  const bottom = Math.round(Math.max(rectMaxY(sourceBounds), rectMaxY(targetBounds)) + 64)
  const left = Math.round(Math.min(sourceBounds.x, targetBounds.x) - 82)
  const right = Math.round(Math.max(rectMaxX(sourceBounds), rectMaxX(targetBounds)) + 82)
  const middleX = Math.round((endpoints.start.x + endpoints.end.x) / 2)
  const middleY = Math.round((endpoints.start.y + endpoints.end.y) / 2)
  if (routeClass === 'protocol-bus') return { xs: [left, right, middleX], ys: [bottom, bottom + 22, middleY] }
  if (routeClass === 'span-feed') return { xs: [left, right, middleX], ys: [top, bottom, middleY] }
  if (routeClass === 'metadata-handoff') return { xs: [left, middleX], ys: [bottom, bottom + 36, middleY] }
  if (routeClass === 'trunk') return { xs: [middleX], ys: [middleY] }
  return { xs: [left, right, middleX], ys: [top, bottom, middleY] }
}

function routeSegmentBlocked(a: Point, b: Point, obstacles: Obstacle[]) {
  return obstacles.some((obstacle) => segmentIntersectsRect(a, b, inflate(obstacle.box, ROUTE_CLEARANCE)))
}

function routeSegmentPenalty(a: Point, b: Point, routeClass: RouteClass, routed: RouteLayout[]) {
  let penalty = 0
  for (const route of routed) {
    for (const segment of segmentsFor(route.points)) {
      if (segmentsOverlap(a, b, segment.a, segment.b)) penalty += route.routeClass === routeClass ? 28 : 100000
      if (segmentsCross(a, b, segment.a, segment.b)) penalty += route.routeClass === routeClass ? 120 : 100000
    }
  }
  return penalty
}

function routeScore(points: Point[], obstacles: Obstacle[], routeClass: RouteClass, routed: RouteLayout[], owner?: { sourceId: string; targetId: string }) {
  if (segmentsFor(points).some((segment) => !isOrthogonal(segment.a, segment.b))) return 100000
  if (obstacles.some((obstacle) => routeHitsBox(points, obstacle.box, ROUTE_CLEARANCE))) return 100000
  let score = points.reduce((total, point, index) => (index === 0 ? 0 : total + distance(points[index - 1], point)), 0)
  score += bendCount(points) * 36
  score += cosmeticDoglegCount(points) * 700
  for (const route of routed) score += routeSegmentPenaltyForPath(points, routeClass, route, owner)
  return score
}

function routeSegmentPenaltyForPath(points: Point[], routeClass: RouteClass, route: RouteLayout, owner?: { sourceId: string; targetId: string }) {
  let penalty = 0
  const related = owner ? routesShareEndpoint(owner, route) : false
  for (const segment of segmentsFor(points)) {
    for (const routedSegment of segmentsFor(route.points)) {
      if (segmentsOverlap(segment.a, segment.b, routedSegment.a, routedSegment.b)) {
        if (!related && route.routeClass !== routeClass) return 100000
        penalty += related ? 90 : 28
      } else if (segmentsCross(segment.a, segment.b, routedSegment.a, routedSegment.b)) {
        if (!related && route.routeClass !== routeClass) return 100000
        penalty += related ? 120 : 120
      }
    }
  }
  return penalty
}

function routesShareEndpoint(owner: { sourceId: string; targetId: string }, route: RouteLayout) {
  return owner.sourceId === route.sourceId || owner.sourceId === route.targetId || owner.targetId === route.sourceId || owner.targetId === route.targetId
}

function placeRouteLabel(route: RouteLayout, obstacles: Obstacle[], step: StepModel, routes: RouteLayout[]): RouteLabelLayout | undefined {
  const text = labelForRoute(route, step)
  if (!text) return undefined
  const compact = route.routeClass === 'metadata-handoff' && text.length > 14
  const w = compact ? 126 : Math.max(74, Math.min(230, text.length * 7.2 + LABEL_W_PAD))
  const h = compact ? LABEL_H_COMPACT : LABEL_H
  const usableSegments = segmentsFor(route.points)
    .map((segment) => ({ ...segment, length: distance(segment.a, segment.b) }))
    .filter((segment) => segment.length > w + 18)
    .sort((a, b) => labelSegmentPreference(b, route) - labelSegmentPreference(a, route))

  for (const segment of usableSegments) {
    const center = { x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2 }
    const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
    const offsets = horizontal ? [-h - LABEL_GAP, LABEL_GAP, -h - 34, 34] : [LABEL_GAP, -w - LABEL_GAP, 32, -w - 32]
    for (const offset of offsets) {
      const box = horizontal
        ? { x: center.x - w / 2, y: center.y + offset, w, h }
        : { x: center.x + offset, y: center.y - h / 2, w, h }
      if (obstacles.some((obstacle) => intersectsRect(inflate(box, 6), obstacle.box))) continue
      if (routes.some((other) => other.id !== route.id && routeHitsBox(other.points, box, ROUTE_CLEARANCE + 8))) continue
      return { id: `${route.id}-label`, linkId: route.id, text, x: Math.round(box.x), y: Math.round(box.y), w, h }
    }
  }
  return undefined
}

function labelSegmentPreference(segment: { a: Point; b: Point; length: number }, route: RouteLayout) {
  const horizontal = Math.abs(segment.a.y - segment.b.y) < 0.5
  let score = segment.length
  if (horizontal) score += 90
  if (route.routeClass === 'protocol-bus' && horizontal) score += 130
  if (route.routeClass === 'span-feed' && horizontal) score += 90
  if (route.routeClass === 'metadata-handoff' && horizontal) score += 90
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

function preferredPort(link: LinkModel, end: 'source' | 'target'): PortName {
  const explicit = end === 'source' ? link.sourcePort ?? link.preferredSourcePort : link.targetPort ?? link.preferredTargetPort
  if (explicit) return explicit
  return end === 'source' ? 'right' : 'left'
}

function routeClassFor(link: LinkModel): RouteClass {
  if (link.routeClass) return link.routeClass
  if (link.kind === 'trunk') return 'trunk'
  if (link.kind === 'protocol') return 'protocol-bus'
  if (link.kind === 'span') return 'span-feed'
  if (link.kind === 'metadata') return 'metadata-handoff'
  return link.kind === 'service' ? 'service' : 'enterprise'
}

function cueFor(link: LinkModel): DirectionCue {
  if (link.directionCue) return link.directionCue
  if (link.direction === 'one-way') return 'forward'
  if (link.direction === 'passive') return 'passive'
  return 'none'
}

function anchorFor(bounds: Rect, port: PortName, arrowClearance: number): Point {
  switch (port) {
    case 'left':
    case 'metadata':
      return { x: bounds.x - arrowClearance, y: rectMidY(bounds) }
    case 'right':
    case 'service':
    case 'span':
      return { x: rectMaxX(bounds) + arrowClearance, y: rectMidY(bounds) }
    case 'top':
    case 'uplink':
      return { x: rectMidX(bounds), y: bounds.y - arrowClearance }
    case 'bottom':
    case 'downlink':
    case 'fieldbus':
      return { x: rectMidX(bounds), y: rectMaxY(bounds) + arrowClearance }
  }
}

function endpointStub(point: Point, port: PortName, routeClass: RouteClass): Point {
  const vector = outwardVector(port)
  const length = routeClass === 'span-feed' && (port === 'uplink' || port === 'top') ? 12 : routeClass === 'span-feed' ? 52 : ENDPOINT_STUB
  return { x: Math.round(point.x + vector.x * length), y: Math.round(point.y + vector.y * length) }
}

function terminalSegmentsRespectPorts(points: Point[], sourcePort: PortName, targetPort: PortName) {
  if (points.length < 2) return false
  return directionMatches(points[0], points[1], outwardVector(sourcePort)) && directionMatches(points[points.length - 1], points[points.length - 2], outwardVector(targetPort))
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

function routeHitsBox(points: Point[], box: Rect, clearance: number) {
  const target = inflate(box, clearance)
  return segmentsFor(points).some((segment) => segmentIntersectsRect(segment.a, segment.b, target))
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
            if (!related && a.routeClass !== b.routeClass) warnings.push(`${a.id} overlaps unrelated ${b.id}`)
          } else if (segmentsCross(aSegment.a, aSegment.b, bSegment.a, bSegment.b)) {
            if (!related && a.routeClass !== b.routeClass) {
              crossings += 1
              warnings.push(`${a.id} crosses unrelated ${b.id}`)
            }
          }
        }
      }
    }
  }
  return { crossings, errors: unique(errors), warnings: unique(warnings) }
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
    if (!best || node.cost + node.estimate + node.bends * 8 < best.cost + best.estimate + best.bends * 8) best = node
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

function segmentDirection(a: Point, b: Point): 'h' | 'v' {
  return Math.abs(a.y - b.y) < 0.5 ? 'h' : 'v'
}

function bendCount(points: Point[]) {
  let count = 0
  for (let index = 2; index < points.length; index += 1) {
    if (segmentDirection(points[index - 2], points[index - 1]) !== segmentDirection(points[index - 1], points[index])) count += 1
  }
  return count
}

function cosmeticDoglegCount(points: Point[]) {
  let count = 0
  const segments = segmentsFor(points)
  for (let index = 1; index < segments.length - 1; index += 1) {
    const previous = segments[index - 1]
    const current = segments[index]
    const next = segments[index + 1]
    const currentLength = distance(current.a, current.b)
    if (currentLength > 0 && currentLength <= 14 && segmentDirection(previous.a, previous.b) === segmentDirection(next.a, next.b) && segmentDirection(previous.a, previous.b) !== segmentDirection(current.a, current.b)) {
      count += 1
    }
  }
  return count
}

function addAxis(axis: Set<number>, ...values: number[]) {
  for (const value of values) if (Number.isFinite(value)) axis.add(Math.round(value))
}

function limitAxis(values: Set<number>, a: number, b: number) {
  const sorted = [...values].sort((left, right) => left - right)
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  const important = new Set([Math.round(a), Math.round(b)])
  const between = sorted.filter((value) => value >= min - 380 && value <= max + 380)
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

function isOrthogonal(a: Point, b: Point) {
  return Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5
}

function intersectsRect(a: Rect, b: Rect) {
  return a.x < rectMaxX(b) && rectMaxX(a) > b.x && a.y < rectMaxY(b) && rectMaxY(a) > b.y
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function key(point: Point) {
  return `${Math.round(point.x)},${Math.round(point.y)}`
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}
