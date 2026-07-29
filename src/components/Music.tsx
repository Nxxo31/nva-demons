'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Headphones, ExternalLink } from 'lucide-react'

const TRACKS = [
  { title: 'Burning Sands', genre: 'Dark Techno', duration: '6:24' },
  { title: 'Ritual I', genre: 'Industrial', duration: '5:48' },
  { title: 'Inferno', genre: 'Acid Techno', duration: '7:12' },
  { title: 'Desert Call', genre: 'Hypnotic', duration: '6:05' },
]

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const trackVariant: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

export default function Music() {
  return (
    <section id="music" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Música
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Nuestros últimos lanzamientos
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Tracklist */}
          <motion.div
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {TRACKS.map((track, i) => (
              <motion.div
                key={i}
                variants={trackVariant}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                className="group flex items-center justify-between p-4 rounded-lg border border-red-900/20 hover:border-red-800/40 bg-black/30 hover:bg-red-950/20 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-red-900/30 flex items-center justify-center group-hover:border-orange-600 transition-colors">
                    <Headphones className="w-4 h-4 text-orange-600/70 group-hover:text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-600">{track.genre}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{track.duration}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Platform Links */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {['SoundCloud', 'Spotify', 'Bandcamp'].map((platform) => (
              <motion.a
                key={platform}
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/30 rounded-lg text-xs text-gray-500 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-3 h-3" />
                {platform}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
