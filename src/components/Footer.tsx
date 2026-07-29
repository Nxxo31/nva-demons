'use client'

import { motion } from 'framer-motion'
import { Flame, Camera, Music2, Globe } from 'lucide-react'

const SOCIALS = [
  { icon: Camera, label: 'Instagram', href: '#' },
  { icon: Globe, label: 'Twitter / X', href: '#' },
  { icon: Music2, label: 'YouTube', href: '#' },
  { icon: Music2, label: 'SoundCloud', href: '#' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-red-900/20 py-12 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.a
            href="#hero"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="font-cinzel text-lg font-bold fire-text">
              NVA DEMONS
            </span>
          </motion.a>

          <div className="flex items-center gap-6">
            {SOCIALS.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                aria-label={social.label}
                whileHover={{ scale: 1.2, y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Newsletter"
              className="px-3 py-2 bg-black/40 border border-red-900/30 rounded text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-orange-800 w-40"
            />
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-red-800 to-orange-600 text-white rounded text-xs font-bold hover:from-red-700 hover:to-orange-500 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Suscribir
            </motion.button>
          </div>
        </div>

        <div className="section-divider mt-8 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-800">
          <p>© 2026 NVA DEMONS. Desde la Tatacoa, con fuego.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-500 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-gray-500 transition-colors">Términos y condiciones</a>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}
