'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el mensaje");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Contacto
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto">
            Reservaciones, booking, o simplemente decir hola
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-300">Email</p>
                <p className="text-sm text-gray-400">contacto@nvademons.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-300">Ubicación</p>
                <p className="text-sm text-gray-400">Bogotá / Desierto de la Tatacoa</p>
              </div>
            </div>
            <div className="pt-6">
              <p className="text-xs text-gray-300 leading-relaxed">
                Para booking, colaboraciones o consultas generales,
                escríbenos y te responderemos a la brevedad.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-800 transition-colors"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-800 transition-colors"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Asunto"
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-800 transition-colors"
              required
            />
            <textarea
              name="message"
              placeholder="Mensaje"
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-800 transition-colors resize-none"
              required
            />
            <motion.button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-800 to-orange-600 text-white rounded-lg text-sm font-cinzel tracking-wider hover:from-red-700 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-red-900/30"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Enviando..." : sent ? "✅ Mensaje enviado" : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensaje
                </>
              )}
            </motion.button>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                {error}
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}