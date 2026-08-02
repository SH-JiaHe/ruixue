'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { EARTH_RADIUS_VALUE } from '@/lib/geo'

interface CloudsProps {
  rotate?: boolean
  rotationSpeed?: number
}

/**
 * Volumetric-style cloud layer.
 *
 * Renders a slightly larger transparent sphere using NASA's cloud texture.
 * Clouds rotate slightly faster than the earth surface for parallax.
 * DepthWrite is disabled so clouds blend correctly with the earth below.
 */
export function Clouds({ rotate = true, rotationSpeed = 0.028 }: CloudsProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsMap = useTexture('/textures/earth_clouds_1024.png')

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    })
    return m
  }, [cloudsMap])

  useFrame((_, delta) => {
    if (rotate && meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <mesh ref={meshRef} material={material} scale={1.025} renderOrder={2}>
      <sphereGeometry args={[EARTH_RADIUS_VALUE, 96, 96]} />
    </mesh>
  )
}
