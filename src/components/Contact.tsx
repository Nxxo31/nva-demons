'use client'

import { useState } from 'react'
import { Send, Mail, MapPin } from 'lucide-react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section id="contact" className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="reveal text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Contacto
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="reveal text-gray-500 max-w-xl mx-auto">
            Reservaciones, booking, o simplemente decir hola
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Info */}
          <div className="reveal space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-300">Email</p>
                <p className="text-sm text-gray-600">contacto@nvademons.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-300">Ubicación</p>
                <p className="text-sm text-gray-600">CDMX / Desierto de Sonora</p>
              </div>
            </div>
            <div className="pt-6">
              <p className="text-xs text-gray-700 leading-relaxed">
                Para booking, colaboraciones o consultas generales, 
                escríbenos y te responderemos a la brevedad.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="reveal space-y-4"
            style={{ transitionDelay: '0.3s' }}
          >
            <input
              type="text"
              placeholder="Nombre"
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-orange-800 transition-colors"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-orange-800 transition-colors"
              required
            />
            <textarea
              placeholder="Mensaje"
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-orange-800 transition-colors resize-none"
              required
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-800 to-orange-600 text-white rounded-lg text-sm font-cinzel tracking-wider hover:from-red-700 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-red-900/30"
            >
              {sent ? (
                '✅ Mensaje enviado'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensaje
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}