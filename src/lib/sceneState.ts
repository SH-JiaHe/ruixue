/**
 * Shared mutable state for the 3D scene.
 *
 * The page updates `progress` (0..1) and `freeMode` (boolean) on scroll /
 * button click. The 3D CameraRig reads these values every frame in
 * useFrame — no React re-render needed for the high-frequency camera
 * updates.
 *
 * For UI elements that need to re-render (SidePanel, DetailPanel), we use
 * React state / Zustand. But for the camera, a plain mutable object is
 * the most efficient approach.
 */
export const sceneState = {
  /** Scroll progress 0..1 across the entire scrollable page. */
  progress: 0,
  /** When true, the camera is free (OrbitControls), scroll does not move it. */
  freeMode: false,
  /**
   * Index of the conflict the camera is currently focused on.
   * In scroll mode, derived from progress.
   * In free mode, set by clicking a marker (or -1 for none).
   */
  focusIndex: -1,
}

/**
 * The conflicts in the order they appear in the scroll narrative.
 * This matches the CONFLICTS array from conflicts.ts but we re-export
 * here for convenience.
 */
import { CONFLICTS } from './conflicts'

export const NARRATIVE_CONFLICTS = CONFLICTS

/**
 * Total number of scroll "chapters":
 * 1 intro chapter + N conflict chapters + 1 quote chapter.
 */
export const CHAPTER_COUNT = NARRATIVE_CONFLICTS.length + 2
