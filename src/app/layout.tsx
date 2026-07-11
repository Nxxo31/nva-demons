import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'NVA DEMONS — Electronic Music Collective',
  description: 'Desde las profundidades del desierto, traemos el sonido del infierno. Techno industrial, dark beats y una experiencia sensorial como ninguna.',
  openGraph: {
    title: 'NVA DEMONS',
    description: 'Electronic Music Collective — Infernal Desert Techno',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0a0000]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}