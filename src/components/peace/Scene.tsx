'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { Earth } from './Earth'
import { Clouds } from './Clouds'
import { Atmosphere } from './Atmosphere'
import { WarMarkers } from './WarMarkers'
import { Stars } from './Stars'
import { Effects } from './Effects'
import { CameraRig } from './CameraRig'

/**
 * Earth + WarMarkers rotate together inside this group so that
 * the markers stay anchored to the correct geographic locations
 * as the planet spins. The group's quaternion is driven by CameraRig
 * (via the ref passed down from Scene) to bring each conflict to the
 * front-center of the view.
 */
function EarthGroup({
  groupRef,
  cloudsRef,
  onMarkerClick,
}: {
  groupRef: React.RefObject<THREE.Group | null>
  cloudsRef: React.RefObject<THREE.Group | null>
  onMarkerClick?: (conflict: import('@/lib/conflicts').Conflict) => void
}) {
  useFrame((_, delta) => {
    // Clouds rotate slightly faster than the earth for parallax.
    // The earth group rotation is controlled by CameraRig, so we
    // only add a small delta to clouds here.
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <Earth />
        <WarMarkers onMarkerClick={onMarkerClick} />
      </group>
      <group ref={cloudsRef}>
        <Clouds rotate={false} />
      </group>
    </>
  )
}

/**
 * Full 3D scene.
 *
 * Lighting — intentionally minimal & naturalistic:
 *  - One warm "sun" directional light for the day side
 *  - Very low cool ambient so the night side is not pitch black
 *
 * No rim light, no fill light — the previous multi-light setup
 * produced confusing dual-shadow shading that looked "莫名其妙".
 * The camera + earth rotation are driven by CameraRig based on
 * scroll progress.
 */
export function Scene({
  onMarkerClick,
}: {
  onMarkerClick?: (conflict: import('@/lib/conflicts').Conflict) => void
}) {
  const earthGroupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Group>(null)

  return (
    <>
      {/* Single warm sun light — like real sunlight from one direction */}
      <directionalLight position={[5, 2, 4]} intensity={1.6} color={'#fff1d6'} />
      {/* Very low cool ambient so night side is just barely visible */}
      <ambientLight intensity={0.06} color={'#2a3a5a'} />

      <EarthGroup
        groupRef={earthGroupRef}
        cloudsRef={cloudsRef}
        onMarkerClick={onMarkerClick}
      />
      <Atmosphere />
      <Stars count={3500} radius={50} />

      <Effects />

      <CameraRig earthGroupRef={earthGroupRef} />
    </>
  )
}
