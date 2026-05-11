import { entities as seedEntities, zones as seedZones } from '../model/topology'
import { clampRectToRect, contains, inflate, intersects, rectMaxX, rectMaxY, snap } from './geometry'
import type { BoardLayout, DiagramEntity, DiagramZone } from './diagramModel'
import type { Rect } from '../routing/types'

export const BOARD_WIDTH = 1900
export const BOARD_HEIGHT = 940
const ZONE_PAD = 22
const ZONE_HEADER = 54
const DEVICE_GAP = 18

export function createInitialEntities(): DiagramEntity[] {
  return seedEntities.map((entity) => ({ ...entity }))
}

export function computeBoardLayout(
  entities: DiagramEntity[] = createInitialEntities(),
  zones: DiagramZone[] = seedZones,
  viewport?: { width: number; height: number }
): BoardLayout {
  const board = boardForViewport(viewport)
  const scaledZones = zones.map((zone) => scaleZone(zone, board.xScale, board.yScale))
  const scaledEntities = entities.map((entity) => scaleEntity(entity, board.xScale, board.yScale))
  const zoneBoxes = Object.fromEntries(scaledZones.map((zone) => [zone.id, pickRect(zone)]))
  const headerBoxes = Object.fromEntries(
    scaledZones.map((zone) => [
      zone.id,
      {
        x: zone.x + 14,
        y: zone.y + 10,
        w: Math.min(Math.max(zone.title.length * 9, zone.subtitle.length * 6.2) + 24, zone.w - 28),
        h: 40,
      },
    ])
  )
  const placed = alignMonitoringFeedColumns(reflowEntities(scaledEntities, zoneBoxes), zoneBoxes)
  const entityBoxes = Object.fromEntries(placed.map((entity) => [entity.id, pickRect(entity)]))

  return {
    width: board.width,
    height: board.height,
    zones: scaledZones,
    entities: placed,
    entityBoxes,
    zoneBoxes,
    headerBoxes,
  }
}

export function moveEntityWithRules(entities: DiagramEntity[], id: string, next: { x: number; y: number }) {
  const zones = Object.fromEntries(seedZones.map((zone) => [zone.id, pickRect(zone)]))
  const target = entities.find((entity) => entity.id === id)
  if (!target) return entities

  const desired = { ...target, x: snap(next.x), y: snap(next.y) }
  const zone = zones[desired.zone]
  const bounds = clampRectToRect(pickRect(desired), safeEntityArea(zone), )
  desired.x = bounds.x
  desired.y = bounds.y

  const sameZoneObstacles = entities
    .filter((entity) => entity.id !== id && entity.zone === desired.zone)
    .map((entity) => inflate(pickRect(entity), DEVICE_GAP))

  const repaired = avoidEntityCollisions(desired, sameZoneObstacles, safeEntityArea(zone))
  desired.x = repaired.x
  desired.y = repaired.y

  return entities.map((entity) => (entity.id === id ? desired : entity))
}

export function toModelPoint(point: { x: number; y: number }, viewport?: { width: number; height: number }) {
  const board = boardForViewport(viewport)
  return { x: point.x / board.xScale, y: point.y / board.yScale }
}

export function addStencilEntity(entities: DiagramEntity[], kind: DiagramEntity['kind']) {
  const id = `workshop-${kind}-${Date.now()}`
  const zone = kind === 'controller' ? 'field' : kind === 'sensor' || kind === 'store' ? 'monitoring' : 'operations'
  const targetZone = seedZones.find((item) => item.id === zone)!
  const entity: DiagramEntity = {
    id,
    kind,
    label: titleForKind(kind),
    subtitle: 'workshop note',
    zone,
    x: targetZone.x + 80,
    y: targetZone.y + 84,
    w: kind === 'switch' ? 260 : 180,
    h: kind === 'switch' ? 72 : 68,
    role: kind === 'switch' ? 'dark' : kind === 'firewall' ? 'boundary' : kind === 'sensor' || kind === 'store' ? 'dragos' : 'normal',
    runtime: true,
  }
  return reflowEntities([...entities, entity], Object.fromEntries(seedZones.map((zone) => [zone.id, pickRect(zone)])))
}

function reflowEntities(entities: DiagramEntity[], zoneBoxes: Record<string, Rect>) {
  const result: DiagramEntity[] = []
  for (const entity of entities) {
    const zone = zoneBoxes[entity.zone]
    if (!zone) {
      result.push(entity)
      continue
    }
    const safe = safeEntityArea(zone)
    const box = clampRectToRect(pickRect(entity), safe)
    const sameZone = result.filter((item) => item.zone === entity.zone).map((item) => inflate(pickRect(item), DEVICE_GAP))
    const repaired = avoidEntityCollisions({ ...entity, x: box.x, y: box.y }, sameZone, safe)
    result.push({ ...entity, x: repaired.x, y: repaired.y })
  }
  return result
}

function avoidEntityCollisions(entity: DiagramEntity, obstacles: Rect[], safe: Rect) {
  const original = pickRect(entity)
  if (!obstacles.some((box) => intersects(original, box)) && contains(safe, original)) return entity

  const candidates: Rect[] = [original]
  const step = 36
  for (let ring = 1; ring <= 10; ring += 1) {
    const distance = ring * step
    candidates.push(
      { ...original, x: original.x + distance },
      { ...original, x: original.x - distance },
      { ...original, y: original.y + distance },
      { ...original, y: original.y - distance },
      { ...original, x: original.x + distance, y: original.y + distance },
      { ...original, x: original.x - distance, y: original.y + distance },
      { ...original, x: original.x + distance, y: original.y - distance },
      { ...original, x: original.x - distance, y: original.y - distance }
    )
  }

  const picked =
    candidates
      .map((box) => clampRectToRect({ ...box, x: snap(box.x), y: snap(box.y) }, safe))
      .find((box) => !obstacles.some((obstacle) => intersects(box, obstacle))) ?? clampRectToRect(original, safe)
  return { ...entity, x: picked.x, y: picked.y }
}

function alignMonitoringFeedColumns(entities: DiagramEntity[], zoneBoxes: Record<string, Rect>) {
  const sensor = entities.find((entity) => entity.id === 'sensor-control')
  const store = entities.find((entity) => entity.id === 'sitestore')
  const zone = zoneBoxes.monitoring
  if (!sensor || !store || !zone) return entities

  const sensorBox = pickRect(sensor)
  const storeBox = pickRect(store)
  const currentOverlap = Math.min(rectMaxX(sensorBox), rectMaxX(storeBox)) - Math.max(sensorBox.x, storeBox.x)
  const requiredOverlap = Math.min(72, sensorBox.w * 0.35, storeBox.w * 0.35)
  if (currentOverlap >= requiredOverlap) return entities

  const safe = safeEntityArea(zone)
  const desiredStore = {
    ...store,
    x: Math.round(rectMaxX(sensorBox) - requiredOverlap),
  }
  const clamped = clampRectToRect(pickRect(desiredStore), safe)
  const obstacles = entities
    .filter((entity) => entity.id !== store.id && entity.zone === store.zone)
    .map((entity) => inflate(pickRect(entity), DEVICE_GAP))
  const repaired = avoidEntityCollisions({ ...desiredStore, x: clamped.x, y: clamped.y }, obstacles, safe)
  return entities.map((entity) => (entity.id === store.id ? repaired : entity))
}

function safeEntityArea(zone: Rect): Rect {
  return {
    x: zone.x + ZONE_PAD,
    y: zone.y + ZONE_HEADER,
    w: Math.max(80, zone.w - ZONE_PAD * 2),
    h: Math.max(80, zone.h - ZONE_HEADER - ZONE_PAD),
  }
}

function pickRect(item: { x: number; y: number; w?: number; h?: number }): Rect {
  return { x: item.x, y: item.y, w: item.w ?? 180, h: item.h ?? 70 }
}

function titleForKind(kind: DiagramEntity['kind']) {
  switch (kind) {
    case 'switch':
      return 'OT Switch'
    case 'firewall':
      return 'Firewall'
    case 'server':
      return 'Server'
    case 'workstation':
      return 'Workstation'
    case 'sensor':
      return 'Dragos Sensor'
    case 'store':
      return 'Dragos Store'
    case 'controller':
      return 'Controller'
    default:
      return 'OT Entity'
  }
}

function boardForViewport(viewport?: { width: number; height: number }) {
  if (!viewport?.width || !viewport.height) return { width: BOARD_WIDTH, height: BOARD_HEIGHT, xScale: 1, yScale: 1 }
  const stageAspect = viewport.width / viewport.height
  const baseAspect = BOARD_WIDTH / BOARD_HEIGHT
  let width = BOARD_WIDTH
  let height = BOARD_HEIGHT
  if (stageAspect > baseAspect) {
    width = Math.min(BOARD_WIDTH * 1.7, Math.round(BOARD_HEIGHT * stageAspect))
  } else {
    height = Math.min(BOARD_HEIGHT * 1.45, Math.round(BOARD_WIDTH / stageAspect))
  }
  return { width, height, xScale: width / BOARD_WIDTH, yScale: height / BOARD_HEIGHT }
}

function scaleZone(zone: DiagramZone, xScale: number, yScale: number): DiagramZone {
  return { ...zone, x: Math.round(zone.x * xScale), y: Math.round(zone.y * yScale), w: Math.round(zone.w * xScale), h: Math.round(zone.h * yScale) }
}

function scaleEntity(entity: DiagramEntity, xScale: number, yScale: number): DiagramEntity {
  return { ...entity, x: Math.round(entity.x * xScale), y: Math.round(entity.y * yScale) }
}
