'use client'

// CactiColumnar — Cactus columnares procedimentales con InstancedMesh.
// Inspirado en Cereus peruvianus / Cereus hexagonus (cactus columnares de la Tatacoa):
//   tronco principal con 4-6 costillas verticales (ridges), segmentado, 4-5m altura,
//   brazos laterales que nacen ~40-70% de la altura con misma morfología columnar.
// Se rewrite como componente dedicado para separarse de DesertScene y poder
// exponer variantes y un color profile de desierto (verde-oliva apagado con
// pápulas espinosas simuladas via bumpiness standard material).

import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type CactiColumnarProps = {
  count?: number
  /** Altura objetivo del tronco principal en metros. */
  height?: number
  /** Radio base del tronco. */
  radius?: number
  /** Número de costillas verticales (4-7 para columnares reales). */
  ridges?: number
  /** Radio del area de siembra (en world units del suelo). */
  areaRadius?: number
  /** Posición Y del suelo (debe coincidir con el terreno). */
  groundY?: number
}

type Transform = {
  x: number
  z: number
  y: number
  scaleH: number
  scaleR: number
  rotation: number
  arms: number
  seed: number
}

// Genera una geometría columnar con costillas verticales construyendo un
// cilindro y desplazando cada anillo en el plano según un perfil de costillas
function buildColumnarGeometry(
  height: number,
  radius: number,
  ridges: number,
  taperTop = 0.78,
  segmentCount = 18, // anillos horizontales
  ridgeGirth = 0.08, // protuberancia de costilla
): THREE.BufferGeometry {
  // Perfil costillas en el plano XY
  const ridgeProfile = (angle: number): number => {
    // angle en radianes, modulo 2π / ridges
    const ridgeAngle = (Math.PI * 2) / ridges
    const phi = (angle % ridgeAngle) / ridgeAngle // 0..1 dentro de la costilla
    // Función tipo campana (coseno elevado) — protuberancia en el centro de cada costilla
    return 1.0 + ridgeGirth * Math.cos((phi - 0.5) * Math.PI * 2) * 0.5
  }

  // Construye vértices manualmente
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const radialSegs = Math.max(ridges * 6, 24) // más suave entre costillas

  for (let y = 0; y <= segmentCount; y++) {
    const v = y / segmentCount
    const ringY = v * height
    // Taper: suavemente más fino arriba
    const ringRadius = radius * (1.0 - (1.0 - taperTop) * Math.pow(v, 1.5))

    // Pequeño bulge en el medio (cactus columnares son barrigones)
    const bulge = 1.0 + 0.04 * Math.sin(v * Math.PI)
    const r = ringRadius * bulge

    for (let s = 0; s <= radialSegs; s++) {
      const u = s / radialSegs
      const angle = u * Math.PI * 2
      const ridgeScale = ridgeProfile(angle)
      const x = Math.cos(angle) * r * ridgeScale
      const z = Math.sin(angle) * r * ridgeScale
      positions.push(x, ringY, z)
      // Normal ≈ radial (mejor con computeVertexNormals al final, pero damos normal básica)
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
    for (let s = 0; s < radialSegs; s++) {
      const a = y * (radialSegs + 1) + s
      const b = a + 1
      const c = a + (radialSegs + 1)
      const d = c + 1
      // dos triángulos (CCW)
      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  // Tapa superior (cierre del cilindro)
  const topCenterIndex = positions.length / 3
  positions.push(0, height, 0)
  normals.push(0, 1, 0)
  uvs.push(0.5, 0.5)
  const topRingStart = segmentCount * (radialSegs + 1)
  for (let s = 0; s < radialSegs; s++) {
    const a = topCenterIndex
    const b = topRingStart + s
    const c = topRingStart + s + 1
    indices.push(a, c, b) // visto desde arriba CCW
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export default function CactiColumnar({
  count = 80,
  height = 4.3,
  radius = 0.28,
  ridges = 6,
  areaRadius = 9,
  groundY = -0.8,
}: CactiColumnarProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const [transforms] = useState<Transform[]>(() => {
    // PRNG determinista-ish con seed para posiciones estables
    let s = 1337
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0
      return (s >>> 8) / 0xFFFFFF
    }
    const data: Transform[] = []
    // Distribución en clusters entre cárcavas: agrupa 3-6 cactus por patch
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2
      const r = 3 + rand() * (areaRadius - 3)
      const jitterAngle = rand() * Math.PI * 2
      const jitterR = rand() * 1.4
      const x = Math.cos(angle) * r + Math.cos(jitterAngle) * jitterR
      const z = Math.sin(angle) * r + Math.sin(jitterAngle) * jitterR
      data.push({
        x,
        z,
        y: groundY,
        scaleH: 0.85 + rand() * 0.55, // variación 0.85..1.4x => altura total ~3.7..6.0m
        scaleR: 0.85 + rand() * 0.35,
        rotation: rand() * Math.PI * 2,
        arms: rand() < 0.55 ? 1 : rand() < 0.78 ? 2 : 0,
        seed: Math.floor(rand() * 1000),
      })
    }
    return data
  })

  // Geometría del tronco principal (pre-clonada por arms)
  const trunkGeo = useMemo(() => {
    return buildColumnarGeometry(height, radius, ridges)
  }, [height, radius, ridges])

  // Geometría del brazo (más pequeña, un diferencial respecto al tronco)
  const armGeo = useMemo(() => {
    return buildColumnarGeometry(height * 0.4, radius * 0.7, ridges, 0.85, 12, 0.08)
  }, [height, radius, ridges])

  // Combinamos el tronco + arms en una sola geometría para una draw call via InstancedMesh
  // (1 mesh instance = tronco + N arms; la transform de InstancedMesh rota/escala todo de una.
  // Nota: NO queremos unir arms en geometría cuando cada cactus tiene un número distinto —
  // estrategia: clonar con un máximo de 2 arms y simplemente mover los no-usados fuera de la pantalla
  // (no son visibles porque superponen al tronco). Más simple y performante.)

  const mergedGeo = useMemo(() => {
    // Combina tronco (centrado) + hasta 2 arms rotados/posicionados relativos
    const parts: THREE.BufferGeometry[] = []

    const tGeo = trunkGeo.clone()
    parts.push(tGeo)

    // Arm 1: lateral derecha, parte alta
    const a1 = armGeo.clone()
    // Rotar el brazo ~45 grados y subirlo 60% del altura del tronco
    const a1M = new THREE.Matrix4()
    a1M.compose(
      new THREE.Vector3(radius * 1.4, height * 0.55, 0),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.45),
      new THREE.Vector3(1, 1, 1),
    )
    a1.applyMatrix4(a1M)
    parts.push(a1)

    // Arm 2: lateral izquierda, ligeramente más bajo
    const a2 = armGeo.clone()
    const a2M = new THREE.Matrix4()
    a2M.compose(
      new THREE.Vector3(-radius * 1.3, height * 0.42, 0),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.35),
      new THREE.Vector3(0.85, 0.85, 0.85),
    )
    a2.applyMatrix4(a2M)
    parts.push(a2)

    const merged = mergeGeometries(parts, false)
    if (!merged) {
      // Fallback si merge falla
      return trunkGeo
    }
    return merged
  }, [trunkGeo, armGeo, height, radius])

  // Material: verde-oliva apagado con high roughness, ligera bumpiness sin mapa
  // (flatShading realzaría demasiado las costillas — usamos normal computado).
  const cactusMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#3d5a2a'),
        roughness: 0.92,
        metalness: 0.0,
        flatShading: false,
      }),
    [],
  )

  useEffect(() => {
    if (!meshRef.current) return
    transforms.forEach((tr, i) => {
      dummy.position.set(tr.x, tr.y, tr.z)
      dummy.scale.set(tr.scaleR, tr.scaleH, tr.scaleR)
      dummy.rotation.y = tr.rotation
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.computeBoundingSphere()
  }, [transforms, dummy, groundY])

  return (
    <instancedMesh
      ref={meshRef}
      args={[mergedGeo, cactusMaterial, count]}
      count={count}
      castShadow
      receiveShadow
    />
  )
}
