'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Ticket, Check, Users, Loader2 } from 'lucide-react'
import { HiTicket, HiOrder } from '@/types/hiEvents'
import { formatCurrency, formatDate } from '@/lib/ticketApi'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<HiTicket[]>([])
  const [orders, setOrders] = useState<HiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch tickets (you could also fetch orders and join them server-side)
      const resTickets = await fetch('/api/events/user-tickets', { cache: 'no-store' })
      if (!resTickets.ok) throw new Error(`Failed to fetch tickets: ${resTickets.status}`)
      const ticketsData = await resTickets.json()
      
      // For demo: fetch all events to enrich ticket data
      const resEvents = await fetch('/api/events', { cache: 'no-store' })
      if (!resEvents.ok) throw new Error(`Failed to fetch events: ${resEvents.status}`)
      const eventsData = await resEvents.json()
      const eventsMap = new Map(eventsData.events.map((e: any) => [e.id, e]))

      // Simple demo: we'll treat all fetched tickets as user's tickets
      // In a real app, the /api/events/user-tickets endpoint would require auth
      setTickets(ticketsData.tickets || [])
      setOrders([]) // placeholder - implement orders endpoint if needed
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('No se pudieron cargar tus tickets. Intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  function formatTicketDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <section id="my-tickets" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
              Mis Tickets
            </h2>
            <div className="section-divider max-w-xs mx-auto mb-4" />
            <p className="text-gray-500 max-w-xl mx-auto">
              Tus compras y accesos a eventos
            </p>
          </motion.div>

          <div className="text-center py-12">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-500">Cargando tus tickets...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="my-tickets" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
              Mis Tickets
            </h2>
            <div className="section-divider max-w-xs mx-auto mb-4" />
            <p className="text-gray-500 max-w-xl mx-auto">
              Tus compras y accesos a eventos
            </p>
          </motion.div>

          <div className="text-center py-12">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={fetchUserData}
              className="px-6 py-3 rounded-lg font-cinzel text-sm tracking-wider bg-gradient-to-r from-red-800 to-orange-600 text-white hover:from-red-700 hover:to-orange-500 transition-all duration-300"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="my-tickets" className="relative py-24 px-4">
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
            Mis Tickets
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Tus compras y accesos a eventos
          </p>
        </motion.div>

        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-30px' }}
          >
            {tickets.map((ticket) => {
              // Find event for this ticket (simplified lookup)
              const eventId = ticket.eventId
              // In a real app, you'd fetch event details from ticket data or include in API response
              return (
                <motion.div
                  key={ticket.id}
                  variants={item}
                  whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                  className="relative rounded-xl border border-red-900/20 overflow-hidden transition-all duration-400 bg-black/50 hover:bg-black/60"
                >
                  {/* Ticket badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-900/50 text-[10px] font-cinzel uppercase rounded">
                    <Ticket className="w-3 h-3" />
                    Ticket
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white">Evento #${ticket.eventId.slice(
                        0,
                        6
                      )}...</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Compra: {formatTicketDate(ticket.purchaseDate)}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <span>{ticket.purchaserName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-orange-500" />
                        <span>Ticket ID: {ticket.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>
                          Estado:{" "}
                          <span className="text-green-500 font-medium">{ticket.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* QR Code placeholder */}
                    <div className="mt-6">
                      <div className="w-24 h-24 bg-red-900/20 rounded flex items-center justify-center mx-auto mb-2">
                        {ticket.qrCode ? (
                          <div className="text-[10px] text-red-600 monospace">{ticket.qrCode.slice(0, 4)}...</div>
                        ) : (
                          <div className="text-xs text-gray-500">QR Code</div>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        Escanea para ingresar al evento
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-red-900/40 mx-auto mb-4" />
            <p className="text-gray-500">
              Aún no tienes tickets comprados. ¡Visita la sección de eventos para
              asegurar tu lugar!
            </p>
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <a
                href="/#tickets"
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/50 rounded text-xs font-cinzel uppercase tracking-wider text-gray-400 hover:text-white hover:border-orange-700 transition-all duration-300"
              >
                Ver Eventos
              </a>
            </motion.div>
          </div>
        )}

        {/* Empty state when loading succeeded but no data */}
        {tickets.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-red-900/40 mx-auto mb-4" />
            <p className="text-gray-500">
              No se encontraron tickets asociados a tu cuenta. Los tickets se
              mostrarán aquí después de completar una compra.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
