import {
  Box,
  createBindingId,
  toRichText,
  type Editor,
  type TLArrowShape,
  type TLBinding,
  type TLShapePartial,
} from 'tldraw'
import { entities, links, zones, type Anchor, type EntityModel, type LinkKind, type LinkModel } from '../model/topology'
import { steps, type StepModel } from '../model/steps'
import { shapeIdForEntity, shapeIdForLink, shapeIdForZone } from './ids'

export const BOARD_BOUNDS = new Box(0, 0, 1885, 930)

export function seedWhiteboard(editor: Editor) {
  editor.updateInstanceState({ isReadonly: false })
  editor.selectAll().deleteShapes(editor.getSelectedShapeIds())

  const shapes: TLShapePartial[] = []

  for (const zone of zones) {
    shapes.push({
      id: shapeIdForZone(zone.id),
      type: 'ot-zone',
      x: zone.x,
      y: zone.y,
      isLocked: false,
      props: {
        w: zone.w,
        h: zone.h,
        zoneId: zone.id,
        title: zone.title,
        subtitle: zone.subtitle,
      },
    } as unknown as TLShapePartial)
  }

  for (const link of links) {
    const source = entityById(link.source)
    const target = entityById(link.target)
    const start = anchorPoint(source, link.sourceAnchor ?? 'right')
    const end = anchorPoint(target, link.targetAnchor ?? 'left')
    const props = arrowPropsFor(link, start, end)
    shapes.push({
      id: shapeIdForLink(link.id),
      type: 'arrow',
      x: 0,
      y: 0,
      opacity: 0,
      isLocked: false,
      props,
      meta: {
        otLinkId: link.id,
        source: link.source,
        target: link.target,
        kind: link.kind,
      },
    } as TLShapePartial)
  }

  for (const entity of entities) {
    shapes.push({
      id: shapeIdForEntity(entity.id),
      type: 'ot-device',
      x: entity.x,
      y: entity.y,
      opacity: 0,
      isLocked: false,
      props: {
        w: computedWidth(entity),
        h: entity.h ?? 72,
        entityId: entity.id,
        kind: entity.kind,
        label: entity.label,
        subtitle: entity.subtitle,
        zoneId: entity.zone,
        role: entity.role ?? 'normal',
      },
      meta: {
        otEntityId: entity.id,
        zone: entity.zone,
      },
    } as unknown as TLShapePartial)
  }

  const bindings = links.flatMap((link) => bindingsForLink(link))
  editor.createShapes(shapes)
  editor.createBindings(bindings)
  editor.sendToBack(zones.map((zone) => shapeIdForZone(zone.id)))
  editor.bringToFront(links.map((link) => shapeIdForLink(link.id)))
  editor.bringToFront(entities.map((entity) => shapeIdForEntity(entity.id)))
  applyStep(editor, steps[0])
}

export function applyStep(editor: Editor, step: StepModel, workshop = false) {
  editor.updateInstanceState({ isReadonly: false })
  editor.updateShapes([
    ...zones.map((zone) => ({ id: shapeIdForZone(zone.id), type: 'ot-zone', isLocked: false }) as unknown as TLShapePartial),
    ...links.map((link) => ({ id: shapeIdForLink(link.id), type: 'arrow', isLocked: false }) as TLShapePartial),
    ...entities.map((entity) => ({ id: shapeIdForEntity(entity.id), type: 'ot-device', isLocked: false }) as unknown as TLShapePartial),
  ])
  const visibleZones = new Set(step.visibleZones)
  const visibleEntities = new Set(step.visibleEntities)
  const focus = new Set(step.focus ?? [])
  const hasFocus = focus.size > 0

  const updates: TLShapePartial[] = []
  for (const zone of zones) {
    const visible = visibleZones.has(zone.id)
    updates.push({
      id: shapeIdForZone(zone.id),
      type: 'ot-zone',
      opacity: visible ? opacityFor(zone.id, hasFocus, focus) : 0,
      isLocked: true,
    } as unknown as TLShapePartial)
  }
  for (const link of links) {
    updates.push({
      id: shapeIdForLink(link.id),
      type: 'arrow',
      opacity: 0,
      isLocked: !workshop,
    } as unknown as TLShapePartial)
  }
  for (const entity of entities) {
    const visible = visibleEntities.has(entity.id)
    updates.push({
      id: shapeIdForEntity(entity.id),
      type: 'ot-device',
      opacity: visible ? opacityFor(entity.id, hasFocus, focus) : 0,
      isLocked: !workshop,
    } as TLShapePartial)
  }
  editor.updateShapes(updates)
  editor.updateInstanceState({ isReadonly: !workshop })
  fitVisibleContent(editor)
}

export function fitVisibleContent(editor: Editor) {
  const visibleBounds = editor
    .getCurrentPageShapesSorted()
    .filter((shape) => shape.opacity > 0.03)
    .map((shape) => editor.getShapePageBounds(shape.id))
    .filter((box): box is Box => Boolean(box))

  const bounds = visibleBounds.length ? Box.Common(visibleBounds).expandBy(32) : BOARD_BOUNDS
  editor.zoomToBounds(bounds, { animation: { duration: 180 }, inset: 18 })
}

function opacityFor(id: string, hasFocus: boolean, focus: Set<string>) {
  if (!hasFocus) return 1
  return focus.has(id) ? 1 : 0.22
}

function entityById(id: string) {
  const entity = entities.find((item) => item.id === id)
  if (!entity) throw new Error(`Unknown entity ${id}`)
  return entity
}

function computedWidth(entity: EntityModel) {
  const labelWidth = Math.max(entity.label.length * 7 + 78, entity.subtitle.length * 5.6 + 82)
  return Math.max(entity.w ?? 0, Math.min(340, Math.ceil(labelWidth)))
}

function anchorPoint(entity: EntityModel, anchor: Anchor) {
  const w = computedWidth(entity)
  const h = entity.h ?? 72
  switch (anchor) {
    case 'left':
      return { x: entity.x, y: entity.y + h / 2 }
    case 'right':
      return { x: entity.x + w, y: entity.y + h / 2 }
    case 'top':
      return { x: entity.x + w / 2, y: entity.y }
    case 'bottom':
      return { x: entity.x + w / 2, y: entity.y + h }
    default:
      return { x: entity.x + w / 2, y: entity.y + h / 2 }
  }
}

function normalized(anchor: Anchor) {
  switch (anchor) {
    case 'left':
      return { x: 0, y: 0.5 }
    case 'right':
      return { x: 1, y: 0.5 }
    case 'top':
      return { x: 0.5, y: 0 }
    case 'bottom':
      return { x: 0.5, y: 1 }
    default:
      return { x: 0.5, y: 0.5 }
  }
}

function arrowPropsFor(link: LinkModel, start: { x: number; y: number }, end: { x: number; y: number }): TLArrowShape['props'] {
  const style = styleForLink(link.kind)
  const arrowheads = arrowheadsForLink(link)
  return {
    kind: 'elbow',
    labelColor: 'black',
    color: style.color,
    fill: 'none',
    dash: style.dash,
    size: style.size,
    arrowheadStart: arrowheads.arrowheadStart,
    arrowheadEnd: arrowheads.arrowheadEnd,
    font: 'sans',
    start,
    end,
    bend: 0,
    richText: toRichText(renderedRouteLabel(link)),
    labelPosition: 0.5,
    scale: 0.78,
    elbowMidPoint: 0.5,
  }
}

function renderedRouteLabel(link: LinkModel) {
  if (!link.label) return ''
  if (link.kind === 'service') return ''
  return link.label
}

function arrowheadsForLink(link: LinkModel): Pick<TLArrowShape['props'], 'arrowheadStart' | 'arrowheadEnd'> {
  if (link.direction !== 'one-way') return { arrowheadStart: 'none', arrowheadEnd: 'none' }
  if (link.kind === 'enterprise' || link.kind === 'metadata') return { arrowheadStart: 'none', arrowheadEnd: 'arrow' }
  return { arrowheadStart: 'none', arrowheadEnd: 'none' }
}

function styleForLink(kind: LinkKind): Pick<TLArrowShape['props'], 'color' | 'dash' | 'size'> {
  switch (kind) {
    case 'span':
      return { color: 'orange', dash: 'dashed', size: 'm' }
    case 'metadata':
      return { color: 'blue', dash: 'dashed', size: 'm' }
    case 'protocol':
      return { color: 'blue', dash: 'dashed', size: 's' }
    case 'trunk':
      return { color: 'black', dash: 'solid', size: 'l' }
    case 'service':
      return { color: 'grey', dash: 'solid', size: 's' }
    default:
      return { color: 'black', dash: 'solid', size: 'm' }
  }
}

function bindingsForLink(link: LinkModel): TLBinding[] {
  const arrowId = shapeIdForLink(link.id)
  return [
    {
      id: createBindingId(`${link.id}-start`),
      typeName: 'binding',
      type: 'arrow',
      fromId: arrowId,
      toId: shapeIdForEntity(link.source),
      props: {
        terminal: 'start',
        normalizedAnchor: normalized(link.sourceAnchor ?? 'right'),
        isExact: false,
        isPrecise: true,
        snap: 'edge',
      },
      meta: {},
    },
    {
      id: createBindingId(`${link.id}-end`),
      typeName: 'binding',
      type: 'arrow',
      fromId: arrowId,
      toId: shapeIdForEntity(link.target),
      props: {
        terminal: 'end',
        normalizedAnchor: normalized(link.targetAnchor ?? 'left'),
        isExact: false,
        isPrecise: true,
        snap: 'edge',
      },
      meta: {},
    },
  ]
}
