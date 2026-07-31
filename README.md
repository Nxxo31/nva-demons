<div align="center">

# 👹 NVA Demons

### Immersive 3D web experience built with Next.js, React Three Fiber & WebGL

A creative-coding portfolio piece exploring real-time graphics, particle systems, and GPU-driven visual effects in the browser.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![R3F](https://img.shields.io/badge/React_Three_Fiber-9-black?logo=react&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📦 Features (3D)

- **Real-time 3D rendering** — Powered by React Three Fiber (R3F) and Three.js WebGL renderer
- **GPU particle systems** — `three-vfx` and `wawa-vfx` for high-performance visual effects
  - Thousands of particles rendered efficiently on the GPU
  - Custom shader-based effects
- **Post-processing** — Bloom, glitch, and distortion effects for atmospheric visuals
- **Drei helpers** — Camera controls, environment maps, loaders, and more from `@react-three/drei`
- **Physics & interaction** — Framer Motion (12.x) for smooth UI and 3D-to-DOM transitions
- **Responsive canvas** — Adapts to screen size, device pixel ratio, and refresh rate
- **Asset pipeline** — GLTF/GLB model loading with Suspense fallbacks

## 🏗️ Architecture

```
nva-demons/
├── app/                    # Next.js App Router (16.x)
│   ├── layout.tsx          # Root layout — fonts, metadata, Canvas scaffold
│   ├── page.tsx            # Entry page — mounts the 3D scene
│   └── globals.css         # Tailwind v4 + CSS variables for theming
├── components/
│   ├── three/              # R3F scene components
│   │   ├── Scene.tsx       # Canvas + lights + camera
│   │   ├── Models/         # GLTF loaders (drei useGLTF)
│   │   ├── Particles/      # VFX particle emitters (three-vfx, wawa-vfx)
│   │   └── PostFX/         # Post-processing passes
│   └── ui/                 # DOM overlay (Tailwind + framer-motion)
├── public/
│   └── models/             # GLTF/GLB 3D assets
└── lib/
    └── utils.ts            # cn() class merger, math helpers
```

### Rendering Pipeline

```
┌──────────────────────────────────────────────┐
│  Next.js App Router (SSR + RSC)               │
│  app/layout.tsx → <Canvas> from R3F          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  React Three Fiber (R3F)                     │
│  Declarative scene graph as React components  │
│  ┌─────────┐ ┌─────────┐ ┌────────────────┐ │
│  │ Lights  │ │ Models  │ │ Particle VFX   │ │
│  │ (drei)  │ │ (useGLTF)│ │ (three-vfx)   │ │
│  └─────────┘ └─────────┘ └────────────────┘ │
└──────────────────┬───────────────────────────┘
                   │ WebGL context
                   ▼
┌──────────────────────────────────────────────┐
│  Three.js WebGLRenderer                      │
│  GPU-accelerated rasterization + shaders     │
│  Post-processing: Bloom / Glitch / Distort   │
└──────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| 3D Engine | Three.js 0.185 + React Three Fiber 9 |
| VFX | three-vfx 0.2 + wawa-vfx 1.2 |
| 3D Helpers | @react-three/drei 10 |
| UI Animation | framer-motion 12 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Class Utility | clsx + tailwind-merge (CN) |

## 🚀 Getting Started

**Prerequisites:** Node.js 18+, npm 9+

```bash
git clone https://github.com/Nxxo31/nva-demons.git
cd nva-demons
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
npm run start
```

## 🖥️ Hardware Requirements

3D rendering is GPU-intensive. For smooth performance:

| Requirement | Minimum | Recommended |
|---|---|---|
| **GPU** | WebGL2-compatible (fallback to WebGL1) | Dedicated GPU (NVIDIA GTX 1060+ / AMD RX 580+) |
| **RAM** | 4 GB | 8 GB+ |
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+ | Latest Chrome / Firefox |
| **OS** | Windows 10, macOS 11, Ubuntu 20.04 | Latest OS version |

> ⚠️ **Note:** Older mobile devices may experience reduced frame rates. The experience automatically reduces particle counts and disables post-processing on low-power devices.

## 📸 Screenshots

> _Screenshots coming soon — see the live demo._

<!-- ![NVA Demons hero](docs/screenshot-hero.png) -->

## 📄 License

MIT — See [LICENSE](LICENSE)

---

<div align="center">

**[⬆ Back to top](#-nva-demons)**

Built with 🎨 and WebGL.

</div>
