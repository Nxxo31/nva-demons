'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

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

  // Burn overlay canvas
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

  useEffect(() => {
    const maps = [colorMap, normalMap, roughnessMap, displacementMap, aoMap]
    maps.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6) })
  }, [colorMap, normalMap, roughnessMap, displacementMap, aoMap])

  const uniforms = useMemo(() => ({
    uBurnMap: { value: burnTexture },
    uTime: { value: 0 },
    uColorMap: { value: colorMap },
    uNormalMap: { value: normalMap },
    uRoughnessMap: { value: roughnessMap },
    uDisplacementMap: { value: displacementMap },
    uAOMap: { value: aoMap },
  }), [colorMap, normalMap, roughnessMap, displacementMap, aoMap, burnTexture])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = clock.elapsedTime

    // Paint burn at cursor
    const ctx = (burnTexture.image as HTMLCanvasElement)?.getContext('2d')
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
      burnTexture.needsUpdate = true
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
// 2. COLUMNAR CACTI — Tatacoa cactus columnares (InstancedMesh)
// ====================================================================
function Cacti() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const COUNT = 120

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const transforms = useMemo(() => {
    const data: { x: number; z: number; scale: number; rotation: number }[] = []
    for (let i = 0; i < COUNT; i++) {
      // Place cacti in clusters among the badlands
      const angle = Math.random() * Math.PI * 2
      const radius = 3 + Math.random() * 8
      data.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.6 + Math.random() * 1.4,
        rotation: Math.random() * Math.PI * 2,
      })
    }
    return data
  }, [])

  // Cactus geometry: main trunk + arms
  const cactusGeo = useMemo(() => {
    const group = new THREE.Group()

    // Main trunk
    const trunk = new THREE.CylinderGeometry(0.12, 0.18, 1, 8)
    const trunkMesh = new THREE.Mesh(trunk)
    trunkMesh.position.y = 0.5
    group.add(trunkMesh)

    // Arms (only for larger cacti)
    const arm = new THREE.CylinderGeometry(0.07, 0.09, 0.5, 6)
    const arm1 = new THREE.Mesh(arm)
    arm1.position.set(0.2, 0.85, 0)
    arm1.rotation.z = 0.4
    group.add(arm1)

    const arm2 = new THREE.Mesh(arm)
    arm2.position.set(-0.18, 0.75, 0)
    arm2.rotation.z = -0.35
    group.add(arm2)

    // Merge into single geometry
    const merged: THREE.BufferGeometry[] = []
    group.children.forEach(child => {
      const mesh = child as THREE.Mesh
      mesh.updateMatrix()
      merged.push(mesh.geometry.clone().applyMatrix4(mesh.matrix))
    })
    const geo = mergeGeometries(merged)
    return geo
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    // Scale and position
    transforms.forEach((t, i) => {
      dummy.position.set(t.x, -0.8, t.z)
      dummy.scale.set(t.scale, t.scale, t.scale)
      dummy.rotation.y = t.rotation
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [transforms, dummy])

  return (
    <instancedMesh
      ref={meshRef}
      args={[cactusGeo, undefined, COUNT]}
      count={COUNT}
    >
      <meshStandardMaterial
        color="#4a6b3a"
        roughness={0.9}
        metalness={0}
        flatShading
      />
    </instancedMesh>
  )
}

// ====================================================================
// 3. FIRE PARTICLES
// ====================================================================
const FireParticles = () => {
  const COUNT = 400
  const meshRef = useRef<THREE.Points>(null!)
  const speedsRef = useRef<Float32Array>(new Float32Array(COUNT))

  const geometry = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = Math.random() * 3 - 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14
      sizes[i] = 0.1 + Math.random() * 0.25
      speeds[i] = 0.004 + Math.random() * 0.018
    }
    speedsRef.current = speeds
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  const fireTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64; canvas.height = 128
    const ctx = canvas.getContext('2d')!
    for (let y = 0; y < 128; y++) {
      const t = y / 128
      let r = 1, g = 1, b = 0.9, a = 0.9
      if (t > 0.1) { r = 1; g = 0.85 - t * 0.3; b = 0.1; a = 0.8 }
      if (t > 0.3) { r = 1; g = 0.5 - t * 0.5; b = 0; a = 0.65 - t * 0.2 }
      if (t > 0.6) { r = 0.9 - t * 0.4; g = 0.1 - t * 0.06; b = 0; a = 0.3 - t * 0.2 }
      if (t > 0.85) { r = 0.2 - t * 0.15; g = 0; b = 0; a = 0.05 * (1 - t) * 10 }
      a = Math.max(0, a)
      const xVar = Math.sin(y * 0.25) * 0.35 + 0.5
      for (let x = 0; x < 64; x++) {
        const dx = Math.abs(x / 64 - xVar) * 10
        const alpha = a * Math.exp(-dx * dx)
        ctx.fillStyle = `rgba(${r * 255 | 0}, ${g * 255 | 0}, ${b * 255 | 0}, ${alpha})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(({ clock }) => {
    if (!geometry) return
    const pa = geometry.attributes.position as THREE.BufferAttribute
    const sa = geometry.attributes.size as THREE.BufferAttribute
    if (!pa || !sa) return
    const pos = pa.array as Float32Array
    const sizes = sa.array as Float32Array
    const speeds = speedsRef.current
    const time = clock.elapsedTime

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i] * (1 + 0.5 * Math.sin(time * 0.5 + i))
      pos[i * 3]     += Math.sin(time * 2 + i * 0.7) * 0.002
      pos[i * 3 + 2] += Math.cos(time * 1.5 + i * 0.5) * 0.002
      sizes[i] = (0.1 + (speeds[i] - 0.004) * 8) * (1 + 0.7 * Math.min(pos[i * 3 + 1] / 3, 1))
      if (pos[i * 3 + 1] > 3) {
        pos[i * 3]     = (Math.random() - 0.5) * 14
        pos[i * 3 + 1] = -0.5
        pos[i * 3 + 2] = (Math.random() - 0.5) * 14
      }
    }
    pa.needsUpdate = true
    sa.needsUpdate = true
  })

  return (
    <points geometry={geometry}>
      <pointsMaterial map={fireTex} size={0.3} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} />
    </points>
  )
}

// ====================================================================
// 4. EMBER PARTICLES
// ====================================================================
const EmberParticles = () => {
  const COUNT = 100
  const geometry = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = Math.random() * 2.5 - 0.3
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
      sizes[i] = 0.015 + Math.random() * 0.04
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (!geometry) return
    const pa = geometry.attributes.position as THREE.BufferAttribute
    if (!pa) return
    const pos = pa.array as Float32Array
    const t = clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += 0.006 + Math.sin(t + i) * 0.002
      pos[i * 3] += Math.sin(t * 2 + i) * 0.001
      if (pos[i * 3 + 1] > 2.5) {
        pos[i * 3]     = (Math.random() - 0.5) * 12
        pos[i * 3 + 1] = -0.3
        pos[i * 3 + 2] = (Math.random() - 0.5) * 12
      }
    }
    pa.needsUpdate = true
  })

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#ff8833" size={0.05} sizeAttenuation transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.85} />
    </points>
  )
}

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
    {/* Subtle red fog for distance */}
    <fog attach="fog" args={['#661111', 8, 18]} />
  </>
)

// ====================================================================
// 7. MAIN EXPORT
// ====================================================================
export default function DesertScene() {
  const mouseRef = useRef(new THREE.Vector2(0, 0))

  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen" style={{ background: '#0a0000' }}>
      <Canvas
        camera={{ position: [0, 3.2, 6], fov: 52, near: 0.1, far: 25 }}
        dpr={[1, 1.5]}
        style={{ width: '100vw', height: '100vh' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.setClearColor('#220505') }}
      >
        <Lights />
        <BadlandsTerrain mouse={mouseRef} />
        <Cacti />
        <FireParticles />
        <EmberParticles />
        <MouseTracker mouse={mouseRef} />
      </Canvas>
    </div>
  )
}