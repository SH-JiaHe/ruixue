'use client'

import { useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

import { EARTH_RADIUS_VALUE } from '@/lib/geo'

/**
 * High-quality realistic Earth.
 *
 * Uses NASA Blue Marble textures:
 *  - earth_atmos_2048.jpg   : color / day map
 *  - earth_normal_2048.jpg  : surface normal map (terrain relief)
 *  - earth_specular_2048.jpg: ocean specular / land mask (used as roughness)
 *
 * Lit by a warm directional "sun" light placed outside the scene.
 * The earth is a high-resolution sphere (128 segments) so that
 * the normal map produces crisp terrain detail.
 *
 * Rotation is handled by the parent EarthGroup in Scene.tsx so that
 * WarMarkers and Clouds can rotate together with the surface.
 */
export function Earth() {
  // Note: texture paths are relative to /public
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth_atmos_2048.jpg',
    '/textures/earth_normal_2048.jpg',
    '/textures/earth_specular_2048.jpg',
  ])

  // Configure texture color spaces and filtering for crisp visuals.
  // Must run as an effect (not useMemo) because we are mutating
  // objects returned from the useTexture hook.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    colorMap.colorSpace = THREE.SRGBColorSpace
    colorMap.anisotropy = 8
    normalMap.anisotropy = 8
    specularMap.anisotropy = 8
    ;[colorMap, normalMap, specularMap].forEach((t) => {
      t.wrapS = THREE.RepeatWrapping
      t.wrapT = THREE.ClampToEdgeWrapping
      t.needsUpdate = true
    })
    /* eslint-enable react-hooks/immutability */
  }, [colorMap, normalMap, specularMap])

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      // Specular map: ocean is white (smooth), land is dark (rough).
      // For MeshStandardMaterial we use it as a roughness map (inverted).
      roughnessMap: specularMap,
      roughness: 1,
      metalness: 0,
      // Slightly boost ambient response so the night side is not pitch black.
      envMapIntensity: 0.4,
    })
  }, [colorMap, normalMap, specularMap])

  return (
    <mesh material={material} castShadow receiveShadow>
      {/* 128 segments gives smooth, high-quality sphere geometry */}
      <sphereGeometry args={[EARTH_RADIUS_VALUE, 128, 128]} />
    </mesh>
  )
}
