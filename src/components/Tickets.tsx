'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Ticket, Check } from 'lucide-react'
import { HiEvent, HiTicketType } from '@/types/hiEvents'
import { useState, useEffect, useCallback } from 'react'

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

export default function Tickets() {
  const [events, setEvents] = useState<HiEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/events', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (err) {
      setError('Failed to load events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch events on mount
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function handlePurchase(eventId: string, ticketTypeId: string, quantity: number, purchaserInfo: { name: string; email: string }) {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ticketTypeId, quantity, purchaserInfo }),
      })
      if (!res.ok) throw new Error(`Checkout failed: ${res.status}`)
      const session = await res.json()
      // Redirect to Hi.Events checkout URL
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl
      }
    } catch (err) {
      setError('Failed to initiate purchase')
      console.error('Error creating checkout session:', err)
    }
  }

  if (loading) {
    return (
      <section id="tickets" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
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

          <div className="text-center py-12">
            <div className="animate-pulse h-8 w-48 bg-red-900/20 rounded mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando eventos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="tickets" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
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

          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-4">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-500">{error}</p>
            </div>
            <button
              onClick={fetchEvents}
              className="mt-6 py-3 px-6 rounded-lg font-cinzel text-sm tracking-wider transition-all duration-300 bg-gradient-to-r from-red-800 to-orange-600 text-white hover:from-red-700 hover:to-orange-500 shadow-lg shadow-red-900/30"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

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

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {events.map((event: HiEvent, index: number) => (
            <motion.div
              key={event.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative rounded-xl overflow-hidden transition-all duration-500 bg-black/40 border border-red-900/20 hover:border-red-800/40"
            >
              {/* Event Image */}
              {event.imageUrl && (
                <div className="relative h-48">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                </div>
              )}

              <div className="p-6 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-orange-600" />
                  <h3 className="text-lg font-cinzel font-bold text-white">{event.title}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">{event.date}</p>
                <p className="text-sm text-gray-500 mb-4">{event.location}</p>
                <p className="text-gray-400 mb-6 line-clamp-2">{event.description}</p>

                {/* Ticket Types */}
                <div className="space-y-4">
                  {event.ticketTypes.map((ticketType: HiTicketType, ticketIndex: number) => (
                    <div
                      key={ticketType.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border border-red-900/20 transition-all duration-300 hover:border-red-800/30 ${
                        ticketIndex === 0 ? 'bg-black/20' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <span className="text-xs text-red-600 bg-red-900/20 px-2 py-0.5 rounded">
                          ${ticketType.price / 100}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-cinzel font-semibold text-white mb-1">{ticketType.name}</h4>
                        <p className="text-xs text-gray-400">{ticketType.description}</p>
                        <button
                          onClick={() => {
                            // In a real app, you'd show a modal for purchaser info
                            // For now, we'll use placeholder data
                            handlePurchase(
                              event.id,
                              ticketType.id,
                              1,
                              { name: 'Comprador', email: 'comprador@ejemplo.com' }
                            )
                          }}
                          className={`w-full mt-3 py-2 rounded-lg font-cinzel text-sm tracking-wider transition-all duration-300 ${
                            ticketType.id === event.ticketTypes[0]?.id
                              ? 'bg-gradient-to-r from-red-800 to-orange-600 text-white hover:from-red-700 hover:to-orange-500 shadow-lg shadow-red-900/30'
                              : 'border border-red-900/50 text-gray-400 hover:text-white hover:border-orange-700'
                          }`}
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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