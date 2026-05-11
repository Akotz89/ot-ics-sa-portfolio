import { createShapeId, type TLShapeId } from 'tldraw'

export const shapeIdForEntity = (id: string): TLShapeId => createShapeId(`ot-entity-${id}`)
export const shapeIdForZone = (id: string): TLShapeId => createShapeId(`ot-zone-${id}`)
export const shapeIdForLink = (id: string): TLShapeId => createShapeId(`ot-link-${id}`)

export function entityIdFromShapeId(id: string) {
  const prefix = 'shape:ot-entity-'
  return id.startsWith(prefix) ? id.slice(prefix.length) : undefined
}

export function linkIdFromShapeId(id: string) {
  const prefix = 'shape:ot-link-'
  return id.startsWith(prefix) ? id.slice(prefix.length) : undefined
}
