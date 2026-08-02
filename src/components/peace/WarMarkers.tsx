'use client'

import { CONFLICTS, type Conflict } from '@/lib/conflicts'
import { sceneState } from '@/lib/sceneState'
import { WarMarker } from './WarMarker'

interface WarMarkersProps {
  earthRadius?: number
  /** Called when a marker is clicked. Only active in free explore mode. */
  onMarkerClick?: (conflict: Conflict) => void
}

/**
 * Renders all conflict markers on the earth surface.
 *
 * Must be placed inside the rotating EarthGroup so that markers
 * rotate together with the earth.
 *
 * Markers are only clickable when onMarkerClick is provided (i.e., in
 * free explore mode). The click target is an invisible larger sphere
 * around each marker for easy clicking.
 */
export function WarMarkers({ earthRadius = 1, onMarkerClick }: WarMarkersProps) {
  // In free mode, pass the click handler. In scroll mode, don't pass it
  // (markers won't have click targets, so they won't intercept orbit drags).
  const handler = sceneState.freeMode ? onMarkerClick : undefined

  return (
    <group>
      {CONFLICTS.map((c) => (
        <WarMarker
          key={c.id}
          conflict={c}
          earthRadius={earthRadius}
          onClick={handler}
        />
      ))}
    </group>
  )
}
