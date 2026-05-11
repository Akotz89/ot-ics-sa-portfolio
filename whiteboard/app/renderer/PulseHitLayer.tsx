import type { BoardLayout } from '../engine/diagramModel'
import { flows } from '../model/topology'
import type { StepModel } from '../model/steps'

interface PulseHitLayerProps {
  layout: BoardLayout
  step: StepModel
  onPulse: (entityId: string) => void
}

export function PulseHitLayer({ layout, step, onPulse }: PulseHitLayerProps) {
  const visibleLinks = new Set(step.visibleLinks)
  const pulseableEntities = new Set(flows.filter((flow) => flow.links.some((linkId) => visibleLinks.has(linkId))).map((flow) => flow.trigger))

  return (
    <div className="ot-pulse-hit-layer" aria-hidden="true">
      {step.visibleEntities
        .filter((entityId) => pulseableEntities.has(entityId))
        .map((entityId) => {
          const bounds = layout.entityBoxes[entityId]
          if (!bounds) return null
          return (
            <button
              key={entityId}
              type="button"
              className="ot-pulse-hit"
              data-pulse-entity-id={entityId}
              style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h }}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onPulse(entityId)
              }}
              tabIndex={-1}
            />
          )
        })}
    </div>
  )
}
