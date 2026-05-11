import type { EntityModel, ZoneModel } from '../model/topology'
import type { Rect } from '../routing/types'

export interface DiagramEntity extends EntityModel {
  runtime?: boolean
}

export interface DiagramZone extends ZoneModel {}

export interface BoardLayout {
  width: number
  height: number
  zones: DiagramZone[]
  entities: DiagramEntity[]
  entityBoxes: Record<string, Rect>
  zoneBoxes: Record<string, Rect>
  headerBoxes: Record<string, Rect>
}

export type DragState = {
  id: string
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}
