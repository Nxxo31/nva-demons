'use client'

import { Detailed } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import CactiColumnar from '../CactiColumnar'

// Función para generar geometrías LOD simplificadas
function buildSimpleColumnarGeometry(
  height: number,
  radius: number,
  ridges: number,
  detailLevel: 'high' | 'medium' | 'low',
): THREE.BufferGeometry {
  const taperTop = 0.78
  const ridgeGirth = 0.08
  
  // Reducir segmentos según nivel de detalle
  const segmentCount = {
    high: 18,
    medium: 10,
    low: 6
  }[detailLevel]
  
  const radialSegs = {
    high: Math.max(ridges * 6, 24),
    medium: Math.max(ridges * 4, 16),
    low: Math.max(ridges * 3, 12)
  }[detailLevel]

  // Perfil costillas en el plano XY (simplificado para LOD bajo)
  const ridgeProfile = (angle: number): number => {
    const ridgeAngle = (Math.PI * 2) / ridges
    const phi = (angle % ridgeAngle) / ridgeAngle
    // Para LOD bajo, usar una forma más simple
    if (detailLevel === 'low') {
      return 1.0 + ridgeGirth * 0.5 // Costilla constante
    }
    return 1.0 + ridgeGirth * Math.cos((phi - 0.5) * Math.PI * 2) * 0.5
  }

  // Construye vértices manualmente
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const radialSegsAdjusted = Math.max(radialSegs, 3) // Evitar división por cero

  for (let y = 0; y <= segmentCount; y++) {
    const v = y / segmentCount
    const ringY = v * height
    const ringRadius = radius * (1.0 - (1.0 - taperTop) * Math.pow(v, 1.5))
    const bulge = 1.0 + 0.04 * Math.sin(v * Math.PI)
    const r = ringRadius * bulge

    for (let s = 0; s <= radialSegsAdjusted; s++) {
      const u = s / radialSegsAdjusted
      const angle = u * Math.PI * 2
      const ridgeScale = ridgeProfile(angle)
      const x = Math.cos(angle) * r * ridgeScale
      const z = Math.sin(angle) * r * ridgeScale
      positions.push(x, ringY, z)
      
      const nx = Math.cos(angle) * ridgeScale
      const nz = Math.sin(angle) * ridgeScale
      const ny = 0.1
      const nlen = Math.hypot(nx, ny, nz)
      normals.push(nx / nlen, ny / nlen, nz / nlen)
      uvs.push(u * ridges, v * 3)
    }
  }

  // Conecta anillos
  for (let y = 0; y < segmentCount; y++) {
    for (let s = 0; s < radialSegsAdjusted; s++) {
      const a = y * (radialSegsAdjusted + 1) + s
      const b = a + 1
      const c = a + (radialSegsAdjusted + 1)
      const d = c + 1
      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  // Tapa superior
  const topCenterIndex = positions.length / 3
  positions.push(0, height, 0)
  normals.push(0, 1, 0)
  uvs.push(0.5, 0.5)
  const topRingStart = segmentCount * (radialSegsAdjusted + 1)
  for (let s = 0; s < radialSegsAdjusted; s++) {
    const a = topCenterIndex
    const b = topRingStart + s
    const c = topRingStart + s + 1
    indices.push(a, c, b)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export default function CactiLOD() {
  // Geometrías pre-calculadas para cada nivel de detalle
  const highGeo = useMemo(() => buildSimpleColumnarGeometry(4.4, 0.3, 6, 'high'), [])
  const mediumGeo = useMemo(() => buildSimpleColumnarGeometry(4.4, 0.3, 6, 'medium'), [])
  const lowGeo = useMemo(() => buildSimpleColumnarGeometry(4.4, 0.3, 6, 'low'), [])

  // Distancias de transición entre niveles de detalle (en world units)
  // Estas distancias se pueden ajustar basada en pruebas de rendimiento
  const distances = [12, 22] // Cambiar a medium a 12u, a low a 22u

  return (
    <Detailed
      distances={distances}
    >
      {/* High detail - Cactus completos con brazos */}
      <CactiColumnar
        count={80}
        height={4.4}
        radius={0.3}
        ridges={6}
        areaRadius={9}
        groundY={-0.8}
        customGeometry={highGeo}
      />
      
      {/* Medium detail - Cactus con menos segmentos, mismos brazos conceptualmente */}
      <CactiColumnar
        count={80}
        height={4.4}
        radius={0.3}
        ridges={6}
        areaRadius={9}
        groundY={-0.8}
        customGeometry={mediumGeo}
      />
      
      {/* Low detail - Cactus muy simples (cilindros básicos), sin brazos detallados */}
      <CactiColumnar
        count={80}
        height={4.4}
        radius={0.3}
        ridges={6}
        areaRadius={9}
        groundY={-0.8}
        customGeometry={lowGeo}
      />
    </Detailed>
  )
}