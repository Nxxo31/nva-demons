# PROJECT.md — NVA Demons

> **Estado:** Activo | **Versión:** 0.1.0 (Fase 1 MVP) | **Última actualización:** 2026-07-31

---

## 🎯 Objetivo Principal

Landing page 3D inmersiva para un colectivo de música electrónica con temática infernal/fuego, escenificada en un desierto 3D inspirado en el Desierto de la Tatacoa (Colombia), con cursor que quema la arena y sistema de ticketing integrado.

## 🎯 Objetivos Secundarios

1. Escena 3D del desierto de Tatacoa con shader custom para cárcavas y PBR terrain displacement
2. Cielo infernal (rojo/naranja) que contrasta con la tierra colorada
3. Cactus columnares procedimentales con InstancedMesh (4-5m altura)
4. Fuego volumétrico con THREE.Fire (ray marching) + brasas/humo por partículas
5. Cursor effect: canvas texture overlay que quema la arcilla al paso del mouse + flamas
6. Sistema de ticketing backend con Hi.Events (self-hosted, open-source AGPL)
7. Build passing (`npm run build` exit 0, 0 lint errors)
8. Fallback WebGL → CSS/Canvas cuando WebGL no disponible

---

## 📐 Arquitectura

### Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | Next.js | 14+ (App Router) | SSR, routing, optimización |
| 3D Engine | React Three Fiber + Three.js | ^9 | Escena 3D badlands Tatacoa |
| Terrain | Custom ShaderMaterial | — | Cárcavas, displacement PBR, vertex displacement |
| Fire FX | THREE.Fire (R3F) + custom particles | ^1.4 | Fuego volumétrico con ray marching |
| Vegetación | InstancedMesh | — | Cactus columnares procedimentales |
| Cursor FX | CanvasTexture overlay + particles | — | Arena quemada + flamas al paso |
| UI | Tailwind CSS + shadcn/ui | latest | Overlay, navegación, eventos |
| Animaciones | Framer Motion | latest | Transiciones, scroll, micro-interacciones |
| Tipografía | Google Fonts: Cinzel, Inter | — | Gótica/infernal (Cinzel) + legible (Inter) |
| Backend ticketing | Hi.Events (self-hosted) | latest | Gestión de eventos, tickets, pagos |
| Pagos | Stripe / PayPal | — | Procesamiento de pagos (vía Hi.Events) |
| DB ticketing | PostgreSQL (Hi.Events) | — | Datos de eventos y tickets |
| Lenguaje | TypeScript | latest | Tipado estático para componentes 3D seguros |

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                CAPA CLIENTE (browser)                          │
│                                                               │
│  Next.js page.tsx (SSR)                                       │
│   ├─ Hero.tsx          (typewriter + glitch effect)           │
│   ├─ Navbar.tsx         (sticky navigation)                    │
│   ├─ Events.tsx         (event cards from Hi.Events API)       │
│   ├─ Music.tsx          (SoundCloud/Spotify embed)            │
│   ├─ Gallery.tsx        (photo grid del colectivo)            │
│   ├─ Tickets.tsx        (compra integrada Hi.Events)          │
│   ├─ Contact.tsx        (form de contacto)                    │
│   └─ Footer.tsx         (redes + newsletter)                  │
│                                                               │
│  R3F Canvas (full-screen background)                          │
│   ├─ DesertScene        (terreno shader + cielo)              │
│   ├─ FireEffect         (THREE.Fire volumétrico)              │
│   ├─ CursorBurn         (CanvasTexture overlay + particles)   │
│   ├─ ParticleSystem     (chispas, humo, brasas)               │
│   └─ Cactus InstancedMesh (columnares procedimentales)        │
├──────────────────────────────────────────────────────────────┤
│                CAPA TICKETING (separada)                       │
│  Hi.Events backend (PHP/Laravel + PostgreSQL + Redis)         │
│   ├─ REST API: eventos, tickets, órdenes, pagos                │
│   ├─ Stripe / PayPal integration (native)                     │
│   └─ Admin dashboard web UI incluida                         │
└──────────────────────────────────────────────────────────────┘
│                CAPA HOSTING                                   │
│  Frontend: Vercel (Next.js) · Backend: Railway (Hi.Events)   │
│  Assets CDN: Cloudflare / Vercel Edge                        │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
[Usuario navega a localhost/]
  → [Next.js SSR page.tsx]
  → [Hero typewriter + R3F Canvas mount]
  → [DesertScene init ShaderMaterial con displacement]
  → [cactus InstancedMesh (place instances en grid cárcavas)]
  → [FireEffect: THREE.Fire ray marching over fire zones]
  → [CursorBurn: listen mousemove → canvas texture + particle burst]
       ↓
  [Usuario clic en evento]
  → [Tickets.tsx fetch via lib/ticketApi.ts]
  → [Hi.Events REST API: GET /events]
  → [Stripe checkout via Hi.Events handler]
  → [order_id persist en PostgreSQL (Hi.Events)]
  → [ticket QR enviado al usuario]
```

---

## 📊 Matriz de Trazabilidad

| Req ID | Descripción | Componente | Estado | Verificación |
|--------|-------------|------------|--------|--------------|
| R-01 | Escena 3D con terrain shader + cárcavas | `components/Scene3D/DesertScene.tsx` | ✅ | Build exit 0, render en localhost |
| R-02 | Cielo infernal con shader de color grading | `DesertScene.tsx` sky shader | ✅ | Paleta `#8b0000`/`#ff4500` visible |
| R-03 | Cactus columnares procedimentales (InstancedMesh) | `DesertScene.tsx` (InstancedMesh) | ✅ | 4-5m height, distribución cárcavas |
| R-04 | Fuego volumétrico con THREE.Fire | `components/Scene3D/FireEffect.tsx` | ✅ | Ray marching visible en fire zones |
| R-05 | Cursor que quema la arena + flamas | `components/Scene3D/CursorBurn.tsx` | ✅ | CanvasTexture overlay + particle emit on mousemove |
| R-06 | Sistema de partículas (chispas, humo, brasas) | `components/Scene3D/ParticleSystem.tsx` | ✅ | Partículas comet trail + smoke puffs |
| R-07 | UI completa: Hero, Navbar, Events, Music, Gallery, Tickets, Contact, Footer | `components/*.tsx` | ✅ | Visualización en localhost completa |
| R-08 | Diseño responsive + animaciones Framer Motion | All components | ✅ | Responsive layout + scroll animations |
| R-09 | Build passing: `npm run build` exit 0 | — | ✅ | npm run build → exit 0 |
| R-10 | Lint passing: 0 errors (4 warnings no-bloqueantes) | — | ✅ | npm run lint → 0 errors |
| R-11 | Fallback WebGL → CSS si WebGL no disponible | `DesertScene.tsx` fallback | ✅ | Detect webgl context fails → CSS gradient fallback |
| R-12 | Paleta temática infernal | `app/globals.css` | ✅ | `#1a0000`, `#8b0000`, `#ff4500`, `#ffd700`, `#fff8dc` |
| R-13 | Tipografía gótica Cinzel + legible Inter | `layout.tsx` fonts | ✅ | Google Fonts loaded, Cinzel for hero/branding |
| R-14 | Deploy Hi.Events backend | — | ⏳ | Issue #1 — Hi.Events setup pending |
| R-15 | Integración Hi.Events API con front-end | `lib/ticketApi.ts` | ⏳ | Esqueleto del cliente existe, integration falta |
| R-16 | Eventos dinámicos desde DB Hi.Events | `Events.tsx` | ⏳ | Pendiente Fase 2 |
| R-17 | Checkout con Stripe/PayPal | — | ⏳ | Pendiente Fase 2 (vía Hi.Events native) |
| R-18 | Optimización de rendimiento 3D | `DesertScene.tsx`, `ParticleSystem.tsx` | ⏳ | Pendiente Fase 3 |
| R-19 | SEO, metadata, Open Graph | `layout.tsx`, `page.tsx` | ⏳ | Pendiente Fase 3 |
| R-20 | Deploy a Vercel + Railway (custom domain) | — | ⏳ | Pendiente Fase 3 |
| R-21 | Hi.Events Fase 2 integración completa | — | ⏳ | Issue #1 |

---

## 🏗️ Marcos Conceptuales

### Inmersión Sensorial Múltiple
- **Visual**: terreno shader con displacement procedimental + cielo color grading
- **Sonido**: embeds SoundCloud/Spotify para techno industrial, dark techno, acid
- **Interacción**: cursor que quema la arcilla + flamas que persisten
- **Movimiento**: Framer Motion para scroll-triggered + micro-interacciones

El goal es 100% inmersivo — el usuario "siente" estar en el desierto y puede "quemar" la arena.

### Temática Infernal Coherente
Referencias visuales: Mad Max Fury Road (desierto post-apocalíptico), Doom (2016) (fuego volumétrico), Diablo (oscuro gótico), Burning Man (festival en desierto). Cada elemento del UI reforzar la temática:
- Negros sangre (`#1a0000`) + rojos oscuros (`#8b0000`)
- Naranja fuego (`#ff4500`) + dorados (`#ffd700`)
- Arena/textos (`#fff8dc`)

### Dessert Tatacoa como Participante Activo
El Desierto de la Tatacoa (Colombia) no es solo fondo — es paisaje activo:
- Zona Cuzco: arcilla color terracota/ocre
- Zona Los Hoyos: suelo gris
- Cárcavas: erosionadas hasta 20m, laberínticas
- Cactus columnares (Cereus peruvianus): 4-5m altura auténticos de la zona

### Reference Implementationscomo Foundation
- THREE.Fire: fuego volumétrico con ray marching — estado del arte para WebGL
- InstancedMesh: cactus columnares (cientos de instancias, una draw call)
- Custom ShaderMaterial: terrain con vertex displacement + cárcavas
- R3F (React Three Fiber): abstracción declarativa sobre Three.js para React

### Progressive Enhancement
- WebGL priority → CSS fallback:
  - WebGL disponible → escena 3D full
  - WebGL falla → CSS gradient sky + canvas 2D particles
  - Reduced motion → deshabilitar cursor burn + particles, estático desierto

---

## ✅ Justificación de Decisiones Técnicas

| Decisión | Opción elegida | Alternativas evaluadas | Razón |
|----------|---------------|----------------------|-------|
| Framework | Next.js 14+ App Router | Vite SPA, Remix | SSR para SEO + routing natural + mejor DX para componentes complejos |
| 3D Engine | React Three Fiber + Three.js | Babylon.js, PlayCanvas, pure WebGL | Envoltura React declarativa sobre Three.js, popular, gran ecosystem, tres.js + R3F + drei combinados |
| Terrain | Custom ShaderMaterial | Heightmaps, DAE models GLTF | Flexibilidad para cárcavas + PBR normals sin arte 3D modelado |
| Fire FX | THREE.Fire (ray marching) | Particle sprites, video background | Volumétrico realista + estado del arte para WebGL flames + MIT licensed |
| Vegetación | InstancedMesh | Individual meshes, GLTF cactus | Una draw call para cientos de cactus, performance layout |
| Cursor FX | CanvasTexture overlay + particles | Mouse-trail simple | Persistencia del quemado (arena "rencuerda" recorrido), flamas que emergen |
| UI Library | Tailwind CSS + shadcn/ui | styled-components, Mantine (overkill) | Tailwind zero-runtime + shadcn copy-paste components + coherencia diseño |
| Animations | Framer Motion | GSAP, react-spring | React-first, smaller bundle para este scope |
| Fonts | Google Fonts Cinzel + Inter | Self-host, Fontsource | Cinzel gótica+infernalgetMockBuilder + Inter legibilidad universal |
| Ticketing | Hi.Events (self-hosted AGPL) | Eventbrite (SaaS), Ticket Tailor, Pretix | Open-source, Stripe nativo, dashboard incluido, API completa — coherente con el espíritu open-del proyecto |
| Hosting frontend | Vercel | Netlify, Railway, self-host | Next.js nativo + Edge network + analytics free tier |
| Routing | App Router | Pages Router | Futuro de Next.js, layout anidado, streaming SSR |

---

## 📦 Estado de Implementación

### Fases Completadas

| Fase | Descripción | Commit | Verificación |
|------|-------------|--------|--------------|
| Fase 1 MVP | Investigación 3D librerías + Hi.Events, set up Next.js R3F, escena 3D desierto (terrain shader, cielo, atmósfera) | bbae4fe | Build exit 0, lint 0 errors (4 warnings no-bloqueantes) |
| Fase 1 UI | UI completa: Hero, Navbar, Events, Music, Gallery, Tickets, Contact, Footer + Diseño responsive + animaciones | bbae4fe | Visualización en localhost completa |
| Fase 1 FX | Efecto cursor que quema arena + fuego volumétrico THREE.Fire + fallback WebGL | bbae4fe | Cursor Burn observado + fire rendering |
| Lint fix | Lint 0 errors (R3F ref pattern fixed) + build passing + .backup removed | 5d7a9c7 | npm run lint → 0 errors / 4 warnings |
| Templates | GitHub issue/PR templates + CI 3-layer gates | bfcc6da | Workflow files committed |

### Próximos Pasos (Backlog)

| ID | Descripción | Prioridad | Issue |
|----|-------------|-----------|-------|
| B-1 | Deploy Hi.Events backend (self-hosted AGPL) | Alta | #1 |
| B-2 | Integración Hi.Events API con front-end (eventos dinámicos) | Alta | #1 |
| B-3 | Checkout Stripe/PayPal (vía Hi.Events native) | Alta | #2 |
| B-4 | Optimización rendimiento 3D (gpu instancing tuning) | Media | #3 |
| B-5 | SEO + metadata + Open Graph + JSON-LD | Media | #4 |
| B-6 | Deploy a Vercel + Railway + dominio personalizado + CDN | Baja | #5 |
| B-7 | Hi.Events custom admin theme infernal (match landing) | Baja | #6 |
| B-8 | Performance profiling + 60fps target verification | Baja | #7 |

---

## ⚠️ Limitaciones Conocidas

1. **WebGL requerido para full expérience**: clientes sin WebGL ven CSS fallback simplified; sin cursor burn ni fire volumétrico
2. **Performance cost**: THREE.Fire + cactus InstancedMesh + Custom Shader possono jank on GPU bajo (testing pending)
3. **Hi.Events PHP/Laravel**: stack independiente del frontend Next.js — requiere deployment separado y mantenimiento
4. **Sin sellers reales**: tickets Events.tsx currently muestra placeholders, sin real DB integración hasta Fase 2
5. **Form de contacto backend**: actual Contact.tsx es front-end only; necesita endpoint POST y validation server-side
6. **Tipografía Cinzel**: por decorative gótica, no es para body text — limita copies long-form
7. **Reduced-motion fallback**: solo deshabilita animaciones + cursor burn, el resto de la UX es igual

---

## 🔐 Seguridad

- **Hi.Events self-hosted**: control total de datos de tickets y pagos, no SaaS third-party
- **Stripe / PayPal vía Hi.Events native**: no maneja CC data en front-end custom
- **No PII en front-end**: datos de clientes viven en Hi.Events PostgreSQL, no en páginas Next.js
- **CSP recomendado**: para producción post-deploy, configurar Content-Security-Policy header
- **Form de contacto futuro**: requiere Honeypot + Rate-limiting servidor-side

---

## 📚 Referencias

- Three.js docs: https://threejs.org/docs/
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber
- @react-three/drei docs: https://drei.docs.pmnd.rs/
- THREE.Fire: https://github.com/cwilliam89/three-fire
- Hi.Events docs (self-hosted ticketing): https://hi.events/docs
- Next.js 14 App Router: https://nextjs.org/docs/app
- Tailwind CSS v4: https://tailwindcss.com/
- Framer Motion: https://www.framer.com/motion/
- Inspo Tatacoa: https://es.wikipedia.org/wiki/Desierto_de_la_Tatacoa
- Repo: https://github.com/Nxxo31/nva-demons

---

*Generado por SophIA — Sebastian Velasco's autonomous operating system*
