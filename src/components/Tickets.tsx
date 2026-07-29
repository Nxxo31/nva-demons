'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Ticket, Check } from 'lucide-react'

const TIERS = [
  {
    name: 'General',
    price: '$350',
    description: 'Acceso al evento',
    features: ['Entrada general', '1 bebida de cortesía', 'Acceso a zona principal'],
    highlighted: false,
  },
  {
    name: 'VIP',
    price: '$700',
    description: 'Experiencia premium',
    features: ['Acceso prioritario', 'Barra libre (bebidas seleccionadas)', 'Zona VIP con vista privilegiada', 'Meet & greet con artistas'],
    highlighted: true,
  },
  {
    name: 'Ritual Pack',
    price: '$1,200',
    description: 'Experiencia completa',
    features: ['Todo lo de VIP', 'Merchandising exclusivo', 'Acceso al after-party', 'Fotografía con el colectivo', 'Transporte ida y vuelta'],
    highlighted: false,
  },
]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Tickets() {
  return (
    <section id="tickets" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Tickets
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Asegura tu lugar en el ritual
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative rounded-xl transition-all duration-500 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-red-950/60 to-black/60 border-2 border-orange-700/50 scale-105 md:scale-110'
                  : 'bg-black/40 border border-red-900/20 hover:border-red-800/40'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-800 to-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  Más Popular
                </div>
              )}

              <div className={`p-6 ${tier.highlighted ? 'pt-8' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-orange-600" />
                  <h3 className="text-lg font-cinzel font-bold text-white">{tier.name}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold fire-text">{tier.price}</span>
                  <span className="text-gray-600 text-sm ml-1">COP</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-cinzel text-sm tracking-wider transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-red-800 to-orange-600 text-white hover:from-red-700 hover:to-orange-500 shadow-lg shadow-red-900/30'
                      : 'border border-red-900/50 text-gray-400 hover:text-white hover:border-orange-700'
                  }`}
                >
                  Comprar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hi.Events integration note */}
        <motion.p
          className="text-center mt-8 text-xs text-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Powered by Hi.Events — Sistema de ticketing en integración
        </motion.p>
      </div>
    </section>
  )
}
