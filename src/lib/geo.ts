import * as THREE from 'three'

const EARTH_RADIUS = 1

/**
 * Convert latitude / longitude (in degrees) to a 3D vector on a sphere of given radius.
 * Uses the standard geographic convention:
 *   - lat 0, lng 0  -> (0, 0, R)  (front, prime meridian at equator)
 *   - lat 90        -> (0, R, 0)  (north pole)
 *   - lat -90       -> (0, -R, 0) (south pole)
 *
 * The texture we draw on the canvas is assumed to be a standard equirectangular map,
 * with the prime meridian at the horizontal center of the canvas.
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = EARTH_RADIUS,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180) // polar angle from +Y
  const theta = (lng + 180) * (Math.PI / 180) // azimuth, shifted so that lng 0 maps to -z (front)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

/**
 * Surface normal (pointing outward from earth center) for a given lat/lng.
 */
export function latLngNormal(lat: number, lng: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, 1).normalize()
}

/**
 * Compute a quaternion that aligns the +Y axis to the surface normal at lat/lng.
 * Useful for placing objects (markers, doves) on the earth surface.
 */
export function orientationAt(lat: number, lng: number): THREE.Quaternion {
  const normal = latLngNormal(lat, lng)
  const up = new THREE.Vector3(0, 1, 0)
  const q = new THREE.Quaternion().setFromUnitVectors(up, normal)
  return q
}

export const EARTH_RADIUS_VALUE = EARTH_RADIUS
