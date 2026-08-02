'use client'

import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'

import { NARRATIVE_CONFLICTS, sceneState } from '@/lib/sceneState'
import { latLngToVector3 } from '@/lib/geo'

interface CameraRigProps {
  /** Ref to the earth group so we can rotate it to face each conflict. */
  earthGroupRef: React.RefObject<THREE.Group | null>
}

/**
 * For each conflict, precompute the quaternion that rotates the earth
 * so that the conflict's surface position ends up at (0, 0, 1) —
 * i.e. the front-center of the visible disk, directly facing the camera.
 *
 * This is much cleaner than the previous approach which tried to fly
 * the camera close to each conflict's surface normal — that produced
 * weird off-axis angles for high-latitude conflicts (Ukraine, Syria)
 * and zoomed in too aggressively.
 *
 * With this approach:
 *  - Camera stays in a clean, controlled position
 *  - Earth rotates so each conflict comes to the front-center
 *  - The conflict marker is always well-framed, regardless of latitude
 */
function computeConflictQuaternion(lat: number, lng: number): THREE.Quaternion {
  // Local position of the conflict on the earth (before earth rotation).
  const localPos = latLngToVector3(lat, lng, 1).normalize()
  // Target: front-center of the visible disk.
  const target = new THREE.Vector3(0, 0, 1)
  // Quaternion that rotates localPos to target.
  return new THREE.Quaternion().setFromUnitVectors(localPos, target)
}

// === Camera positions for each "chapter" of the scroll narrative ===

// Intro: viewing the whole earth from front, slightly above.
const INTRO_CAM_POS = new THREE.Vector3(0, 0.45, 3.0)
const INTRO_CAM_TARGET = new THREE.Vector3(0, 0, 0)
const INTRO_QUAT = new THREE.Quaternion() // identity — earth's default orientation

// Conflict view: closer, slightly lower angle for a "diving in" feel.
// Camera looks at (0, 0, 1) — the conflict point on the surface.
const CONFLICT_CAM_POS = new THREE.Vector3(0, 0.18, 2.45)
const CONFLICT_CAM_TARGET = new THREE.Vector3(0, 0, 1)

// Outro: pull back to a wide, contemplative view from slightly above.
const OUTRO_CAM_POS = new THREE.Vector3(0, 0.7, 3.7)
const OUTRO_CAM_TARGET = new THREE.Vector3(0, 0, 0)
const OUTRO_QUAT = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, Math.PI * 0.4, 0),
)

// Smoother easing: smootherstep
function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

interface ChapterView {
  pos: THREE.Vector3
  target: THREE.Vector3
  quat: THREE.Quaternion
  focusIdx: number // -1 for intro/outro, 0..N-1 for conflicts
}

/**
 * CameraRig drives the camera and earth rotation based on scroll progress.
 *
 * The scroll is divided into chapters:
 *  Chapter 0           : intro (whole earth view)
 *  Chapter 1..N        : each conflict (earth rotates to bring it forward)
 *  Chapter N+1         : outro quote (wide view)
 *
 * Within each chapter K (1..N), the first 60% is a smooth transition FROM
 * chapter K-1's view TO chapter K's view (i.e. rotating the earth to bring
 * conflict K-1 to the front-center). The last 40% is a "hold" on chapter K's
 * view, giving the user time to read the side panel.
 *
 * This way, the side panel's info card (which shows conflict K-1 during
 * chapter K) always matches the visible front-center of the earth.
 *
 * In freeMode (toggled by the Free Explore button), the CameraRig
 * disables itself and hands control to OrbitControls.
 */
export function CameraRig({ earthGroupRef }: CameraRigProps) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const currentFocus = useRef(-2) // -2 ensures first update fires

  // Precompute the conflict quaternions once.
  const conflictQuats = useMemo(
    () => NARRATIVE_CONFLICTS.map((c) => computeConflictQuaternion(c.lat, c.lng)),
    [],
  )

  // Persistent temporaries (avoid allocating in useFrame).
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])

  // Set up initial camera.
  useEffect(() => {
    camera.position.copy(INTRO_CAM_POS)
    camera.lookAt(INTRO_CAM_TARGET)
    if (earthGroupRef.current) {
      earthGroupRef.current.quaternion.copy(INTRO_QUAT)
    }
  }, [camera, earthGroupRef])

  useFrame((_, delta) => {
    if (sceneState.freeMode) {
      // Free mode: OrbitControls handles camera.
      if (controlsRef.current) {
        controlsRef.current.enabled = true
        controlsRef.current.update()
      }
      return
    }

    // Scroll-driven mode.
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    const p = sceneState.progress // 0..1

    // Map progress to chapter index.
    const N = conflictQuats.length
    const totalChapters = N + 2
    const chapterFloat = p * totalChapters
    const chapterIdx = Math.floor(chapterFloat)
    const chapterFrac = chapterFloat - chapterIdx

    // Build the "view at chapter center" lookup.
    const getViewAtChapter = (ch: number): ChapterView => {
      if (ch <= 0) {
        return {
          pos: INTRO_CAM_POS,
          target: INTRO_CAM_TARGET,
          quat: INTRO_QUAT,
          focusIdx: -1,
        }
      }
      if (ch >= N + 1) {
        return {
          pos: OUTRO_CAM_POS,
          target: OUTRO_CAM_TARGET,
          quat: OUTRO_QUAT,
          focusIdx: -1,
        }
      }
      return {
        pos: CONFLICT_CAM_POS,
        target: CONFLICT_CAM_TARGET,
        quat: conflictQuats[ch - 1],
        focusIdx: ch - 1,
      }
    }

    const ch1 = Math.max(0, Math.min(totalChapters - 1, chapterIdx))
    const ch0 = Math.max(0, ch1 - 1)

    // view0 = previous chapter's view, view1 = current chapter's view.
    // During each chapter K (1..N), the camera transitions FROM chapter K-1's
    // view TO chapter K's view in the first 60%, then HOLDS at chapter K's
    // view for the last 40%. This way, chapter K is dedicated to conflict K-1,
    // which matches what the info card / side panel shows.
    const view0 = getViewAtChapter(ch0)
    const view1 = getViewAtChapter(ch1)

    // First 60% of chapter is the transition; last 40% is hold.
    const transitionEnd = 0.6
    const t = smootherstep(0, transitionEnd, chapterFrac)

    // Interpolate camera position, target, and earth quaternion.
    tmpPos.lerpVectors(view0.pos, view1.pos, t)
    tmpTarget.lerpVectors(view0.target, view1.target, t)
    tmpQuat.copy(view0.quat).slerp(view1.quat, t)

    // Frame-rate independent damping for smooth, glassy motion.
    const damp = 1 - Math.pow(0.001, delta)
    camera.position.lerp(tmpPos, damp)
    camera.lookAt(tmpTarget)

    if (earthGroupRef.current) {
      earthGroupRef.current.quaternion.slerp(tmpQuat, damp)
    }

    // Update focus index for UI (side panel).
    // During the early transition (t < 0.5), we're still mostly at the previous
    // view, so show its focusIdx. Once we cross the midpoint, switch to the
    // current chapter's focusIdx.
    const focusIdx = t < 0.5 ? view0.focusIdx : view1.focusIdx
    if (focusIdx !== currentFocus.current) {
      currentFocus.current = focusIdx
      sceneState.focusIndex = focusIdx
      window.dispatchEvent(
        new CustomEvent('peace-focus-change', { detail: focusIdx }),
      )
    }
  })

  return (
    <OrbitControls
      ref={controlsRef as never}
      enabled={false}
      enablePan={false}
      enableZoom
      enableRotate
      minDistance={1.4}
      maxDistance={5}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      target={[0, 0, 0]}
    />
  )
}
