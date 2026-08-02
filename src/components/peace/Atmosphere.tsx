'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { EARTH_RADIUS_VALUE } from '@/lib/geo'

/**
 * Atmospheric glow shell.
 *
 * A slightly larger sphere rendered with BackSide and a custom fresnel
 * shader produces the soft blue rim around the planet. The shader
 * computes a fresnel term based on the view angle to surface normals,
 * so the rim glows brightest where the surface is grazing the camera.
 */
export function Atmosphere() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color('#4ea2ff') },
        intensity: { value: 1.1 },
        power: { value: 2.4 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 glowColor;
        uniform float intensity;
        uniform float power;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          // Fresnel: 1 at grazing angles, 0 facing the camera.
          // BackSide -> normals point inward, so flip the dot.
          float rim = pow(1.0 - abs(dot(vNormal, -vPositionNormal)), power);
          vec3 col = glowColor * rim * intensity;
          gl_FragColor = vec4(col, rim);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
  }, [])

  return (
    <mesh material={material} scale={1.18}>
      <sphereGeometry args={[EARTH_RADIUS_VALUE, 64, 64]} />
    </mesh>
  )
}
