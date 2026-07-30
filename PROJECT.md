# NVA Demons 🔥

**Colectivo de música electrónica — Landing Page + Sistema de ticketing**

---

## Concepto

Landing page inmersiva para un colectivo de música electrónica con temática **infernal/fuego**.
El fondo es un **desierto 3D inspirado en el Desierto de la Tatacoa (Colombia)** — 
un bosque seco tropical con suelo arcilloso de color **terracota/ocre** (zona Cuzco) 
y **gris** (zona Los Hoyos), erosionado en **cárcavas laberínticas** de hasta 20m de profundidad.

El cursor **quema la arcilla y genera flamas** al pasar.
Cactus columnares de 4-5m emergen del paisaje erosionado.
El cielo es un rojo/naranja infernal que contrasta con la tierra colorada.
UI/UX oscuro con paleta rojo/naranja/negro, tipografía gótica/industrial.

---

## Stack técnico

### Landing Page
| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | **Next.js 15+** (App Router) | SSR, routing, optimización |
| 3D Engine | **React Three Fiber + Three.js** | Escena 3D badlands Tatacoa |
| Terrain | **Custom ShaderMaterial** | Cárcavas, displacement PBR, vertex displacement |
| Fire FX | **THREE.Fire** (R3F) + Custom particles | Fuego volumétrico con ray marching |
| Vegetación | **InstancedMesh** de cactus | Cactus columnares procedimentales |
| Cursor FX | CanvasTexture overlay + particles | Arcilla quemada + flamas al paso del cursor |
| UI | Tailwind CSS + shadcn/ui | Overlay, navegación, eventos |
| Animaciones | Framer Motion | Transiciones, scroll, micro-interacciones |
| Tipografía | Google Fonts: Cinzel, Inter | Gótica/infernal + legible |

### Sistema de Ticketing
| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Backend | **Hi.Events** (self-hosted) | Gestión de eventos, tickets, pagos |
| API | REST API de Hi.Events | Integración con el front-end |
| Pagos | Stripe / PayPal | Procesamiento de pagos |
| DB | PostgreSQL (Hi.Events) | Datos de eventos y tickets |

> **Nota:** Hi.Events es open-source (AGPL), gestiona eventos, tickets, órdenes, pagos y tiene API REST. Se despliega como backend separado.

---

## Referencias de diseño

- **Paleta:** `#1a0000` (negro sangre), `#8b0000` (rojo oscuro), `#ff4500` (naranja fuego), `#ffd700` (dorado), `#fff8dc` (arena)
- **Temática:** Desierto infernal, grietas de lava, texturas de carbón/hollín
- **Música:** Techno industrial, dark techno, acid
- **Referencias visuales:** Mad Max Fury Road, Doom (2016), Diablo, Burning Man

---

## Estructura del Front-end

```
nva-demons/
├── app/
│   ├── page.tsx              # Landing page principal
│   ├── layout.tsx            # Layout global con metadata
│   └── globals.css           # Estilos globales + animaciones
├── components/
│   ├── Scene3D/              # Escena Three.js (R3F)
│   │   ├── DesertScene.tsx   # Desierto 3D con terreno
│   │   ├── FireEffect.tsx    # Fuego volumétrico (THREE.Fire)
│   │   ├── CursorBurn.tsx    # Arena quemada al pasar cursor
│   │   └── ParticleSystem.tsx # Chispas, humo, brasas
│   ├── ui/                   # shadcn/ui components
│   ├── Hero.tsx              # Sección hero con texto + glitch
│   ├── Events.tsx            # Próximos eventos
│   ├── Music.tsx             # Embed SoundCloud/Spotify
│   ├── Gallery.tsx           # Galería de fotos del colectivo
│   ├── Tickets.tsx           # Compra de tickets integrada
│   ├── Contact.tsx           # Formulario de contacto
│   ├── Navbar.tsx            # Navegación sticky
│   └── Footer.tsx            # Redes sociales + newsletter
├── public/
│   ├── fonts/                # Tipografías locales
│   ├── images/               # Assets: logo, fotos, texturas
│   └── textures/             # Texturas 3D (arena, fuego, cielo)
└── lib/
    ├── ticketApi.ts          # Cliente API para Hi.Events
    └── utils.ts              # Utilidades
```

---

## Fases del proyecto

### Fase 1 — Front-end (MVP)
- [x] Investigación de librerías 3D y referencias de diseño
- [x] Investigación de sistema de ticketing
- [x] Set up Next.js con R3F
- [x] Escena 3D del desierto con Three.js (terreno, cielo, atmósfera)
- [x] Efecto de cursor que quema la arena (custom shader)
- [x] Fuego volumétrico con THREE.Fire
- [x] UI completa: Hero, Navbar, Events, Music, Gallery, Tickets, Contact, Footer
- [x] Diseño responsive + animaciones
- [x] Build passing: `npm run build` exit 0, 0 lint errors (4 warnings no-bloqueantes)
- [x] Despliegue en localhost para preview

### Fase 2 — Sistema de Ticketing
- [ ] Deploy de Hi.Events backend
- [ ] Integración con el front-end vía API
- [ ] Eventos dinámicos desde la DB
- [ ] Checkout con Stripe/PayPal

### Fase 3 — Producción
- [ ] Optimización de rendimiento 3D
- [ ] SEO, metadata, Open Graph
- [ ] Deploy a Vercel + Railway
- [ ] Dominio personalizado
- [ ] CDN para assets

---

## Investigación de librerías 3D

| Librería | Versión | Uso | Licencia |
|----------|---------|-----|----------|
| Three.js | r150+ | Motor 3D base | MIT |
| React Three Fiber | ^9 | Bridge React-Three.js | MIT |
| @react-three/drei | ^9 | Utilidades R3F | MIT |
| THREE.Fire | ^1.4 | Fuego volumétrico ray marching | MIT |
| wawa-vfx | latest | Partículas GPU (chispas, humo) | MIT |
| three.quarks | latest | Sistema de partículas avanzado | MIT |

### Efecto de cursor quemando arena
**Enfoque:** Custom shader con Three.js Instancing
1. Renderizar millones de partículas de arena como instancias
2. En la posición del cursor, cambiar el color de las partículas a negro/carbón + emitir partículas de fuego
3. Usar `THREE.Fire` para las flamas que se elevan de la arena quemada
4. Persistencia: la arena queda marcada (color oscuro) durante unos segundos y luego se "enfría"

---

## Sistema de Ticketing — Hi.Events

| Característica | Soporte |
|---------------|---------|
| Self-hosted | ✅ Sí (AGPL) |
| API REST | ✅ Completa |
| Stripe | ✅ Nativo |
| PayPal | ✅ Nativo |
| Eventos múltiples | ✅ |
| Tipos de tickets | ✅ General, VIP, early bird |
| Checkout personalizado | ✅ API permite integración custom |
| Dashboard admin | ✅ Web UI incluida |

**Stack de Hi.Events:** PHP (Laravel) + TypeScript (React) + PostgreSQL + Redis

**Para NVA Demons:** Usaremos solo la API REST de Hi.Events, con un front-end custom que coincide con el theme infernal.

---

## Estado actual: 🟢 Fase 1 — Desarrollo Front-end