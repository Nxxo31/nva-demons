'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Flame } from 'lucide-react'
import RotatingTitle from './RotatingTitle'

export default function Hero() {
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    // Trigger title animation after mount
    const t = setTimeout(() => setTitleVisible(true), 100)

    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.05 }
    )
    reveals.forEach((el) => observer.observe(el))
    return () => {
      clearTimeout(t)
      reveals.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start pt-16 overflow-hidden"
    >
      {/* Sky gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none z-[1]" />

      {/* Rotating 3D Chrome Title — full width, sky perspective */}
      <div className="relative z-10 w-full" style={{ perspective: '1200px' }}>
        <RotatingTitle />
      </div>

      {/* Content below title */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <p
          className="reveal text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed tracking-wide"
          style={{ transitionDelay: '0.3s' }}
        >
          Electronic music collective from the Tatacoa Desert.
          <br />
          Techno industrial · Dark beats · Sensory overload.
        </p>

        <div
          className="reveal flex flex-col sm:flex-row gap-4 justify-center"
          style={{ transitionDelay: '0.5s' }}
        >
          <a
            href="#tickets"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-900 via-orange-700 to-red-800 text-white font-bold font-cinzel rounded-lg hover:from-red-800 hover:via-orange-600 hover:to-red-700 transition-all duration-300 shadow-2xl glow-fire tracking-wider"
          >
            <Flame className="w-5 h-5" />
            Eventos
          </a>
          <a
            href="#music"
            className="inline-flex items-center gap-2 px-10 py-4 border border-red-800/50 text-gray-300 hover:text-white hover:border-orange-700 font-cinzel rounded-lg transition-all duration-300 tracking-wider"
          >
            Música
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <ChevronDown className="w-8 h-8 text-red-900/50" />
      </div>
    </section>
  )
}