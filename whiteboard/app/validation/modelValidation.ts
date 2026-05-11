import type { Editor } from 'tldraw'
import { entities, flows, links, zones } from '../model/topology'
import { steps } from '../model/steps'
import { shapeIdForEntity, shapeIdForLink, shapeIdForZone } from '../canvas/ids'
import type { RouteSceneLayout } from '../routing/types'

export function validateStaticModel() {
  const errors: string[] = []
  const entityIds = new Set(entities.map((entity) => entity.id))
  const zoneIds = new Set(zones.map((zone) => zone.id))
  const linkIds = new Set(links.map((link) => link.id))

  for (const entity of entities) {
    if (!zoneIds.has(entity.zone)) errors.push(`${entity.id} references missing zone ${entity.zone}`)
    if (!entity.label.trim()) errors.push(`${entity.id} has no label`)
  }

  for (const link of links) {
    if (!entityIds.has(link.source)) errors.push(`${link.id} missing source ${link.source}`)
    if (!entityIds.has(link.target)) errors.push(`${link.id} missing target ${link.target}`)
  }

  for (const flow of flows) {
    if (!entityIds.has(flow.trigger)) errors.push(`${flow.id} trigger ${flow.trigger} is not an entity`)
    for (const linkId of flow.links) {
      if (!linkIds.has(linkId)) errors.push(`${flow.id} references missing link ${linkId}`)
    }
  }

  for (const step of steps) {
    for (const entityId of step.visibleEntities) {
      if (!entityIds.has(entityId)) errors.push(`${step.id} references missing entity ${entityId}`)
    }
    for (const linkId of step.visibleLinks) {
      const link = links.find((item) => item.id === linkId)
      if (!link) {
        errors.push(`${step.id} references missing link ${linkId}`)
      } else if (!step.visibleEntities.includes(link.source) || !step.visibleEntities.includes(link.target)) {
        errors.push(`${step.id} shows ${linkId} before both endpoint entities are visible`)
      }
    }
  }

  return errors
}

export function auditEditor(editor: Editor, routeScene?: RouteSceneLayout) {
  const errors: string[] = []

  for (const zone of zones) {
    if (!editor.getShape(shapeIdForZone(zone.id))) errors.push(`missing zone shape ${zone.id}`)
  }

  for (const entity of entities) {
    const shape = editor.getShape(shapeIdForEntity(entity.id))
    if (!shape) errors.push(`missing device shape ${entity.id}`)
  }

  for (const link of links) {
    const arrow = editor.getShape(shapeIdForLink(link.id))
    if (!arrow) {
      errors.push(`missing arrow ${link.id}`)
      continue
    }

    const bindings = editor
      .getBindingsFromShape(arrow.id, 'arrow')
      .filter((binding) => binding.fromId === arrow.id)
    const terminals = new Set(bindings.map((binding) => binding.props.terminal))
    if (!terminals.has('start') || !terminals.has('end')) errors.push(`${link.id} is not bound at both ends`)
  }

  for (const a of entities) {
    const aShape = editor.getShape(shapeIdForEntity(a.id))
    if (!aShape) continue
    const aBounds = editor.getShapePageBounds(aShape.id)
    if (!aBounds || aShape.opacity < 0.03) continue

    for (const b of entities) {
      if (a.id >= b.id) continue
      const bShape = editor.getShape(shapeIdForEntity(b.id))
      if (!bShape) continue
      const bBounds = editor.getShapePageBounds(bShape.id)
      if (!bBounds || bShape.opacity < 0.03) continue
      if (aBounds.clone().expandBy(12).collides(bBounds)) errors.push(`${a.id} overlaps ${b.id}`)
    }
  }

  if (routeScene) {
    for (const error of routeScene.errors) errors.push(error)
    for (const route of routeScene.routes) {
      if (route.points.length < 2) errors.push(`${route.id} has no drawable route`)
      if (route.label && route.label.linkId !== route.id) errors.push(`${route.label.id} is orphaned`)
    }
  }

  return errors
}
