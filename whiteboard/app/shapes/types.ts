import type { TLShape } from 'tldraw'
import type { EntityKind, ZoneKind } from '../model/topology'

export const OT_DEVICE_SHAPE_TYPE = 'ot-device'
export const OT_ZONE_SHAPE_TYPE = 'ot-zone'

export type OTDeviceProps = {
    w: number
    h: number
    entityId: string
    kind: EntityKind
    label: string
    subtitle: string
    zoneId: ZoneKind
    role: string
  }

export type OTZoneProps = {
    w: number
    h: number
    zoneId: ZoneKind
    title: string
    subtitle: string
  }

declare module '@tldraw/tlschema' {
  export interface TLGlobalShapePropsMap {
    [OT_DEVICE_SHAPE_TYPE]: OTDeviceProps
    [OT_ZONE_SHAPE_TYPE]: OTZoneProps
  }
}

export type OTDeviceShape = TLShape<typeof OT_DEVICE_SHAPE_TYPE>
export type OTZoneShape = TLShape<typeof OT_ZONE_SHAPE_TYPE>

export type CustomShape = OTDeviceShape | OTZoneShape
