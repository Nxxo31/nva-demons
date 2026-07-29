'use client'

import { motion } from 'framer-motion'

export default function Gallery() {
  const images = [
    { src: '/images/tatacoa-aerial.jpg', alt: 'Vista aérea del Desierto de la Tatacoa, columnas de erosión' },
    { src: '/images/tatacoa-ground.jpg', alt: 'Suelo erosionado del Tatacoa, grietas y cárcavas' },
    { src: '/images/tatacoa-sky-view.jpg', alt: 'Vista cenital del Tatacoa, colores rojizos y ocres' },
    { src: '/images/tatacoa-bg.jpg', alt: 'Paisaje del Tatacoa al atardecer, sombras largas y cielo rojo' },
  ]

  return (
    <section id="gallery" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Galería
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Momentos de nuestros rituales pasados en el Desierto Infernal
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-xl border border-red-900/20 hover:border-red-800/30 transition-all duration-500 group"
            >
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 to-black/60" />
              
              {/* Image */}
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
                loading="lazy"
              />
              
              {/* Hover info */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 rounded-full border border-red-900/40 flex items-center justify-center mb-3 group-hover:border-orange-600 transition-colors">
                  <div className="w-8 h-8 bg-red-800 rounded-full" />
                </div>
                <p className="text-xs text-gray-600 font-cinzel">
                  TATACOA {i + 1}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}