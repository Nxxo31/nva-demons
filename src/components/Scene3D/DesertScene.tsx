'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import CursorBurnFlames from './CursorBurnFlames'
import VolumetricFire from './VolumetricFire'
import CactiColumnar from './CactiColumnar'

// ====================================================================
// 1. BADLANDS TERRAIN — Tatacoa-inspired (cárcavas, arcilla, terracota)
// ====================================================================
const BadlandsTerrain = ({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  const [colorMap, normalMap, roughnessMap, displacementMap, aoMap] = useLoader(
    THREE.TextureLoader,
    [
      '/textures/clay/Clay001_1K-JPG_Color.jpg',
      '/textures/clay/Clay001_1K-JPG_NormalGL.jpg',
      '/textures/clay/Clay001_1K-JPG_Roughness.jpg',
      '/textures/clay/Clay001_1K-JPG_Displacement.jpg',
      '/textures/clay/Clay001_1K-JPG_AmbientOcclusion.jpg',
    ]
  )

  useEffect(() => {
    const maps = [colorMap, normalMap, roughnessMap, displacementMap, aoMap]
    maps.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6) })
  }, [colorMap, normalMap, roughnessMap, displacementMap, aoMap])

  // Burn overlay canvas - create in useMemo, access via ref in useFrame
  const burnTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 1024, 1024)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(6, 6)
    return tex
  }, [])

  const uniforms = useMemo(() => ({
    uBurnMap: { value: burnTexture },
    uTime: { value: 0 },
    uColorMap: { value: colorMap },
    uNormalMap: { value: normalMap },
    uRoughnessMap: { value: roughnessMap },
    uDisplacementMap: { value: displacementMap },
    uAOMap: { value: aoMap },
  }), [colorMap, normalMap, roughnessMap, displacementMap, aoMap, burnTexture])

  // Store burnTexture in ref to avoid mutation warnings in useFrame
  const burnTextureRef = useRef(burnTexture)
  useEffect(() => {
    burnTextureRef.current = burnTexture
  }, [burnTexture])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = clock.elapsedTime

    // Paint burn at cursor - use ref to avoid mutation warning
    const ctx = (burnTextureRef.current?.image as HTMLCanvasElement)?.getContext('2d')
    if (ctx && mouse.current.lengthSq() > 0) {
      const x = ((mouse.current.x * 0.5 + 0.5) * 1024 + 256) % 1024
      const y = ((1 - (mouse.current.y * 0.5 + 0.5)) * 1024 + 256) % 1024
      const g = ctx.createRadialGradient(x, y, 0, x, y, 60)
      g.addColorStop(0, 'rgba(255, 60, 0, 0.95)')
      g.addColorStop(0.2, 'rgba(180, 20, 0, 0.8)')
      g.addColorStop(0.5, 'rgba(40, 5, 0, 0.6)')
      g.addColorStop(0.8, 'rgba(10, 2, 0, 0.3)')
      g.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.globalCompositeOperation = 'lighten'
      ctx.fillStyle = g
      ctx.fillRect(x - 75, y - 75, 150, 150)
      burnTextureRef.current?.needsUpdate && (burnTextureRef.current.needsUpdate = true)
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
      {/* High-res plane for detailed badlands */}
      <planeGeometry args={[24, 24, 384, 384]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          uniform sampler2D uDisplacementMap;
          uniform float uTime;

          // Procedural noise for badlands
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                       mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            vec2 shift = vec2(100.0);
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p = p * 2.0 + shift;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vUv = uv * 6.0;
            vec3 pos = position;

            // Base displacement from texture
            float texH = texture2D(uDisplacementMap, vUv).r;
            pos.y += (texH - 0.5) * 0.08;

            // Badlands cárcavas — sharp multi-octave erosion
            vec2 badUV = pos.xz * 1.2;
            float badlands = fbm(badUV);
            float gullies = fbm(badUV * 2.5 + 0.5);
            float ridges = pow(abs(gullies - 0.5) * 2.0, 1.5); // sharp V-shape
            float erosion = badlands * 0.6 + ridges * 0.4;

            // Layer: deep gullies (up to 20m scaled)
            float gullyDepth = (erosion - 0.5) * 0.45;
            pos.y += gullyDepth;

            // Sharp ridges from high-frequency noise
            float sharp = fbm(badUV * 4.0 + uTime * 0.01);
            pos.y += pow(sharp, 3.0) * 0.12;

            vWorldPos = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uColorMap;
          uniform sampler2D uNormalMap;
          uniform sampler2D uRoughnessMap;
          uniform sampler2D uAOMap;
          uniform sampler2D uBurnMap;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vWorldPos;

          void main() {
            vec4 clayColor = texture2D(uColorMap, vUv);

            // ── TATACOA COLOR PALETTE ──
            // Zona Cuzco (rojo/terracota): 65% del terreno
            // Zona Los Hoyos (gris): 35% del terreno
            vec2 pos = vWorldPos.xz * 0.3;
            float zone = sin(pos.x * 2.1 + pos.y * 1.7) * 0.5 + 0.5;

            // Cuzco palette: deep terracotta, ochre, burnt sienna
            vec3 cuzco1 = vec3(0.55, 0.20, 0.12); // terracotta deep
            vec3 cuzco2 = vec3(0.70, 0.35, 0.18); // ochre
            vec3 cuzco3 = vec3(0.80, 0.40, 0.22); // light terracotta

            // Los Hoyos palette: warm gray, taupe, ash
            vec3 hoyos1 = vec3(0.45, 0.42, 0.38);
            vec3 hoyos2 = vec3(0.55, 0.50, 0.45);
            vec3 hoyos3 = vec3(0.35, 0.32, 0.28);

            // Blend zones with smooth transition
            float cuzcoMask = smoothstep(0.2, 0.8, zone);

            // Cuzco colors
            float cDetail = sin(pos.x * 5.0 + pos.y * 4.0) * 0.5 + 0.5;
            vec3 cColor = mix(cuzco1, cuzco2, cDetail);
            cColor = mix(cColor, cuzco3, sin(pos.x * 8.0 + uTime * 0.02) * 0.5 + 0.5);

            // Los Hoyos colors
            float hDetail = cos(pos.x * 6.0 + pos.y * 3.0) * 0.5 + 0.5;
            vec3 hColor = mix(hoyos1, hoyos2, hDetail);
            hColor = mix(hColor, hoyos3, sin(pos.y * 7.0) * 0.5 + 0.5);

            // Base clay texture
            vec3 base = clayColor.rgb;

            // Blend clay + Tatacoa zone colors
            vec3 terrainColor = mix(hColor, cColor, cuzcoMask);
            terrainColor = mix(terrainColor, base, 0.3);

            // Add subtle stratification (sediment layers like real Tatacoa)
            float strata = sin(vUv.y * 30.0 + vUv.x * 15.0) * 0.5 + 0.5;
            terrainColor += strata * 0.03;

            // Ground detail: dry cracked clay
            float cracks = sin(vUv.x * 80.0 + vUv.y * 60.0) * 0.5 + 0.5;
            terrainColor -= pow(cracks, 8.0) * 0.04;

            // ── BURN EFFECT ──
            vec4 burn = texture2D(uBurnMap, vUv);
            float b = burn.r;
            vec3 burnt = vec3(0.04, 0.015, 0.005);
            vec3 ember = vec3(1.0, 0.4, 0.05);
            vec3 glow = vec3(0.9, 0.2, 0.0);

            vec3 color = mix(terrainColor, burnt, b * 0.9);
            float pulse = sin(uTime * 3.0 + vUv.x * 120.0 + vUv.y * 100.0) * 0.5 + 0.5;
            color += ember * b * 0.25 * pulse;
            color = mix(color, glow, b * 0.12);

            // AO
            float ao = texture2D(uAOMap, vUv).r;
            color *= (0.6 + ao * 0.4);

            // Lighting
            vec3 normal = normalize(texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0);
            vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
            float diff = max(dot(normal, lightDir), 0.0);
            color *= 0.3 + diff * 0.7;

            // Warm atmosphere tint (Tatacoa sunset)
            color = mix(color, color * vec3(1.15, 0.9, 0.7), 0.35);

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

// ====================================================================
// 2-4. COLUMNAR CACTI + FIRE VOLUMETRICO + CURSOR BURN + PARTICULAS
//      (extraidos como componentes dedicados en Scene3D/ — ver imports)
// ====================================================================

// ====================================================================
// 5. MOUSE TRACKER
// ====================================================================
const MouseTracker = ({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) => {
  const { pointer } = useThree()
  useFrame(() => { mouse.current.copy(pointer) })
  return null
}

// ====================================================================
// 6. LIGHTS WITH TATACOA ATMOSPHERE
// ====================================================================
const Lights = () => (
  <>
    <ambientLight intensity={0.2} color="#883322" />
    <directionalLight
      position={[6, 14, 4]}
      intensity={2.2}
      color="#ff8844"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />
    {/* Warm fill */}
    <pointLight position={[-5, 4, 0]} intensity={2.5} color="#ff4400" distance={20} decay={1.5} />
    <pointLight position={[5, 2, -3]} intensity={1.2} color="#ff6600" distance={12} decay={1.5} />
    {/* Rim light for cactus silhouettes */}
    <pointLight position={[-2, 0.8, 6]} intensity={0.6} color="#ff3300" distance={8} decay={2} />
    <hemisphereLight args={['#662211', '#110000', 0.35]} />
    {/* Inferno fog — blends terrain into red/orange horizon */}
    <fog attach="fog" args={['#3a0805', 7, 18]} />
  </>
)

// ====================================================================
// 7b. INFERNO SKY — volumetric red/orange gradient backdrop
// ====================================================================
const InfernoSky = () => {
  // Use a ref for uniforms to avoid mutation warnings in useFrame
  const skyUniformsRef = useRef({ uTime: { value: 0 } })

  useFrame(({ clock }) => {
    skyUniformsRef.current.uTime.value = clock.elapsedTime
  })

  return (
    <mesh scale={[-1, 1, 1]} position={[0, 8, 0]}>
      <sphereGeometry args={[20, 32, 16]} />
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs -- R3F pattern: stable ref, updated in useFrame
        uniforms={skyUniformsRef.current}
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`
          varying vec3 vWorldPos;
          void main() {
            vWorldPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vWorldPos;

          // Simple hash-noise for cloud variation
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                       mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
            return v;
          }

          void main() {
            vec3 dir = normalize(vWorldPos);
            float h = dir.y; // height factor: 0 = horizon, 1 = zenith

            // ── Inferno gradient: horizon = bright orange/red, zenith = dark blood ──
            vec3 horizon = vec3(1.0, 0.35, 0.1);      // glowing orange
            vec3 mid = vec3(0.45, 0.08, 0.02);        // deep ember red
            vec3 zenith = vec3(0.08, 0.01, 0.0);      // near-black blood

            float t1 = smoothstep(0.0, 0.15, h);
            float t2 = smoothstep(0.15, 0.6, h);
            vec3 sky = mix(horizon, mid, t1);
            sky = mix(sky, zenith, t2);

            // ── Animated cloud bands (smoke/haze) ──
            vec2 cloudUV = vec2(dir.x * 3.0 + uTime * 0.02, dir.y * 4.0);
            float clouds = fbm(cloudUV);
            clouds = smoothstep(0.4, 0.7, clouds);
            vec3 cloudColor = vec3(0.6, 0.15, 0.03);
            sky = mix(sky, sky * cloudColor * 1.5, clouds * 0.3 * (1.0 - t2));

            // ── Horizon glow pulse ──
            float glow = pow(1.0 - max(h, 0.0), 3.0);
            sky += vec3(1.0, 0.3, 0.05) * glow * 0.4;

            gl_FragColor = vec4(sky, 1.0);
          }
        `}
      />
    </mesh>
  )
}

// ====================================================================
// 8. MAIN EXPORT WITH FALLBACK
// ====================================================================
export default function DesertScene() {
  const mouseRef = useRef(new THREE.Vector2(0, 0))
  const [webglFailed] = useState(false)

  if (webglFailed) {
    // Fallback: show a static background image of the Tatacoa desert
    return (
      <div className="fixed inset-0 z-0 w-screen h-screen" 
           style={{ 
             backgroundImage: 'url(/images/tatacoa-bg.jpg)', 
             backgroundSize: 'cover', 
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }} />
    )
  }

  return (
    <div className="fixed inset-0 z-0 w-screen h-screen" style={{ background: '#0a0000' }}>
      <Canvas
        camera={{ position: [0, 3.2, 6], fov: 52, near: 0.1, far: 30 }}
        dpr={[1, 1.5]}
        style={{ width: '100vw', height: '100vh' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => { gl.setClearColor('#1a0505') }}
      >
        <InfernoSky />
        <Lights />
        <BadlandsTerrain mouse={mouseRef} />
        {/* Fuego volumétrico ray marching en el centro de la escena (Tatacoa) */}
        <VolumetricFire position={[0, -0.8, 0]} height={2.4} radius={0.95} seed={3} />
        {/* Fogata secundaria cerca del borde derecho */}
        <VolumetricFire position={[4.2, -0.8, -2.5]} height={1.6} radius={0.55} seed={11} />
        {/* Cactus columnares procedimentales con InstancedMesh (~4-5m altura efectiva) */}
        <CactiColumnar count={80} height={4.4} radius={0.3} ridges={6} areaRadius={9} groundY={-0.8} />
        {/* Flamas que siguen al mouse en 3D; complementa el burn overlay del shader */}
        <CursorBurnFlames enabled />
        <MouseTracker mouse={mouseRef} />
      </Canvas>
    </div>
  )
}