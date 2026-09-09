'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Flame } from 'lucide-react'
import RotatingTitle from './RotatingTitle'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start pt-16 overflow-hidden"
    >
      {/* Sky gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none z-[1]" />

      {/* Rotating 3D Chrome Title — full width, sky perspective */}
      <motion.div
        className="relative z-10 w-full"
        style={{ perspective: '1200px' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <RotatingTitle />
      </motion.div>

      {/* Content below title */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.p
          className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          Electronic music collective from the Tatacoa Desert.
          <br />
          Techno industrial · Dark beats · Sensory overload.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
        >
          <motion.a
            href="#tickets"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-900 via-orange-700 to-red-800 text-white font-bold font-cinzel rounded-lg hover:from-red-800 hover:via-orange-600 hover:to-red-700 transition-all duration-300 shadow-2xl glow-fire tracking-wider"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Flame className="w-5 h-5" />
            Eventos
          </motion.a>
          <motion.a
            href="#music"
            className="inline-flex items-center gap-2 px-10 py-4 border border-red-800/50 text-gray-300 hover:text-white hover:border-orange-700 font-cinzel rounded-lg transition-all duration-300 tracking-wider"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Música
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8 text-red-900/50" />
      </motion.div>
    </section>
  )
}
