'use client'

import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface DoveSpriteProps {
  orbitRadius?: number
  inclination?: number
  phase?: number
  speed?: number
  flapSpeed?: number
  scale?: number
  seed?: number
}

/**
 * A single dove rendered as a clean silhouette billboard sprite.
 *
 * Uses a hand-drawn vector silhouette (dove-silhouette.png) — NOT a
 * photo-keyed texture — so the shape is always clean and recognizable.
 *
 * The billboard always faces the camera. A subtle Y-scale oscillation
 * simulates wing flapping (the silhouette has spread wings, so squishing
 * vertically reads as wings going up/down).
 *
 * Movement: circular orbit around earth at the given inclination+phase.
 */
export function DoveSprite({
  orbitRadius = 1.55,
  inclination = 0.4,
  phase = 0,
  speed = 0.35,
  flapSpeed = 7,
  scale = 0.05,
  seed = 0,
}: DoveSpriteProps) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const tex = useTexture('/textures/doves/dove-silhouette.png')

  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.needsUpdate = true
    /* eslint-enable react-hooks/immutability */
  }, [tex])

  // Orbit plane basis.
  const orbitBasis = useMemo(() => {
    const q1 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      inclination,
    )
    const q2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      phase,
    )
    return q2.clone().multiply(q1)
  }, [inclination, phase])

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: tex },
        uFlap: { value: 0 },
        uOpacity: { value: 0.88 },
        uTint: { value: new THREE.Color('#ffffff') },
      },
      vertexShader: /* glsl */ `
        uniform float uFlap;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Billboard: cancel rotation, keep translation.
          vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          // Apply Y-scale oscillation (wing flap) in view space.
          vec2 offset = position.xy;
          offset.y *= (1.0 + uFlap * 0.25);
          mvPosition.xy += offset;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex;
        uniform float uOpacity;
        uniform vec3 uTint;
        varying vec2 vUv;
        void main() {
          vec4 col = texture2D(uTex, vUv);
          vec3 rgb = col.rgb * uTint;
          float alpha = col.a * uOpacity;
          if (alpha < 0.02) discard;
          gl_FragColor = vec4(rgb, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    })
    return m
  }, [tex])

  useEffect(() => {
    matRef.current = material
  }, [material])

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const group = groupRef.current
    if (!group) return

    // Orbit position
    const angle = t * speed + seed
    const x = Math.cos(angle) * orbitRadius
    const z = Math.sin(angle) * orbitRadius
    const pos = new THREE.Vector3(x, 0, z).applyQuaternion(orbitBasis)
    group.position.copy(pos)

    // Billboard: face camera
    const cam = state.camera.position.clone()
    group.lookAt(cam)

    // Flap — subtle Y-scale oscillation
    const flap = Math.sin(t * flapSpeed + seed * 2.0)
    if (matRef.current) {
      matRef.current.uniforms.uFlap.value = flap
    }

    // Subtle radial bob
    const up = pos.clone().normalize()
    const bob = Math.sin(t * flapSpeed * 0.5 + seed) * 0.012
    group.position.addScaledVector(up, bob)

    // Orient mesh so the dove's "forward" (beak, +X in texture) points
    // along its travel direction (tangent to orbit). Since the billboard
    // faces the camera, we rotate the mesh around its local Z (which is
    // the view axis) to align +X with the projected travel direction.
    if (meshRef.current) {
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle))
        .applyQuaternion(orbitBasis)
      // Project tangent into camera-facing plane
      const camDir = cam.clone().sub(pos).normalize()
      const right = new THREE.Vector3().crossVectors(camDir, up).normalize()
      const projTangent = tangent.clone().addScaledVector(
        up,
        -tangent.dot(up),
      ).normalize()
      // Angle between projected tangent and camera-right
      const dot = projTangent.dot(right)
      const det = projTangent.dot(camDir)
      const rotZ = Math.atan2(det, dot)
      meshRef.current.rotation.z = rotZ
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  )
}

interface DovesProps {
  count?: number
  orbitRadius?: number
  scale?: number
}

/**
 * A small flock of doves orbiting the earth.
 * Kept small and subtle so they never block the view.
 */
export function Doves({ count = 8, orbitRadius = 1.5, scale = 0.05 }: DovesProps) {
  const doves = useMemo(() => {
    const arr: DoveSpriteProps[] = []
    for (let i = 0; i < count; i++) {
      arr.push({
        orbitRadius: orbitRadius + (Math.random() - 0.5) * 0.3,
        inclination: (Math.random() - 0.5) * Math.PI * 0.9,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        flapSpeed: 6 + Math.random() * 4,
        scale,
        seed: Math.random() * 10,
      })
    }
    return arr
  }, [count, orbitRadius, scale])

  return (
    <group>
      {doves.map((d, i) => (
        <DoveSprite key={i} {...d} />
      ))}
    </group>
  )
}
