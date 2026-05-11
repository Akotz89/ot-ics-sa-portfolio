import { contains, inflate, intersects, segmentIntersectsRect, segmentsFor } from '../engine/geometry'
import type { BoardLayout } from '../engine/diagramModel'
import { evidenceCatalog, type EvidenceRefId } from '../model/evidence'
import { concerns, requiredScenarioConcernIds } from '../model/gaps'
import { entities, flows, links, zones } from '../model/topology'
import { steps, type StepModel } from '../model/steps'
import type { RouteSceneLayout } from '../routing/types'

export function validateStaticModel() {
  const errors: string[] = []
  const entityIds = new Set<string>(entities.map((entity) => entity.id))
  const zoneIds = new Set<string>(zones.map((zone) => zone.id))
  const linkIds = new Set<string>(links.map((link) => link.id))
  const stepIds = new Set<string>(steps.map((step) => step.id))
  const modelItemIds = new Set([...entityIds, ...zoneIds, ...linkIds])
  const routeClasses = new Set(['enterprise', 'service', 'trunk', 'protocol-bus', 'span-feed', 'metadata-handoff'])
  const directionCues = new Set(['none', 'forward', 'reverse', 'both', 'passive'])
  const ports = new Set(['left', 'right', 'top', 'bottom', 'uplink', 'downlink', 'service', 'span', 'metadata', 'fieldbus'])
  const labelPolicies = new Set(['none', 'first-visible', 'always'])
  const evidenceIds = new Set(Object.keys(evidenceCatalog))

  for (const zone of zones) validateEvidenceRefs(errors, `zone ${zone.id}`, zone.evidenceRefs, evidenceIds)
  for (const entity of entities) {
    if (!zoneIds.has(entity.zone)) errors.push(`${entity.id} references missing zone ${entity.zone}`)
    if (!entity.label.trim()) errors.push(`${entity.id} has no label`)
    if ((entity.w ?? 0) < 120 || (entity.h ?? 0) < 58) errors.push(`${entity.id} is below readable size`)
    validateEvidenceRefs(errors, `entity ${entity.id}`, entity.evidenceRefs, evidenceIds)
  }

  for (const link of links) {
    if (!entityIds.has(link.source)) errors.push(`${link.id} missing source ${link.source}`)
    if (!entityIds.has(link.target)) errors.push(`${link.id} missing target ${link.target}`)
    if (!link.routeClass || !routeClasses.has(link.routeClass)) errors.push(`${link.id} has no valid routeClass`)
    if (!link.directionCue || !directionCues.has(link.directionCue)) errors.push(`${link.id} has no valid directionCue`)
    if (!link.sourcePort || !ports.has(link.sourcePort)) errors.push(`${link.id} has no valid sourcePort`)
    if (!link.targetPort || !ports.has(link.targetPort)) errors.push(`${link.id} has no valid targetPort`)
    if (!link.labelPolicy || !labelPolicies.has(link.labelPolicy)) errors.push(`${link.id} has no valid labelPolicy`)
    if (!link.customerMeaning?.trim()) errors.push(`${link.id} needs customerMeaning`)
    validateEvidenceRefs(errors, `link ${link.id}`, link.evidenceRefs, evidenceIds)
  }

  for (const flow of flows) {
    if (!entityIds.has(flow.trigger)) errors.push(`${flow.id} trigger ${flow.trigger} is not an entity`)
    for (const linkId of flow.links) if (!linkIds.has(linkId)) errors.push(`${flow.id} references missing link ${linkId}`)
  }

  const concernIds = new Set(concerns.map((concern) => concern.id))
  const concernStatuses = new Set(['validate', 'unknown', 'gap-if-absent', 'confirmed-gap', 'pov-dependency', 'authorization-dependency'])
  for (const requiredId of requiredScenarioConcernIds) {
    if (!concernIds.has(requiredId)) errors.push(`required scenario concern ${requiredId} is not modeled`)
  }
  for (const concern of concerns) {
    if (!concernStatuses.has(concern.status)) errors.push(`${concern.id} has invalid status ${concern.status}`)
    if (!concern.title.trim()) errors.push(`${concern.id} has no title`)
    if (!concern.customerPrompt.trim()) errors.push(`${concern.id} has no customerPrompt`)
    if (!concern.whyItMatters.trim()) errors.push(`${concern.id} has no whyItMatters`)
    if (!concern.scenarioFinding.trim()) errors.push(`${concern.id} has no scenarioFinding`)
    if (!concern.dragosRelevance.trim()) errors.push(`${concern.id} has no dragosRelevance`)
    validateEvidenceRefs(errors, `concern ${concern.id}`, concern.evidenceRefs, evidenceIds)
    for (const stepId of concern.stepIds) if (!stepIds.has(stepId)) errors.push(`${concern.id} references missing step ${stepId}`)
    for (const itemId of concern.tiedTo) if (!modelItemIds.has(itemId)) errors.push(`${concern.id} tiedTo missing model item ${itemId}`)
  }
  validateControlStatus(errors)

  for (const step of steps) {
    validateEvidenceRefs(errors, `step ${step.id}`, step.evidenceRefs, evidenceIds)
    for (const zoneId of step.visibleZones) if (!zoneIds.has(zoneId)) errors.push(`${step.id} references missing zone ${zoneId}`)
    for (const entityId of step.visibleEntities) if (!entityIds.has(entityId)) errors.push(`${step.id} references missing entity ${entityId}`)
    for (const linkId of step.visibleLinks) {
      const link = links.find((item) => item.id === linkId)
      if (!link) {
        errors.push(`${step.id} references missing link ${linkId}`)
      } else if (!step.visibleEntities.includes(link.source) || !step.visibleEntities.includes(link.target)) {
        errors.push(`${step.id} shows ${linkId} before both endpoint entities are visible`)
      }
    }
    for (const itemId of [...(step.active ?? []), ...(step.introduced ?? []), ...(step.dimmed ?? []), ...(step.hidden ?? []), ...(step.focus ?? [])]) {
      if (!entityIds.has(itemId) && !zoneIds.has(itemId) && !linkIds.has(itemId)) errors.push(`${step.id} references missing focus item ${itemId}`)
    }
  }

  return errors
}

function validateControlStatus(errors: string[]) {
  const firewallConcern = concerns.find((concern) => concern.id === 'l4-l3-firewall-gap')
  const jumpConcern = concerns.find((concern) => concern.id === 'remote-access-no-jump-mfa')
  if (firewallConcern && !['confirmed-gap', 'validate', 'gap-if-absent'].includes(firewallConcern.status)) {
    errors.push('boundary firewall concern must be framed as validation or gap, not confirmed current-state control')
  }
  if (jumpConcern && !['confirmed-gap', 'validate', 'gap-if-absent'].includes(jumpConcern.status)) {
    errors.push('jump host concern must be framed as validation or gap, not confirmed current-state control')
  }
  const unsafePhrases = [
    /the customer has a true L4-to-L3 firewall/i,
    /the customer has a jump host/i,
    /MFA is configured/i,
    /session logging is configured/i,
  ]
  for (const concern of concerns) {
    const copy = `${concern.customerPrompt} ${concern.scenarioFinding}`
    for (const phrase of unsafePhrases) {
      if (phrase.test(copy)) errors.push(`${concern.id} states an unconfirmed boundary/access control as fact`)
    }
  }
}

function validateEvidenceRefs(errors: string[], owner: string, refs: EvidenceRefId[] | undefined, evidenceIds: Set<string>) {
  if (!refs?.length) {
    errors.push(`${owner} has no evidenceRefs`)
    return
  }
  for (const ref of refs) {
    if (!evidenceIds.has(ref)) errors.push(`${owner} references unknown evidence ${ref}`)
  }
}

export function auditDiagram(layout: BoardLayout, step: StepModel, routeScene: RouteSceneLayout) {
  const errors: string[] = []
  const visibleEntityIds = new Set(step.visibleEntities)
  const visibleZoneIds = new Set(step.visibleZones)
  const visibleBoxes = [...visibleEntityIds].map((id) => ({ id, box: layout.entityBoxes[id] })).filter((item) => item.box)

  for (const entity of layout.entities) {
    if (!visibleEntityIds.has(entity.id)) continue
    const zone = layout.zoneBoxes[entity.zone]
    const box = layout.entityBoxes[entity.id]
    if (zone && box && !contains(inflate(zone, -8), box)) errors.push(`${entity.id} is outside ${entity.zone}`)
  }

  for (let aIndex = 0; aIndex < visibleBoxes.length; aIndex += 1) {
    const a = visibleBoxes[aIndex]
    for (let bIndex = aIndex + 1; bIndex < visibleBoxes.length; bIndex += 1) {
      const b = visibleBoxes[bIndex]
      if (intersects(inflate(a.box, 8), inflate(b.box, 8))) errors.push(`${a.id} overlaps ${b.id}`)
    }
  }

  for (const route of routeScene.routes) {
    const link = links.find((item) => item.id === route.id)
    if (!visibleEntityIds.has(route.sourceId) || !visibleEntityIds.has(route.targetId)) errors.push(`${route.id} has hidden endpoint`)
    if (route.points.length < 2) errors.push(`${route.id} has no drawable route`)
    if (hasCosmeticDogleg(route.points)) errors.push(`${route.id} has an avoidable tiny dogleg`)
    if (hasLateralSpanBacktrack(route)) errors.push(`${route.id} backtracks away from its SPAN target`)
    if (hasOppositeLateralMotion(route)) errors.push(`${route.id} moves opposite its target direction`)
    if (exceedsBendBudget(route)) errors.push(`${route.id} exceeds ${route.routeClass} bend budget`)
    for (const point of route.points) {
      if (point.x < 0 || point.y < 0 || point.x > layout.width || point.y > layout.height) errors.push(`${route.id} leaves the board`)
    }
    for (const item of visibleBoxes) {
      if (item.id === route.sourceId || item.id === route.targetId) continue
      const inflated = inflate(item.box, route.routeClass === 'span-feed' ? 2 : 10)
      if (segmentsFor(route.points).some((segment) => segmentIntersectsRect(segment.a, segment.b, inflated))) {
        errors.push(`${route.id} crosses ${item.id}`)
      }
    }
    for (const zoneId of visibleZoneIds) {
      const header = layout.headerBoxes[zoneId]
      if (route.routeClass === 'trunk' || route.routeClass === 'protocol-bus' || route.routeClass === 'span-feed') continue
      if (header && segmentsFor(route.points).some((segment) => segmentIntersectsRect(segment.a, segment.b, inflate(header, 8)))) {
        errors.push(`${route.id} intrudes into ${zoneId} header`)
      }
    }
    if (route.label && route.label.linkId !== route.id) errors.push(`${route.label.id} is orphaned`)
    if (route.label && !contains(inflate({ x: 0, y: 0, w: layout.width, h: layout.height }, -8), route.label)) errors.push(`${route.label.id} is outside the board`)
    if (link?.label && labelRequired(link, step) && !route.label) errors.push(`${route.id} label could not be placed`)
  }

  errors.push(...routeScene.errors)
  return [...new Set(errors)]
}

function hasCosmeticDogleg(points: Array<{ x: number; y: number }>) {
  if (points.length < 4) return false
  const segments = segmentsFor(points)
  for (let index = 1; index < segments.length - 1; index += 1) {
    const previous = segments[index - 1]
    const current = segments[index]
    const next = segments[index + 1]
    const currentLength = Math.abs(current.a.x - current.b.x) + Math.abs(current.a.y - current.b.y)
    if (currentLength > 0 && currentLength <= 14 && sameOrientation(previous, next) && !sameOrientation(previous, current)) return true
  }
  return false
}

function hasLateralSpanBacktrack(route: RouteSceneLayout['routes'][number]) {
  if (route.routeClass !== 'span-feed' || route.points.length < 2) return false
  const source = route.points[0]
  const target = route.points[route.points.length - 1]
  const sourceExitsLeft = route.sourcePort === 'left' || route.sourcePort === 'metadata'
  const sourceExitsRight = route.sourcePort === 'right' || route.sourcePort === 'service' || route.sourcePort === 'span'
  const targetReceivesRight = route.targetPort === 'right' || route.targetPort === 'service' || route.targetPort === 'span'
  const targetReceivesLeft = route.targetPort === 'left' || route.targetPort === 'metadata'
  if (sourceExitsLeft && targetReceivesRight && target.x < source.x) {
    return Math.max(...route.points.map((point) => point.x)) > source.x + 8
  }
  if (sourceExitsRight && targetReceivesLeft && target.x > source.x) {
    return Math.min(...route.points.map((point) => point.x)) < source.x - 8
  }
  return false
}

function hasOppositeLateralMotion(route: RouteSceneLayout['routes'][number]) {
  if (route.routeClass !== 'span-feed') return false
  if (!isLateralPort(route.sourcePort) || !isLateralPort(route.targetPort)) return false
  const expected = Math.sign(route.points[route.points.length - 1].x - route.points[0].x)
  if (expected === 0) return false
  return segmentsFor(route.points).some((segment) => {
    const dx = segment.b.x - segment.a.x
    if (Math.abs(dx) <= 8) return false
    return Math.sign(dx) !== expected
  })
}

function exceedsBendBudget(route: RouteSceneLayout['routes'][number]) {
  const budgets: Record<string, number> = {
    enterprise: 2,
    service: 4,
    trunk: 2,
    'protocol-bus': 4,
    'span-feed': 5,
    'metadata-handoff': 5,
  }
  return bendCount(route.points) > budgets[route.routeClass]
}

function bendCount(points: Array<{ x: number; y: number }>) {
  let count = 0
  const segments = segmentsFor(points)
  for (let index = 1; index < segments.length; index += 1) {
    if (!sameOrientation(segments[index - 1], segments[index])) count += 1
  }
  return count
}

function isLateralPort(port: string) {
  return port === 'left' || port === 'right' || port === 'service' || port === 'span' || port === 'metadata'
}

function sameOrientation(a: { a: { x: number; y: number }; b: { x: number; y: number } }, b: { a: { x: number; y: number }; b: { x: number; y: number } }) {
  return isHorizontal(a) === isHorizontal(b)
}

function isHorizontal(segment: { a: { x: number; y: number }; b: { x: number; y: number } }) {
  return Math.abs(segment.a.y - segment.b.y) < 0.5
}

function labelRequired(link: (typeof links)[number], step: StepModel) {
  if (link.labelPolicy === 'none') return false
  if (link.labelPolicy === 'first-visible') return Boolean(step.introduced?.includes(link.id))
  return true
}
