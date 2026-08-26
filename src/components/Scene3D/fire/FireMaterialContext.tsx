'use client'

import { createContext, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { VFXParticles, VFXEmitter, RenderMode, AppearanceMode } from 'wawa-vfx'
import * as THREE from 'three'

// Context for sharing fire material uniforms across instances
const FireMaterialContext = createContext<{
  uTime: { value: number };
  uHeight: { value: number };
  uRadius: { value: number };
  uQuadW: { value: number };
  uQuadH: { value: number };
  uSeed: { value: number };
  uFireGradient: { value: THREE.DataTexture };
  uNoiseRamp: { value: THREE.CanvasTexture };
  uCameraRight: { value: THREE.Vector3 };
  uCameraUp: { value: THREE.Vector3 };
} | null>(null);

// Helper functions
const t2 = (a: number, b: number): [number, number] => [a, b]
const t3 = (a: number, b: number, c: number): [number, number, number] => [a, b, c]

// Fire gradient palette
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

function buildNoiseRamp(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  for (let i = 0; i < 64; i++) {
    const t = i / 63
    const a = Math.pow(t, 1.7)
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
    ctx.fillRect(i, 0, 1, 1)
  }
  return new THREE.CanvasTexture(canvas)
}

// Shared fire material provider
export function FireMaterialProvider({ children }: { children: React.ReactNode }) {
  // Shared uniforms that can be updated per-instance via useFrame
  const sharedUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHeight: { value: 2.2 },
    uRadius: { value: 0.85 },
    uQuadW: { value: 1.19 }, // 0.85 * 1.4
    uQuadH: { value: 2.64 }, // 2.2 * 1.2
    uSeed: { value: 0 },
    uFireGradient: { value: buildGradientLut() },
    uNoiseRamp: { value: buildNoiseRamp() },
    uCameraRight: { value: new THREE.Vector3(1, 0, 0) },
    uCameraUp: { value: new THREE.Vector3(0, 1, 0) },
  }), [])

  // Update time and camera vectors in the render loop
  useFrame(({ clock, camera }) => {
    sharedUniforms.uTime.value = clock.elapsedTime
    
    // Update camera basis for billboarding
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    const look = new THREE.Vector3() // not used, but required by signature
    camera.matrixWorld.extractBasis(right, up, look)
    sharedUniforms.uCameraRight.value.copy(right)
    sharedUniforms.uCameraUp.value.copy(up)
  })

  return (
    <FireMaterialContext.Provider value={sharedUniforms}>
      {children}
    </FireMaterialContext.Provider>
  )
}

// Hook to consume shared fire material
export function useFireMaterial() {
  const context = useContext(FireMaterialContext)
  if (!context) {
    throw new Error('useFireMaterial must be used within a FireMaterialProvider')
  }
  return context
}

// Shaders GLSL (shared)
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
  // DOMAIN WARPING: distorsión vertical tipo \"flame\" (iq domain warp)
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

export { VOLUMETRIC_FIRE_VERT, VOLUMETRIC_FIRE_FRAG }