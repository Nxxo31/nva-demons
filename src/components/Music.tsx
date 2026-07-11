'use client'

import { Headphones, ExternalLink } from 'lucide-react'

const TRACKS = [
  { title: 'Burning Sands', genre: 'Dark Techno', duration: '6:24' },
  { title: 'Ritual I', genre: 'Industrial', duration: '5:48' },
  { title: 'Inferno', genre: 'Acid Techno', duration: '7:12' },
  { title: 'Desert Call', genre: 'Hypnotic', duration: '6:05' },
]

export default function Music() {
  return (
    <section id="music" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="reveal text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Música
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="reveal text-gray-500 max-w-xl mx-auto">
            Nuestros últimos lanzamientos
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Tracklist */}
          <div className="reveal space-y-2">
            {TRACKS.map((track, i) => (
              <div
                key={i}
                className="group flex items-center justify-between p-4 rounded-lg border border-red-900/20 hover:border-red-800/40 bg-black/30 hover:bg-red-950/20 transition-all duration-300 cursor-pointer"
                style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-red-900/30 flex items-center justify-center group-hover:border-orange-600 transition-colors">
                    <Headphones className="w-4 h-4 text-orange-600/70 group-hover:text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-600">{track.genre}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{track.duration}</span>
              </div>
            ))}
          </div>

          {/* Platform Links */}
          <div className="reveal flex flex-wrap justify-center gap-4 mt-10" style={{ transitionDelay: '0.8s' }}>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/30 rounded-lg text-xs text-gray-500 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
            >
              <ExternalLink className="w-3 h-3" />
              SoundCloud
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/30 rounded-lg text-xs text-gray-500 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
            >
              <ExternalLink className="w-3 h-3" />
              Spotify
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/30 rounded-lg text-xs text-gray-500 hover:text-orange-400 hover:border-orange-800 transition-all duration-300"
            >
              <ExternalLink className="w-3 h-3" />
              Bandcamp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}