'use client'

import { CalendarDays, MapPin, Clock, Flame } from 'lucide-react'

const EVENTS = [
  {
    date: '15 AGO 2026',
    title: 'NVA DEMONS: RITUAL I',
    venue: 'Desierto de Sonora',
    time: '22:00 - 06:00',
    status: 'Próximamente',
    featured: true,
  },
  {
    date: '12 SEP 2026',
    title: 'INFERNO NIGHTS VOL.3',
    venue: 'Club Industrial, CDMX',
    time: '23:00 - 05:00',
    status: 'Próximamente',
    featured: false,
  },
  {
    date: '31 OCT 2026',
    title: 'HALLOWEEN: RITUAL II',
    venue: 'Templo del Fuego, GDL',
    time: '21:00 - 07:00',
    status: 'Próximamente',
    featured: false,
  },
]

export default function Events() {
  return (
    <section id="events" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="reveal text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Próximos Eventos
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="reveal text-gray-500 max-w-xl mx-auto">
            Fechas, lugares y rituales programados
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {EVENTS.map((event, i) => (
            <div
              key={i}
              className="reveal group relative overflow-hidden rounded-xl glow-border bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-500"
              style={{ transitionDelay: `${0.2 + i * 0.15}s` }}
            >
              {event.featured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-800 to-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Flame className="w-3 h-3" />
                  Destacado
                </div>
              )}

              <div className="p-6">
                {/* Date Badge */}
                <div className="inline-block px-3 py-1 border border-red-900/50 rounded text-xs font-cinzel text-orange-400 mb-4">
                  {event.date}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-800" />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-800" />
                    {event.time}
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-lg border border-red-900/50 text-sm text-gray-400 hover:text-white hover:border-orange-700 hover:bg-orange-900/20 transition-all duration-300 font-cinzel tracking-wider">
                  {event.status}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar CTA */}
        <div className="reveal text-center mt-12" style={{ transitionDelay: '0.8s' }}>
          <a
            href="#tickets"
            className="inline-flex items-center gap-2 px-6 py-3 border border-red-900/50 rounded-lg text-sm text-gray-400 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
          >
            <CalendarDays className="w-4 h-4" />
            Ver calendario completo
          </a>
        </div>
      </div>
    </section>
  )
}