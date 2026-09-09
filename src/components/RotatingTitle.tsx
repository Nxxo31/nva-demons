'use client'

import { useEffect, useRef } from 'react'

// ─── Rotating 3D Chrome Title ───
export default function RotatingTitle() {
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let scrollY = 0
    let targetRotY = 0
    let currentRotY = 0
    let rafId: number

    const onScroll = () => {
      scrollY = window.scrollY
      // Full rotation when scrolled past hero section
      const maxScroll = window.innerHeight * 0.8
      targetRotY = (scrollY / maxScroll) * 360
    }

    const animate = () => {
      currentRotY += (targetRotY - currentRotY) * 0.08
      if (el) {
        el.style.transform = `perspective(1200px) rotateY(${currentRotY}deg) rotateX(8deg)`
        el.style.opacity = String(Math.max(0.15, 1 - (scrollY / (window.innerHeight * 0.8))))
      }
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center select-none py-8">
      {/* Reflection plane */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))',
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, transparent 30%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 100%)',
        }}
      />

      {/* 3D Rotating Text */}
      <div
        ref={containerRef}
        className="relative text-center"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Chrome main text */}
        <div
          className="font-cinzel font-black text-[clamp(4rem,14vw,11rem)] leading-none tracking-none chromatic-fire"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Left half */}
          <span
            className="chromatic-left"
            style={{ display: 'inline-block' }}
            aria-hidden="false"
          >
            NVA
          </span>
          <br />
          {/* Right half */}
          <span className="chromatic-right" style={{ display: 'inline-block' }}>
            DEMONS
          </span>
        </div>

        {/* 3D depth layer (shadow text behind) */}
        <div
          className="absolute inset-0 font-cinzel font-black text-[clamp(4rem,14vw,11rem)] leading-none tracking-none pointer-events-none"
          style={{
            transform: 'translateZ(-40px) scale(1.05)',
            WebkitTextStroke: '0px transparent',
            background: 'linear-gradient(180deg, #440000 0%, #000000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'blur(4px)',
            opacity: 0.6,
          }}
          aria-hidden="true"
        >
          NVA
          <br />
          DEMONS
        </div>

        {/* Edge glow */}
        <div
          className="absolute inset-0 font-cinzel font-black text-[clamp(4rem,14vw,11rem)] leading-none tracking-none pointer-events-none"
          style={{
            transform: 'translateZ(-20px)',
            WebkitTextStroke: '1px rgba(255,80,0,0.3)',
            WebkitTextFillColor: 'transparent',
            filter: 'blur(1px)',
          }}
          aria-hidden="true"
        >
          NVA
          <br />
          DEMONS
        </div>
      </div>

      {/* Side lights (3D depth illusion) */}
      <div
        className="absolute top-1/2 left-0 w-32 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at left center, rgba(255,100,0,0.08) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute top-1/2 right-0 w-32 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at right center, rgba(255,100,0,0.08) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}