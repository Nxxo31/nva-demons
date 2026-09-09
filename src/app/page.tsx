'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import Events from '@/components/Events'
import Music from '@/components/Music'
import Gallery from '@/components/Gallery'
import Tickets from '@/components/Tickets'
import Contact from '@/components/Contact'

// ─── Dynamic import: DesertScene loads only on client (uses WebGL) ───
const DesertScene = dynamic(() => import('@/components/Scene3D/DesertScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 w-screen h-screen bg-[#220505]" />
  ),
})

// ─── Fire particle canvas (cursor burns + ambient embers) ───
import FireOverlay from '@/components/FireOverlay'

// ─── Main Page ───
export default function Home() {
  return (
    <>
      {/* Layer 1: 3D Desert Scene — replaces static background images */}
      <DesertScene />

      {/* Layer 2: Dark gradient overlay for legibility (above 3D scene, below fire + content) */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Fire particle canvas (screen blend on top of 3D scene) */}
      <FireOverlay />

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <Events />
        <Music />
        <Gallery />
        <Tickets />
        <Contact />
      </div>
    </>
  )
}
