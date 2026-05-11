import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addStencilEntity, computeBoardLayout, createInitialEntities, moveEntityWithRules, toModelPoint } from './engine/layout'
import { inflate, rectMaxX, rectMaxY } from './engine/geometry'
import type { DiagramEntity, DragState } from './engine/diagramModel'
import { loadWorkshopDraft, resetWorkshopDraft, sameEntityLayout, saveWorkshopDraft } from './engine/workshopDraft'
import { flows } from './model/topology'
import { steps } from './model/steps'
import { computeRouteScene } from './routing/computeRoutes'
import { auditDiagram, validateStaticModel } from './validation/modelValidation'
import { PulseHitLayer } from './renderer/PulseHitLayer'
import { RouteOverlay } from './renderer/RouteOverlay'

type Mode = 'presentation' | 'workshop'

const MIN_SHELL_WIDTH = 320
const MIN_SHELL_HEIGHT = 420

const STENCIL: Array<{ kind: DiagramEntity['kind']; label: string }> = [
  { kind: 'switch', label: 'Switch' },
  { kind: 'firewall', label: 'Firewall' },
  { kind: 'server', label: 'Server' },
  { kind: 'workstation', label: 'Workstation' },
  { kind: 'controller', label: 'PLC / RTU' },
  { kind: 'sensor', label: 'Sensor' },
  { kind: 'store', label: 'Store' },
]

export function App() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [mode, setMode] = useState<Mode>('presentation')
  const [stepIndex, setStepIndex] = useState(0)
  const presentationEntities = useMemo(() => createInitialEntities(), [])
  const [workshopEntities, setWorkshopEntities] = useState<DiagramEntity[]>(() => loadWorkshopDraft(presentationEntities))
  const [viewport, setViewport] = useState({ width: 1900, height: 940 })
  const [pulseLinks, setPulseLinks] = useState<string[]>([])
  const [pulseLabel, setPulseLabel] = useState('')
  const dragRef = useRef<DragState | null>(null)
  const pulseTimeoutRef = useRef<number | undefined>(undefined)

  const step = steps[stepIndex]
  const activeEntities = mode === 'presentation' ? presentationEntities : workshopEntities
  const layout = useMemo(() => computeBoardLayout(activeEntities, undefined, viewport), [activeEntities, viewport])
  const routeScene = useMemo(() => computeRouteScene(layout, step), [layout, step])
  const stateGuardErrors = useMemo(() => auditPresentationState(mode, activeEntities, presentationEntities), [activeEntities, mode, presentationEntities])
  const auditErrors = useMemo(() => [...validateStaticModel(), ...auditDiagram(layout, step, routeScene), ...stateGuardErrors], [layout, routeScene, stateGuardErrors, step])
  const pulseLinkSet = useMemo(() => new Set(pulseLinks), [pulseLinks])
  const shell = { width: Math.max(MIN_SHELL_WIDTH, viewport.width - 14), height: Math.max(MIN_SHELL_HEIGHT, viewport.height - 14) }
  const view = useMemo(() => computeStepView(layout, step, routeScene, shell.width / shell.height), [layout, routeScene, shell.height, shell.width, step])
  const scale = Math.max(0.32, Math.min(shell.width / view.w, shell.height / view.h))
  const focused = useMemo(() => new Set(step.focus ?? step.active ?? []), [step])
  const focusContainsEntity = useMemo(() => layout.entities.some((entity) => focused.has(entity.id)), [focused, layout.entities])
  const hasErrors = auditErrors.length > 0

  const setStep = useCallback((nextIndex: number) => {
    window.clearTimeout(pulseTimeoutRef.current)
    setPulseLinks([])
    setPulseLabel('')
    setStepIndex(Math.max(0, Math.min(steps.length - 1, nextIndex)))
  }, [])

  const clearPulseState = useCallback(() => {
    window.clearTimeout(pulseTimeoutRef.current)
    setPulseLinks([])
    setPulseLabel('')
  }, [])

  const resetWorkshop = useCallback(() => {
    clearPulseState()
    setWorkshopEntities(resetWorkshopDraft(presentationEntities))
  }, [clearPulseState, presentationEntities])

  const triggerPulse = useCallback(
    (entityId: string) => {
      if (mode !== 'presentation') return
      if (!step.visibleEntities.includes(entityId)) return
      const visibleLinks = new Set(step.visibleLinks)
      const flow = flows.find((item) => item.trigger === entityId && item.links.some((linkId) => visibleLinks.has(linkId)))
      if (!flow) {
        setPulseLabel('')
        return
      }
      window.clearTimeout(pulseTimeoutRef.current)
      const nextPulseLinks = flow.links.filter((linkId) => visibleLinks.has(linkId))
      setPulseLinks(nextPulseLinks)
      setPulseLabel(`Flow pulse: ${flow.label}`)
      pulseTimeoutRef.current = window.setTimeout(() => {
        setPulseLinks([])
        setPulseLabel('')
      }, 1400)
    },
    [mode, step]
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setViewport({ width: Math.max(MIN_SHELL_WIDTH, box.width), height: Math.max(MIN_SHELL_HEIGHT, box.height) })
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    clearPulseState()
    dragRef.current = null
  }, [clearPulseState, mode])

  useEffect(() => {
    saveWorkshopDraft(workshopEntities)
  }, [workshopEntities])

  useEffect(() => {
    const next = document.querySelector<HTMLButtonElement>('#btn-next')
    const prev = document.querySelector<HTMLButtonElement>('#btn-prev')
    const reset = document.querySelector<HTMLButtonElement>('#btn-reset')
    const indicator = document.querySelector<HTMLElement>('.step-indicator')
    const narration = document.querySelector<HTMLElement>('.narration')
    if (indicator) indicator.textContent = `${step.label} ${stepIndex + 1}/${steps.length}`
    if (next) next.disabled = stepIndex >= steps.length - 1
    if (prev) prev.disabled = stepIndex <= 0
    if (narration) narration.innerHTML = `<p><span class="tag ${step.tag.toLowerCase()}">${step.tag}</span> ${escapeHtml(step.narration)}</p>`

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

  const handlePointerDown = (event: React.PointerEvent, entity: DiagramEntity) => {
    if (mode !== 'workshop') return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: entity.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: entity.x, originY: entity.y }
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || mode !== 'workshop') return
    const dx = (event.clientX - drag.startX) / scale
    const dy = (event.clientY - drag.startY) / scale
    const modelPoint = toModelPoint({ x: drag.originX + dx, y: drag.originY + dy }, viewport)
    setWorkshopEntities((current) => moveEntityWithRules(current, drag.id, modelPoint))
  }

  const stopDrag = (event: React.PointerEvent) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  const statusText = hasErrors
    ? `${auditErrors.length} rule issue${auditErrors.length === 1 ? '' : 's'}`
    : mode === 'presentation'
      ? `Presentation-safe · ${routeScene.quality.visibleRoutes} bound routes`
      : `Grid + snap + ports active · ${routeScene.quality.visibleRoutes} bound routes`
  const stateText = mode === 'presentation' ? 'Presentation baseline locked' : 'Workshop draft saved'

  return (
    <div ref={rootRef} className={`visio-whiteboard wb-mode-${mode}`} onPointerMove={handlePointerMove} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <div className="wb-toolbar">
        <div className="wb-mode-tabs" aria-label="Whiteboard mode">
          <button type="button" className={mode === 'presentation' ? 'active' : ''} onClick={() => setMode('presentation')}>
            Presentation
          </button>
          <button type="button" className={mode === 'workshop' ? 'active' : ''} onClick={() => setMode('workshop')}>
            Workshop
          </button>
        </div>
        <button type="button" className="wb-tool-button" onClick={resetWorkshop}>
          Reset Workshop
        </button>
        <div className="wb-state-status">{stateText}</div>
        <div className={`wb-rule-status ${hasErrors ? 'bad' : 'ok'}`}>{statusText}</div>
        {pulseLabel ? <div className="wb-pulse-status">{pulseLabel}</div> : null}
      </div>
      {mode === 'workshop' ? (
        <aside className="wb-stencil" aria-label="Workshop stencil">
          <div className="wb-stencil-title">OT stencil</div>
          {STENCIL.map((item) => (
            <button key={item.kind} type="button" onClick={() => setWorkshopEntities((current) => addStencilEntity(current, item.kind))}>
              <span className={`node-icon ${iconClass(item.kind)}`} />
              {item.label}
            </button>
          ))}
        </aside>
      ) : null}
      <div className="wb-board-shell" style={{ width: shell.width, height: shell.height }}>
        <div
          className="wb-board"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `scale(${scale}) translate(${-view.x}px, ${-view.y}px)`,
          }}
        >
          <div className="wb-grid" />
          <div className="wb-title-block">
            <h2>Federal OT Network Whiteboard</h2>
            <p>Customer topology, boundary paths, passive collection points, and SOC handoff are modeled as bound diagram entities.</p>
          </div>
          {layout.zones
            .filter((zone) => step.visibleZones.includes(zone.id))
            .map((zone) => (
              <section key={zone.id} className={`wb-zone wb-zone-${zone.id} ${focused.has(zone.id) ? 'focused' : ''}`} style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}>
                <h3>{zone.title}</h3>
                <p>{zone.subtitle}</p>
              </section>
            ))}
          <RouteOverlay layout={routeScene} step={step} pulseLinks={pulseLinkSet} width={layout.width} height={layout.height} />
          <div className="wb-device-layer">
            {layout.entities
              .filter((entity) => step.visibleEntities.includes(entity.id) || (mode === 'workshop' && entity.runtime))
              .map((entity) => (
                <DeviceNode
                  key={entity.id}
                  entity={entity}
                  focused={focused.has(entity.id)}
                  dimmed={focusContainsEntity && focused.size > 0 && !focused.has(entity.id)}
                  workshop={mode === 'workshop'}
                  onPulse={triggerPulse}
                  onPointerDown={handlePointerDown}
                />
              ))}
          </div>
          {step.id === 'pov-checklist' || step.id === 'close' ? <CloseCard /> : null}
          {mode === 'presentation' ? <PulseHitLayer layout={layout} step={step} onPulse={triggerPulse} /> : null}
        </div>
      </div>
      {hasErrors ? <div className="qa-failure-overlay">Whiteboard QA failed: {auditErrors.slice(0, 5).join(' | ')}</div> : null}
    </div>
  )
}

function DeviceNode({
  entity,
  focused,
  dimmed,
  workshop,
  onPulse,
  onPointerDown,
}: {
  entity: DiagramEntity
  focused: boolean
  dimmed: boolean
  workshop: boolean
  onPulse: (entityId: string) => void
  onPointerDown: (event: React.PointerEvent, entity: DiagramEntity) => void
}) {
  return (
    <button
      type="button"
      className={`wb-device wb-device-${entity.role ?? entity.kind} ${focused ? 'focused' : ''} ${dimmed ? 'dimmed' : ''} ${workshop ? 'workshop' : ''}`}
      style={{ left: entity.x, top: entity.y, width: entity.w ?? 180, height: entity.h ?? 70 }}
      onClick={() => onPulse(entity.id)}
      onPointerDown={(event) => onPointerDown(event, entity)}
      data-entity-id={entity.id}
    >
      <span className={`node-icon ${iconClass(entity.kind)}`} />
      <span className="wb-device-text">
        <strong>{entity.label}</strong>
        <span>{entity.subtitle}</span>
      </span>
      {workshop ? <Ports /> : null}
    </button>
  )
}

function Ports() {
  return (
    <>
      <span className="wb-port left" />
      <span className="wb-port right" />
      <span className="wb-port top" />
      <span className="wb-port bottom" />
    </>
  )
}

function CloseCard() {
  return (
    <div className="wb-close-card">
      <h3>Close the technical plan</h3>
      <p>Ports, SPAN source, baseline window, SOC handoff, success criteria.</p>
    </div>
  )
}

function iconClass(kind: DiagramEntity['kind']) {
  switch (kind) {
    case 'firewall':
      return 'icon-firewall'
    case 'switch':
      return 'icon-switch'
    case 'server':
    case 'broker':
      return 'icon-server'
    case 'workstation':
    case 'jump':
      return 'icon-workstation'
    case 'controller':
      return 'icon-controller'
    case 'sensor':
      return 'icon-sensor'
    case 'store':
      return 'icon-analytics'
    case 'identity':
      return 'icon-identity'
    default:
      return 'icon-app'
  }
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

function auditPresentationState(mode: Mode, activeEntities: DiagramEntity[], presentationEntities: DiagramEntity[]) {
  if (mode !== 'presentation') return []
  const errors: string[] = []
  if (!sameEntityLayout(activeEntities, presentationEntities)) errors.push('presentation is not using the locked baseline')
  if (activeEntities.some((entity) => entity.runtime)) errors.push('workshop runtime entity leaked into presentation')
  return errors
}

function computeStepView(
  layout: ReturnType<typeof computeBoardLayout>,
  step: (typeof steps)[number],
  routeScene: ReturnType<typeof computeRouteScene>,
  targetAspect: number
) {
  const boxes = [
    { x: 16, y: 14, w: 660, h: 62 },
    ...step.visibleZones.map((id) => layout.zoneBoxes[id]).filter(Boolean),
    ...step.visibleEntities.map((id) => layout.entityBoxes[id]).filter(Boolean),
    ...routeScene.labels,
  ]

  for (const route of routeScene.routes) {
    const xs = route.points.map((point) => point.x)
    const ys = route.points.map((point) => point.y)
    boxes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) })
  }

  const minX = Math.max(0, Math.min(...boxes.map((box) => box.x)) - 28)
  const minY = Math.max(0, Math.min(...boxes.map((box) => box.y)) - 28)
  const maxX = Math.min(layout.width, Math.max(...boxes.map((box) => rectMaxX(box))) + 28)
  const maxY = Math.min(layout.height, Math.max(...boxes.map((box) => rectMaxY(box))) + 28)
  return expandViewToAspect({ x: minX, y: minY, w: Math.max(720, maxX - minX), h: Math.max(420, maxY - minY) }, targetAspect, layout.width, layout.height)
}

function expandViewToAspect(view: { x: number; y: number; w: number; h: number }, targetAspect: number, boardWidth: number, boardHeight: number) {
  let next = { ...view }
  const currentAspect = next.w / next.h
  if (currentAspect > targetAspect) {
    const desiredH = next.w / targetAspect
    next.y -= (desiredH - next.h) / 2
    next.h = desiredH
  } else {
    const desiredW = next.h * targetAspect
    next.x -= (desiredW - next.w) / 2
    next.w = desiredW
  }
  if (next.x < 0) next.x = 0
  if (next.y < 0) next.y = 0
  if (rectMaxX(next) > boardWidth) next.x = Math.max(0, boardWidth - next.w)
  if (rectMaxY(next) > boardHeight) next.y = Math.max(0, boardHeight - next.h)
  next.w = Math.min(next.w, boardWidth)
  next.h = Math.min(next.h, boardHeight)
  return inflate(next, 0)
}
