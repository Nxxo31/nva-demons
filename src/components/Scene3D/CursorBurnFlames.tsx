'use client'

// CursorBurnFlames — Efecto de flamas que siguen al cursor del mouse en 3D.
// Usa wawa-vfx VFXParticles + VFXEmitter con billboard additive para las flamas
// y raycast contra el plano del terreno para mapear la posición 2D del cursor al espacio 3D.
// Estas flamas complementan el burn overlay de canvas del shader de terrain:
// el shader "quema" texturalmente la arcilla, este componente escupe flamas vivas
// en la posición world-space donde apunta el mouse.

import { useRef, useMemo, type ComponentRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { VFXParticles, VFXEmitter, vfxStore, RenderMode, AppearanceMode } from 'wawa-vfx'
import * as THREE from 'three'

// Plano horizontal del terreno en y = -0.8 (igual que BadlandsTerrain en DesertScene)
const TERRAIN_Y = -0.8
const FALLBACK_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TERRAIN_Y)

type CursorBurnFlamesProps = {
  /** Permite suspender la emisión cuando el usuario prefiere movimiento reducido. */
  enabled?: boolean
}

// Helpers de tupla (sin readonly: evitan widen a number[])
const t2 = (a: number, b: number): [number, number] => [a, b]
const t3 = (a: number, b: number, c: number): [number, number, number] => [a, b, c]

export default function CursorBurnFlames({ enabled = true }: CursorBurnFlamesProps) {
  const emitterRef = useRef<ComponentRef<typeof VFXEmitter>>(null)
  const { camera, pointer } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  // Vive sólo en el renderer loop, no provoca re-render
  const lastEmit = useRef(0)

  // Configura las partículas "cursor-flame": billboard aditivo, naranja→rojo→humo
  const particleSettings = useMemo(
    () => ({
      nbParticles: 600,
      intensity: 1.0,
      renderMode: RenderMode.Billboard,
      appearance: AppearanceMode.Circular,
      fadeSize: t2(0.4, 1.4),
      fadeAlpha: t2(0.0, 0.85),
      gravity: t3(0, 0.35, 0),
      blendingMode: THREE.AdditiveBlending,
      depthTest: true,
      frustumCulled: false,
      easeFunction: 'easeOutCubic' as const,
    }),
    [],
  )

  // El emitter dibuja pequeños sprites que suben y se desvanecen simulando flama
  const emitterSettings = useMemo(
    () => ({
      duration: 0.12,
      nbParticles: 4,
      spawnMode: 'time' as const,
      loop: true,
      delay: 0,
      particlesLifetime: t2(0.5, 0.9),
      speed: t2(0.6, 1.4),
      size: t2(0.06, 0.16),
      startPositionMin: t3(-0.05, -0.02, -0.05),
      startPositionMax: t3(0.05, 0.05, 0.05),
      directionMin: t3(-0.25, 1.0, -0.25),
      directionMax: t3(0.25, 1.6, 0.25),
      startRotationMin: t3(0, 0, 0),
      startRotationMax: t3(0, 0, 0),
      rotationSpeedMin: t3(-0.5, -0.5, -0.5),
      rotationSpeedMax: t3(0.5, 0.5, 0.5),
      colorStart: ['#ffd24a', '#ff7a18'],
      colorEnd: ['#3b0a00', '#000000'],
    }),
    [],
  )

  useFrame(({ clock }) => {
    const emitter = emitterRef.current
    if (!emitter || !enabled) return

    // Throttle de emisión para no saturar (60Hz => ~3 emit/s)
    const t = clock.elapsedTime
    if (t - lastEmit.current < 0.08) return
    lastEmit.current = t

    // Raycast desde la cámara a través de la posición del puntero sobre el plano del terrain
    raycaster.setFromCamera(pointer, camera)
    const hit = new THREE.Vector3()
    raycaster.ray.intersectPlane(FALLBACK_PLANE, hit)
    if (!hit) return

    // Limita a la zona de terreno (24x24 como planeGeometry)
    if (Math.abs(hit.x) > 11 || Math.abs(hit.z) > 11) return

    // Mueve el emisor a la posición world e inyecta partículas via la store de wawa-vfx
    emitter.position.copy(hit)
    emitter.position.y = TERRAIN_Y + 0.02
    vfxStore.getState().emit('cursor-flame', 1, () => ({
      position: [0, 0, 0],
      direction: [
        (Math.random() - 0.5) * 0.3,
        1.0 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.3,
      ],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      rotationSpeed: [0, 0, 0],
      lifetime: [0.6, 1.1],
      colorStart: Math.random() < 0.5 ? '#ffd24a' : '#ff6a18',
      colorEnd: '#1a0500',
      speed: [0.5 + Math.random() * 1.0],
    }))
  })

  return (
    <group>
      <VFXParticles name="cursor-flame" settings={particleSettings} />
      {/* Esfera de referencia del emisor (invisible) en y del terreno */}
      <VFXEmitter
        ref={emitterRef}
        emitter="cursor-flame"
        settings={emitterSettings}
        autoStart={false}
      />
    </group>
  )
}
