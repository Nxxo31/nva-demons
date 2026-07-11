'use client'

import { useRef, useEffect } from 'react'
import Hero from '@/components/Hero'
import Events from '@/components/Events'
import Music from '@/components/Music'
import Gallery from '@/components/Gallery'
import Tickets from '@/components/Tickets'
import Contact from '@/components/Contact'

// ─── Canvas: fire particles + cursor burn marks ───
function FireOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const mouseRef = useRef({ x: -200, y: -200 })
  const particlesRef = useRef<{
    x: number; y: number; vx: number; vy: number
    size: number; life: number; maxLife: number; hue: number
  }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)

    const burns: { x: number; y: number; alpha: number; r: number }[] = []
    let frame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Fire at cursor
      if (frame % 2 === 0 && mouseRef.current.x > 0) {
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * 15,
            y: mouseRef.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 2.5 + 0.8),
            size: 10 + Math.random() * 30,
            life: 0,
            maxLife: 25 + Math.random() * 40,
            hue: Math.random() * 40, // 0-40 = red to orange
          })
        }
        // Burn marks
        burns.push({ x: mouseRef.current.x, y: mouseRef.current.y, alpha: 0.5, r: 18 + Math.random() * 12 })
        if (burns.length > 120) burns.splice(0, burns.length - 120)
      }

      // Ambient embers rising
      if (frame % 4 === 0) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 1.2 + 0.3),
          size: 2 + Math.random() * 5,
          life: 0,
          maxLife: 120 + Math.random() * 150,
          hue: 20 + Math.random() * 25,
        })
      }

      // Draw burn marks
      for (let i = burns.length - 1; i >= 0; i--) {
        const b = burns[i]
        b.alpha *= 0.97; b.r *= 0.998
        if (b.alpha < 0.01 || b.r < 2) { burns.splice(i, 1); continue }
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, `rgba(255, 50, 0, ${b.alpha * 0.4})`)
        g.addColorStop(0.4, `rgba(120, 10, 0, ${b.alpha * 0.2})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)
      }

      // Draw particles
      const arr = particlesRef.current
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.life++
        if (p.life > p.maxLife) { arr.splice(i, 1); continue }
        p.x += p.vx + Math.sin(p.life * 0.15 + i) * 0.4
        p.y += p.vy; p.vy -= 0.025
        p.vx += (Math.random() - 0.5) * 0.12

        const prog = p.life / p.maxLife
        const alpha = Math.sin(prog * Math.PI) * 0.85
        const sz = p.size * (1 - prog * 0.3)

        const h = p.hue // 0-40
        ctx.globalCompositeOperation = 'screen'
        const g = ctx.createRadialGradient(p.x, p.y - sz * 0.2, 0, p.x, p.y, sz)
        g.addColorStop(0, `hsla(${40 + h * 0.5}, 100%, 80%, ${alpha})`)    // yellow-white core
        g.addColorStop(0.3, `hsla(${h + 10}, 100%, 60%, ${alpha * 0.7})`) // orange
        g.addColorStop(0.7, `hsla(${h}, 100%, 40%, ${alpha * 0.4})`)      // red-orange
        g.addColorStop(1, `hsla(${h - 10}, 100%, 20%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, sz * 0.65, sz, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
      if (arr.length > 400) particlesRef.current = arr.slice(-400)
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

// ─── Main Page ───
export default function Home() {
  return (
    <>
      {/* Layer 1: Ground — aerial Tatacoa photo */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/tatacoa-ground.jpg)',
          filter: 'brightness(0.55) saturate(1.35) contrast(1.1)',
        }}
      />

      {/* Layer 2: Sky view — birds eye Tatacoa as atmospheric top layer */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url(/images/tatacoa-sky-view.jpg)',
          filter: 'brightness(0.4) saturate(1.2) contrast(1.2) hue-rotate(-5deg)',
          backgroundPosition: 'center 20%',
        }}
      />

      {/* Layer 3: Dark gradient center vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Fire particle canvas */}
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