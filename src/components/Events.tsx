'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { CalendarDays, MapPin, Clock, Flame, Ticket } from 'lucide-react'
import { HiEvent, HiTicketType } from '@/types/hiEvents'
import { formatCurrency, formatDate } from '@/lib/ticketApi'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Events() {
  const [events, setEvents] = useState<HiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/events', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('No se pudieron cargar los eventos. Reintentar.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function handleGetTickets(event: HiEvent, ticketType: HiTicketType) {
    try {
      setCheckoutLoading(`${event.id}-${ticketType.id}`)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: 1,
          purchaserInfo: {
            name: 'Guest',
            email: 'guest@example.com',
          },
        }),
      })
      if (!res.ok) throw new Error(`Checkout failed: ${res.status}`)
      const data = await res.json()
      // Redirect to Hi.Events checkout URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Error al iniciar checkout. Intenta de nuevo.')
      setCheckoutLoading(null)
    }
  }

  function getAvailability(ticketType: HiTicketType): { available: number; status: string; color: string } {
    const available = ticketType.quantityAvailable - ticketType.quantitySold
    if (available <= 0) return { available: 0, status: 'Agotado', color: 'text-red-500' }
    if (available < 20) return { available, status: 'Últimos tickets', color: 'text-orange-400' }
    return { available, status: 'Disponible', color: 'text-green-400' }
  }

  return (
    <section id="events" className="relative py-24 px-4">
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
            Próximos Eventos
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Fechas, lugares y rituales programados
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-pulse h-8 w-48 bg-red-900/20 rounded mx-auto mb-4" />
            <p className="text-gray-500">Cargando eventos...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={fetchEvents}
              className="px-6 py-3 rounded-lg font-cinzel text-sm tracking-wider bg-gradient-to-r from-red-800 to-orange-600 text-white hover:from-red-700 hover:to-orange-500 transition-all duration-300"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {events.map((event, i) => {
              const cheapest = event.ticketTypes[0]
              const totalAvail = event.ticketTypes.reduce(
                (sum, t) => sum + Math.max(0, t.quantityAvailable - t.quantitySold), 0
              )
              return (
                <motion.div
                  key={event.id || i}
                  variants={item}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative overflow-hidden rounded-xl glow-border bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-500"
                >
                  {/* Featured badge */}
                  {i === 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-800 to-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider z-10">
                      <Flame className="w-3 h-3" />
                      Destacado
                    </div>
                  )}

                  {/* Event image */}
                  {event.imageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Date Badge */}
                    <div className="inline-block px-3 py-1 border border-red-900/50 rounded text-xs font-cinzel text-orange-400 mb-4">
                      {formatDate(event.date)}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-800 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-800 flex-shrink-0" />
                        {event.startTime} — {event.endTime}
                      </div>
                    </div>

                    {/* Price + availability */}
                    {cheapest && (
                      <div className="flex items-center justify-between mb-4 pt-4 border-t border-red-900/20">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Desde</p>
                          <p className="text-lg font-cinzel text-orange-400">
                            {formatCurrency(cheapest.price, cheapest.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Disponibilidad</p>
                          <p className={`text-sm font-semibold ${
                            totalAvail <= 0 ? 'text-red-500' : totalAvail < 20 ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {totalAvail <= 0 ? 'Agotado' : `${totalAvail} tickets`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Get Tickets button */}
                    <button
                      onClick={() => cheapest && handleGetTickets(event, cheapest)}
                      disabled={!cheapest || totalAvail <= 0 || checkoutLoading === `${event.id}-${cheapest.id}`}
                      className="w-full py-2.5 rounded-lg border border-red-900/50 text-sm text-gray-400 hover:text-white hover:border-orange-700 hover:bg-orange-900/20 transition-all duration-300 font-cinzel tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {checkoutLoading === `${event.id}-${cheapest?.id}` ? (
                        <>
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          Redirigiendo...
                        </>
                      ) : totalAvail <= 0 ? (
                        'Agotado'
                      ) : (
                        <>
                          <Ticket className="w-4 h-4" />
                          Get Tickets
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-12 h-12 text-red-900/40 mx-auto mb-4" />
            <p className="text-gray-500">No hay eventos programados. Vuelve pronto.</p>
          </div>
        )}

        {/* Calendar CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <a
            href="/my-tickets"
            className="inline-flex items-center gap-2 px-6 py-3 border border-red-900/50 rounded-lg text-sm text-gray-400 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
          >
            <CalendarDays className="w-4 h-4" />
            Mis Tickets
          </a>
        </motion.div>
      </div>
    </section>
  )
}
