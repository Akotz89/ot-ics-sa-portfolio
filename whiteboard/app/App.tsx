import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw, type Editor, type TLShapePartial } from 'tldraw'
import { applyStep, fitVisibleContent, seedWhiteboard } from './canvas/seedTldraw'
import { entityIdFromShapeId, shapeIdForEntity, shapeIdForZone } from './canvas/ids'
import { customShapeUtils } from './shapes'
import { entities, flows, zones } from './model/topology'
import { steps } from './model/steps'
import { auditEditor, validateStaticModel } from './validation/modelValidation'
import { computeRouteScene } from './routing/computeRoutes'
import type { RouteSceneLayout } from './routing/types'
import { RouteOverlay } from './renderer/RouteOverlay'

type Mode = 'presentation' | 'workshop'

export function App() {
  const [mode, setMode] = useState<Mode>('presentation')
  const [stepIndex, setStepIndex] = useState(0)
  const [auditErrors, setAuditErrors] = useState<string[]>(() => validateStaticModel())
  const [routeScene, setRouteScene] = useState<RouteSceneLayout>({ routes: [], labels: [], errors: [] })
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [pulseLabel, setPulseLabel] = useState('')
  const [pulseLinks, setPulseLinks] = useState<string[]>([])
  const editorRef = useRef<Editor | null>(null)
  const pulseTimeoutRef = useRef<number | undefined>(undefined)

  const step = steps[stepIndex]
  const pulseLinkSet = useMemo(() => new Set(pulseLinks), [pulseLinks])

  const refreshRouteAndAudit = useCallback((editor: Editor, currentStep: typeof step) => {
    const nextRouteScene = computeRouteScene(editor, currentStep)
    setRouteScene(nextRouteScene)
    setAuditErrors([...validateStaticModel(), ...auditEditor(editor, nextRouteScene)])
    return nextRouteScene
  }, [])

  const setStep = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex))
      window.clearTimeout(pulseTimeoutRef.current)
      setPulseLabel('')
      setPulseLinks([])
      setStepIndex(clamped)
      const editor = editorRef.current
      if (editor) {
        applyStep(editor, steps[clamped], mode === 'workshop')
        refreshRouteAndAudit(editor, steps[clamped])
      }
    },
    [mode, refreshRouteAndAudit]
  )

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor
      setEditorInstance(editor)
      seedWhiteboard(editor)
      applyStep(editor, step, mode === 'workshop')
      refreshRouteAndAudit(editor, step)
      queueMicrotask(() => fitVisibleContent(editor))
    },
    [mode, refreshRouteAndAudit, step]
  )

  const triggerPulse = useCallback(
    (entityId: string) => {
      const editor = editorRef.current
      if (!editor || !step.visibleEntities.includes(entityId)) return
      const visibleLinks = new Set(step.visibleLinks)
      const flow = flows.find((item) => item.trigger === entityId && item.links.some((linkId) => visibleLinks.has(linkId)))
      if (!flow) {
        setPulseLabel('No visible flow is attached to that asset in this step.')
        return
      }

      window.clearTimeout(pulseTimeoutRef.current)
      const pulseLinks = flow.links.filter((linkId) => visibleLinks.has(linkId))
      setPulseLinks(pulseLinks)
      setPulseLabel(`Flow pulse: ${flow.label}`)
      pulseTimeoutRef.current = window.setTimeout(() => {
        setPulseLinks([])
        setPulseLabel('')
      }, 1400)
    },
    [mode, step]
  )

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    applyStep(editor, step, mode === 'workshop')
    refreshRouteAndAudit(editor, step)
  }, [mode, refreshRouteAndAudit, step])

  useEffect(() => {
    const editor = editorInstance
    if (!editor) return
    return editor.store.listen(() => {
      refreshRouteAndAudit(editor, steps[stepIndex])
    })
  }, [editorInstance, refreshRouteAndAudit, stepIndex])

  useEffect(() => {
    const next = document.querySelector<HTMLButtonElement>('#btn-next')
    const prev = document.querySelector<HTMLButtonElement>('#btn-prev')
    const reset = document.querySelector<HTMLButtonElement>('#btn-reset')
    const indicator = document.querySelector<HTMLElement>('.step-indicator')
    const narration = document.querySelector<HTMLElement>('.narration')

    if (indicator) indicator.textContent = `${step.label} ${stepIndex + 1}/${steps.length}`
    if (next) next.disabled = stepIndex >= steps.length - 1
    if (prev) prev.disabled = stepIndex <= 0
    if (narration) {
      narration.innerHTML = `<p><span class="tag ${step.tag.toLowerCase()}">${step.tag}</span> ${escapeHtml(
        step.narration
      )}</p>`
    }

    const handleNext = () => setStep(stepIndex + 1)
    const handlePrev = () => setStep(stepIndex - 1)
    const handleReset = () => setStep(0)
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.code === 'Space' || event.key === 'ArrowRight') {
        event.preventDefault()
        setStep(stepIndex + 1)
      }
      if (event.key === 'ArrowLeft') setStep(stepIndex - 1)
    }

    next?.addEventListener('click', handleNext)
    prev?.addEventListener('click', handlePrev)
    reset?.addEventListener('click', handleReset)
    window.addEventListener('keydown', handleKey)

    return () => {
      next?.removeEventListener('click', handleNext)
      prev?.removeEventListener('click', handlePrev)
      reset?.removeEventListener('click', handleReset)
      window.removeEventListener('keydown', handleKey)
    }
  }, [setStep, step, stepIndex])

  useEffect(() => {
    const stage = document.querySelector('.wb-stage')
    const editor = editorRef.current
    if (!stage || !editor) return
    const resizeObserver = new ResizeObserver(() => fitVisibleContent(editor))
    resizeObserver.observe(stage)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const handlePulse = (event: Event) => {
      const entityId = (event as CustomEvent<{ entityId: string }>).detail?.entityId
      if (entityId) triggerPulse(entityId)
    }

    const handleCanvasPick = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target?.closest('.tl-container')) return
      const device = target.closest<HTMLElement>('[data-entity-id]')
      if (device?.dataset.entityId) {
        triggerPulse(device.dataset.entityId)
        return
      }
      window.setTimeout(() => {
        const selected = editorRef.current?.getSelectedShapeIds()[0]
        const entityId = selected ? entityIdFromShapeId(selected) : undefined
        if (entityId) triggerPulse(entityId)
      }, 0)
    }

    window.addEventListener('ot-node-pulse', handlePulse)
    window.addEventListener('pointerdown', handleCanvasPick, true)
    window.addEventListener('pointerup', handleCanvasPick, true)
    window.addEventListener('click', handleCanvasPick, true)
    return () => {
      window.removeEventListener('ot-node-pulse', handlePulse)
      window.removeEventListener('pointerdown', handleCanvasPick, true)
      window.removeEventListener('pointerup', handleCanvasPick, true)
      window.removeEventListener('click', handleCanvasPick, true)
    }
  }, [triggerPulse])

  useEffect(() => {
    if (mode !== 'workshop') return
    const interval = window.setInterval(() => {
      const editor = editorRef.current
      if (!editor) return
      repairWorkshopGeometry(editor)
      refreshRouteAndAudit(editor, step)
    }, 450)
    return () => window.clearInterval(interval)
  }, [mode, refreshRouteAndAudit, step])

  const hasErrors = auditErrors.length > 0
  const statusText = useMemo(() => {
    if (hasErrors) return `${auditErrors.length} rule issue${auditErrors.length === 1 ? '' : 's'}`
    return mode === 'presentation' ? 'Presentation-safe' : 'Workshop rules active'
  }, [auditErrors.length, hasErrors, mode])

  return (
    <div className="whiteboard-workshop">
      <div className="wb-toolbar">
        <div className="wb-mode-tabs" aria-label="Whiteboard mode">
          <button
            type="button"
            className={mode === 'presentation' ? 'active' : ''}
            onClick={() => setMode('presentation')}
          >
            Presentation
          </button>
          <button type="button" className={mode === 'workshop' ? 'active' : ''} onClick={() => setMode('workshop')}>
            Workshop
          </button>
        </div>
        <div className={`wb-rule-status ${hasErrors ? 'bad' : 'ok'}`}>{statusText}</div>
        {pulseLabel ? <div className="wb-pulse-status">{pulseLabel}</div> : null}
      </div>
      <Tldraw
        shapeUtils={customShapeUtils}
        onMount={onMount}
        hideUi={mode === 'presentation'}
        persistenceKey={undefined}
        options={{ maxPages: 1 }}
      />
      <RouteOverlay editor={editorInstance} layout={routeScene} step={step} pulseLinks={pulseLinkSet} />
      {hasErrors ? <div className="qa-failure-overlay">Whiteboard QA failed: {auditErrors.slice(0, 5).join(' | ')}</div> : null}
    </div>
  )
}

function repairWorkshopGeometry(editor: Editor) {
  const updates: TLShapePartial[] = []
  const visibleDevices = entities
    .map((entity) => ({ entity, shape: editor.getShape(shapeIdForEntity(entity.id)) }))
    .filter((item) => item.shape && item.shape.opacity > 0.03)

  for (const item of visibleDevices) {
    const shape = item.shape!
    const zone = zones.find((candidate) => candidate.id === item.entity.zone)
    if (!zone) continue
    const bounds = editor.getShapePageBounds(shape.id)
    const zoneBounds = editor.getShapePageBounds(shapeIdForZone(zone.id))
    if (!bounds || !zoneBounds) continue

    const safeZone = zoneBounds.clone().expandBy(-18)
    let x = shape.x
    let y = shape.y
    if (bounds.x < safeZone.x) x += safeZone.x - bounds.x
    if (bounds.y < safeZone.y + 38) y += safeZone.y + 38 - bounds.y
    if (bounds.maxX > safeZone.maxX) x -= bounds.maxX - safeZone.maxX
    if (bounds.maxY > safeZone.maxY) y -= bounds.maxY - safeZone.maxY

    if (x !== shape.x || y !== shape.y) updates.push({ id: shape.id, type: shape.type, x, y } as TLShapePartial)
  }

  const placed: { id: string; bounds: ReturnType<Editor['getShapePageBounds']> }[] = []
  for (const item of visibleDevices) {
    const shape = item.shape!
    const bounds = editor.getShapePageBounds(shape.id)
    if (!bounds) continue
    const collision = placed.find((other) => other.bounds?.clone().expandBy(18).collides(bounds))
    if (collision) {
      updates.push({ id: shape.id, type: shape.type, x: shape.x + 36, y: shape.y + 26 } as TLShapePartial)
    }
    placed.push({ id: shape.id, bounds })
  }

  if (updates.length) editor.updateShapes(updates)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}
