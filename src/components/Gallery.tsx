'use client'

export default function Gallery() {
  const images = [1, 2, 3, 4, 5, 6]

  return (
    <section id="gallery" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="reveal text-3xl md:text-5xl font-cinzel font-bold fire-text mb-4">
            Galería
          </h2>
          <div className="section-divider max-w-xs mx-auto mb-4" />
          <p className="reveal text-gray-500 max-w-xl mx-auto">
            Momentos de nuestros rituales pasados
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((_, i) => (
            <div
              key={i}
              className="reveal aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-red-950/40 to-black/60 border border-red-900/20 hover:border-red-800/50 transition-all duration-500 group"
              style={{
                transitionDelay: `${i * 0.1}s`,
                gridRow: i === 0 ? 'span 2' : undefined,
              }}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Placeholder with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-full border border-red-900/30 flex items-center justify-center mb-2 group-hover:border-orange-700 transition-colors">
                    <svg className="w-6 h-6 text-red-800/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-700 font-cinzel">FOTO {i + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}