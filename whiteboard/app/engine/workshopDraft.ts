import type { DiagramEntity } from './diagramModel'

export const WORKSHOP_DRAFT_SCHEMA_VERSION = 1
export const WORKSHOP_DRAFT_STORAGE_KEY = 'dragos-whiteboard-workshop-draft-v1'

type WorkshopDraftPayload = {
  schemaVersion: number
  savedAt: string
  entities: DiagramEntity[]
}

export function loadWorkshopDraft(baseline: DiagramEntity[]) {
  if (typeof window === 'undefined') return cloneEntities(baseline)

  try {
    const raw = window.localStorage.getItem(WORKSHOP_DRAFT_STORAGE_KEY)
    if (!raw) return saveAndReturnBaseline(baseline)

    const parsed = JSON.parse(raw) as WorkshopDraftPayload
    if (!isValidDraft(parsed, baseline)) return saveAndReturnBaseline(baseline)
    return cloneEntities(parsed.entities)
  } catch {
    return saveAndReturnBaseline(baseline)
  }
}

export function saveWorkshopDraft(entities: DiagramEntity[]) {
  if (typeof window === 'undefined') return

  const payload: WorkshopDraftPayload = {
    schemaVersion: WORKSHOP_DRAFT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    entities: cloneEntities(entities),
  }
  window.localStorage.setItem(WORKSHOP_DRAFT_STORAGE_KEY, JSON.stringify(payload))
}

export function resetWorkshopDraft(baseline: DiagramEntity[]) {
  const draft = cloneEntities(baseline)
  saveWorkshopDraft(draft)
  return draft
}

export function cloneEntities(entities: DiagramEntity[]) {
  return entities.map((entity) => ({ ...entity }))
}

export function sameEntityLayout(left: DiagramEntity[], right: DiagramEntity[]) {
  if (left.length !== right.length) return false
  return left.every((entity, index) => {
    const other = right[index]
    return (
      other &&
      entity.id === other.id &&
      entity.kind === other.kind &&
      entity.zone === other.zone &&
      entity.label === other.label &&
      entity.subtitle === other.subtitle &&
      entity.x === other.x &&
      entity.y === other.y &&
      entity.w === other.w &&
      entity.h === other.h &&
      entity.runtime === other.runtime
    )
  })
}

function saveAndReturnBaseline(baseline: DiagramEntity[]) {
  const draft = cloneEntities(baseline)
  saveWorkshopDraft(draft)
  return draft
}

function isValidDraft(payload: WorkshopDraftPayload, baseline: DiagramEntity[]) {
  if (payload?.schemaVersion !== WORKSHOP_DRAFT_SCHEMA_VERSION) return false
  if (!Array.isArray(payload.entities) || payload.entities.length < baseline.length || payload.entities.length > 60) return false

  const seen = new Set<string>()
  for (const entity of payload.entities) {
    if (!isValidEntity(entity) || seen.has(entity.id)) return false
    seen.add(entity.id)
  }

  return baseline.every((entity) => seen.has(entity.id))
}

function isValidEntity(entity: DiagramEntity) {
  return (
    entity &&
    typeof entity.id === 'string' &&
    typeof entity.kind === 'string' &&
    typeof entity.zone === 'string' &&
    typeof entity.label === 'string' &&
    typeof entity.subtitle === 'string' &&
    Number.isFinite(entity.x) &&
    Number.isFinite(entity.y) &&
    (entity.w === undefined || Number.isFinite(entity.w)) &&
    (entity.h === undefined || Number.isFinite(entity.h))
  )
}
