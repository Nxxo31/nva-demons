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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="font-cinzel text-lg font-bold fire-text">
              NVA DEMONS
            </span>
          </div>

          <div className="flex items-center gap-6">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Newsletter"
              className="px-3 py-2 bg-black/40 border border-red-900/30 rounded text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-orange-800 w-40"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-red-800 to-orange-600 text-white rounded text-xs font-bold hover:from-red-700 hover:to-orange-500 transition-all duration-300">
              Suscribir
            </button>
          </div>
        </div>

        <div className="section-divider mt-8 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-800">
          <p>© 2026 NVA DEMONS. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-500 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-gray-500 transition-colors">Términos y condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}