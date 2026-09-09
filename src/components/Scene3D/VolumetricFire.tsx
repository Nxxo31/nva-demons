'use client'

// VolumetricFire — Fuego volumétrico con ray marching en un ShaderMaterial custom.
// Inspirado en THREE.Fire (cwilliam89/three-fire) pero implementado self-contained con
// ShaderMaterial de Three.js para no depender de una versión publicada incompatible.
// Quad/billboard proyectado donde el rayo cruza el volumen y aplica un flame noise
// con gradient fire palette.
// Acompaña brasas y humo usando wawa-vfx VFXParticles.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { VFXParticles, VFXEmitter, RenderMode, AppearanceMode } from 'wawa-vfx'
import * as THREE from 'three'

type VolumetricFireProps = {
  position?: [number, number, number]
  height?: number
  radius?: number
  seed?: number
  embers?: boolean
  smoke?: boolean
}

// Helpers de tupla (sin readonly, evitan widen a number[])
const t2 = (a: number, b: number): [number, number] => [a, b]
const t3 = (a: number, b: number, c: number): [number, number, number] => [a, b, c]

// Paleta fuego: idx 0 humo, 1 carbón, 2 rojo, 3 naranja, 4 amarillo, 5 blanco
const FIRE_GRADIENT: Array<[number, THREE.Color]> = [
  [0.0, new THREE.Color('#0a0000')],
  [0.15, new THREE.Color('#3a0a02')],
  [0.35, new THREE.Color('#8b1600')],
  [0.55, new THREE.Color('#ff4a08')],
  [0.75, new THREE.Color('#ffcc33')],
  [0.92, new THREE.Color('#fff5cc')],
  [1.0, new THREE.Color('#ffffff')],
]

function buildGradientLut(): THREE.DataTexture {
  const size = 64
  const data = new Uint8Array(size * 4)
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1)
    let col = FIRE_GRADIENT[0][1]
    for (let k = 0; k < FIRE_GRADIENT.length - 1; k++) {
      const [t0, c0] = FIRE_GRADIENT[k]
      const [t1, c1] = FIRE_GRADIENT[k + 1]
      if (t >= t0 && t <= t1) {
        const u = (t - t0) / (t1 - t0)
        col = new THREE.Color().lerpColors(c0, c1, u)
        break
      }
    }
    data[i * 4 + 0] = (col.r * 255) | 0
    data[i * 4 + 1] = (col.g * 255) | 0
    data[i * 4 + 2] = (col.b * 255) | 0
    data[i * 4 + 3] = 255
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat)
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

export default function VolumetricFire({
  position = [0, -0.8, 0],
  height = 2.2,
  radius = 0.85,
  seed = 0,
  embers = true,
  smoke = true,
}: VolumetricFireProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const marchingRef = useRef<THREE.ShaderMaterial>(null!)

  const gradient = useMemo(() => buildGradientLut(), [])
  const noiseRamp = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64; canvas.height = 1
    const ctx = canvas.getContext('2d')!
    for (let i = 0; i < 64; i++) {
      const t = i / 63
      const a = Math.pow(t, 1.7)
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
      ctx.fillRect(i, 0, 1, 1)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Billboard half-size derivado del radius (ancho del quad)
  const quadW = radius * 1.4
  const quadH = height * 1.2

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: height },
      uRadius: { value: radius },
      uQuadW: { value: quadW },
      uQuadH: { value: quadH },
      uSeed: { value: seed },
      uFireGradient: { value: gradient },
      uNoiseRamp: { value: noiseRamp },
      uCameraRight: { value: new THREE.Vector3(1, 0, 0) },
      uCameraUp: { value: new THREE.Vector3(0, 1, 0) },
    }),
    [gradient, noiseRamp, height, radius, seed, quadW, quadH],
  )

  useFrame(({ clock, camera }) => {
    const mat = marchingRef.current
    if (!mat) return
    mat.uniforms.uTime.value = clock.elapsedTime

    // Billboard: extrae los vectores right/up de la cámara para VR/mono
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    const fwd = new THREE.Vector3()
    camera.matrixWorld.extractBasis(right, up, fwd)
    mat.uniforms.uCameraRight.value.copy(right)
    mat.uniforms.uCameraUp.value.copy(up)
  })

  // Configuración brasas (wawa-vfx) — tuplas estrictas via helpers
  const emberParticleSettings = useMemo(
    () => ({
      nbParticles: 220,
      intensity: 1.0,
      renderMode: RenderMode.Billboard,
      appearance: AppearanceMode.Circular,
      fadeSize: t2(0.0, 1.0),
      fadeAlpha: t2(0.9, 0.0),
      gravity: t3(0, 0.12, 0),
      blendingMode: THREE.AdditiveBlending,
      depthTest: true,
      frustumCulled: false,
    }),
    [],
  )

  const smokeParticleSettings = useMemo(
    () => ({
      nbParticles: 180,
      intensity: 0.55,
      renderMode: RenderMode.Billboard,
      appearance: AppearanceMode.Circular,
      fadeSize: t2(1.0, 2.2),
      fadeAlpha: t2(0.25, 0.0),
      gravity: t3(0, 0.08, 0),
      blendingMode: THREE.NormalBlending,
      depthTest: true,
      frustumCulled: false,
      easeFunction: 'easeOutQuad' as const,
    }),
    [],
  )

  const emberEmitterSettings = useMemo(
    () => ({
      duration: 0.05,
      nbParticles: 2,
      spawnMode: 'time' as const,
      loop: true,
      delay: 0,
      particlesLifetime: t2(1.2, 2.2),
      speed: t2(0.4, 0.9),
      size: t2(0.03, 0.06),
      startPositionMin: t3(-radius * 0.4, 0, -radius * 0.4),
      startPositionMax: t3(radius * 0.4, 0.3, radius * 0.4),
      directionMin: t3(-0.4, 1.0, -0.4),
      directionMax: t3(0.4, 1.6, 0.4),
      startRotationMin: t3(0, 0, 0),
      startRotationMax: t3(0, 0, 0),
      rotationSpeedMin: t3(0, 0, 0),
      rotationSpeedMax: t3(0, 0, 0),
      colorStart: ['#ffdd66', '#ff8a33'],
      colorEnd: ['#2a0a00', '#000000'],
    }),
    [radius],
  )

  const smokeEmitterSettings = useMemo(
    () => ({
      duration: 0.6,
      nbParticles: 2,
      spawnMode: 'time' as const,
      loop: true,
      delay: 0,
      particlesLifetime: t2(2.5, 4.0),
      speed: t2(0.18, 0.32),
      size: t2(0.2, 0.4),
      startPositionMin: t3(-radius * 0.3, height * 0.55, -radius * 0.3),
      startPositionMax: t3(radius * 0.3, height * 0.75, radius * 0.3),
      directionMin: t3(-0.1, 1.0, -0.1),
      directionMax: t3(0.1, 1.4, 0.1),
      startRotationMin: t3(0, 0, 0),
      startRotationMax: t3(0, 0, 0),
      rotationSpeedMin: t3(-0.2, -0.2, -0.2),
      rotationSpeedMax: t3(0.2, 0.2, 0.2),
      colorStart: ['#2a2520', '#1a1614'],
      colorEnd: ['#0a0a0a', '#000000'],
    }),
    [radius, height],
  )

  return (
    <group position={position}>
      {/* Volumen ray marching: quad billboard con shader de noise fbm */}
      <mesh ref={meshRef} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={marchingRef}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          vertexShader={VOLUMETRIC_FIRE_VERT}
          fragmentShader={VOLUMETRIC_FIRE_FRAG}
        />
      </mesh>

      {embers && (
        <>
          <VFXParticles name="fire-embers" settings={emberParticleSettings} />
          <VFXEmitter emitter="fire-embers" settings={emberEmitterSettings} />
        </>
      )}

      {smoke && (
        <>
          <VFXParticles name="fire-smoke" settings={smokeParticleSettings} />
          <VFXEmitter emitter="fire-smoke" settings={smokeEmitterSettings} />
        </>
      )}
    </group>
  )
}

// ========================================================================
// Shaders GLSL
// ========================================================================

const VOLUMETRIC_FIRE_VERT = /* glsl */ `
varying vec2 vUv;
uniform float uQuadW;
uniform float uQuadH;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;

void main() {
  vUv = uv;
  // Billboard en world space: escalamos el quad plano segun half-size y orientamos con camera basis
  vec3 worldPos =
      position.x * uCameraRight * uQuadW
    + position.y * uCameraUp * uQuadH
    + vec3(0.0, uQuadH * 0.5, 0.0); // offset para que el fuego salga del suelo
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(worldPos, 1.0);
}
`

const VOLUMETRIC_FIRE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uHeight;
uniform float uRadius;
uniform float uSeed;
uniform sampler2D uFireGradient;
uniform sampler2D uNoiseRamp;

// hash + value noise + fbm (iq standard)
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  // DOMAIN WARPING: distorsión vertical tipo "flame" (iq domain warp)
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y; // 0 abajo -> 1 arriba
  float heightT = uv.y;

  // Ancho vertical del ray-marching blob: cae arriba y bottom
  float verticalFalloff = smoothstep(0.0, 0.15, heightT) * (1.0 - smoothstep(0.6, 1.0, heightT));

  // Coordenadas del noise: tiempo fluye hacia arriba, distorsión de warp lateral
  float warpStrength = 0.6 * verticalFalloff;
  vec2 warp = vec2(
    fbm(uv * 3.0 + uTime * 0.45),
    fbm(uv * 3.0 - vec2(0.0, uTime * 0.6))
  );
  vec2 q = uv + warp * warpStrength;
  float noise = fbm(q * 3.0 + uTime * 0.9);

  // Cone shape lateral fall-off
  float lateralFalloff = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 1.4);

  // Combina densidad
  float density = noise * verticalFalloff * lateralFalloff;

  // Remap densidad al lookup de ramp noise
  float ramped = texture2D(uNoiseRamp, vec2(density, 0.5)).a;

  // Map density→temperatura (más caliente abajo, más arriba cool)
  float temperature = clamp(density * (1.0 - heightT * 0.35), 0.0, 1.0);
  vec4 fireColor = texture2D(uFireGradient, vec2(temperature, 0.5));

  // Coeficiente de absorción (estilo ray marching): alpha scales con la integral de densidad
  float absorption = ramped * (0.35 + 0.65 * density);

  vec3 finalColor = fireColor.rgb * (1.0 + absorption * 0.6);

  gl_FragColor = vec4(finalColor, absorption);
}
`
