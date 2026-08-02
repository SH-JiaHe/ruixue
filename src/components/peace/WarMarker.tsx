'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLngToVector3 } from '@/lib/geo'
import type { Conflict } from '@/lib/conflicts'

/**
 * Elegant war marker — a small glowing dot with concentric "sonar"
 * pulse rings expanding outward across the earth's surface.
 *
 * Design intent:
 *  - Calm and respectful, not chaotic. The previous fire-particle
 *    design looked garish; this version reads as a soft distress
 *    beacon — quiet but impossible to ignore.
 *  - One small bright core (warm amber) so the marker is visible
 *    even from the intro wide shot.
 *  - 3 expanding rings, staggered in phase, each growing outward
 *    and fading. They look like ripples in a pond.
 *  - A subtle fresnel halo hugs the core for soft glow.
 *
 * The marker is placed on the earth surface via lat/lng, with the
 * group's local +Y axis pointing outward (radially) so the rings
 * lie flat on the surface.
 */
interface WarMarkerProps {
  conflict: Conflict
  earthRadius?: number
  onClick?: (conflict: Conflict) => void
}

export function WarMarker({ conflict, earthRadius = 1, onClick }: WarMarkerProps) {
  const surfacePos = useMemo(
    () => latLngToVector3(conflict.lat, conflict.lng, earthRadius),
    [conflict.lat, conflict.lng, earthRadius],
  )

  const outward = useMemo(() => surfacePos.clone().normalize(), [surfacePos])

  // Orient group so local +Y points outward from earth center.
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0)
    return new THREE.Quaternion().setFromUnitVectors(up, outward)
  }, [outward])

  // Per-marker random phase so the 10 markers don't pulse in sync.
  const phaseOffset = useMemo(() => Math.random(), [])

  // Scale based on intensity — bigger conflicts have slightly larger
  // markers and rings, but kept tasteful.
  const dotSize = 0.0065 + conflict.intensity * 0.0009
  const haloSize = dotSize * 3.2
  const ringMax = 0.028 + conflict.intensity * 0.007

  return (
    <group
      position={surfacePos}
      quaternion={quaternion}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation()
          onClick(conflict)
        }
      }}
      onPointerOver={(e) => {
        if (onClick) {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        if (onClick) {
          document.body.style.cursor = 'default'
        }
      }}
    >
      {/* Core bright dot — the marker itself, always visible */}
      <mesh>
        <sphereGeometry args={[dotSize, 12, 12]} />
        <meshBasicMaterial
          color="#ffd09a"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* Soft fresnel halo hugging the core */}
      <GlowHalo size={haloSize} phaseOffset={phaseOffset} />

      {/* 3 staggered sonar rings expanding outward across the surface */}
      <PulseRing phaseOffset={phaseOffset + 0.0} maxRadius={ringMax} color="#ff7a4a" />
      <PulseRing phaseOffset={phaseOffset + 0.33} maxRadius={ringMax} color="#ff7a4a" />
      <PulseRing phaseOffset={phaseOffset + 0.66} maxRadius={ringMax} color="#ff7a4a" />

      {/* Invisible click target — larger sphere for easy clicking */}
      {onClick && (
        <mesh visible={false}>
          <sphereGeometry args={[dotSize * 8, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Soft fresnel halo hugging the core dot.
 *
 * A small sphere with a rim shader — bright at the silhouette,
 * transparent in the center. Pulsates gently.
 */
function GlowHalo({
  size,
  phaseOffset,
}: {
  size: number
  phaseOffset: number
}) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null)

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#ff5a3a') },
        uTime: { value: 0 },
        uPhase: { value: phaseOffset },
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
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uPhase;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          float rim = pow(1.0 - abs(dot(vNormal, -vPositionNormal)), 2.2);
          float pulse = 0.55 + 0.45 * sin(uTime * 1.2 + uPhase * 6.2831);
          float alpha = rim * pulse * 0.5;
          gl_FragColor = vec4(uColor * 1.1, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    matRef.current = m
    return m
  }, [phaseOffset])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh material={material} scale={size}>
      <sphereGeometry args={[1, 16, 16]} />
    </mesh>
  )
}

/**
 * One expanding sonar pulse ring.
 *
 * The ring lies flat on the earth surface (in the local X-Z plane
 * after the group's quaternion alignment). It starts at radius 0,
 * expands outward to `maxRadius`, and fades to transparent.
 *
 * Multiple rings with staggered `phaseOffset` create a continuous
 * ripple effect.
 */
function PulseRing({
  phaseOffset,
  maxRadius,
  color,
}: {
  phaseOffset: number
  maxRadius: number
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  // Ring geometry: a thin annulus in the XY plane (normal = +Z).
  // After the parent group's quaternion, local +Y = outward, so
  // we rotate the ring by [PI/2, 0, 0] to make it lie flat on
  // the surface (its +Z normal points to local +Y = outward).
  const geometry = useMemo(() => {
    return new THREE.RingGeometry(0.86, 1.0, 48)
  }, [])

  useFrame((state) => {
    // Cycle: 2.4 seconds per pulse.
    const cycle = 2.4
    const t = ((state.clock.elapsedTime / cycle) + phaseOffset) % 1
    if (meshRef.current) {
      const s = t * maxRadius
      meshRef.current.scale.set(s, s, s)
    }
    if (matRef.current) {
      // Fade in quickly, then fade out — easier on the eye than linear fade.
      const fade = Math.sin(t * Math.PI) // 0 -> 1 -> 0
      matRef.current.opacity = fade * 0.55
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0.0008, 0]}
    >
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
