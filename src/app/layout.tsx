import type { Metadata } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nva-demons.vercel.app'),
  title: {
    default: 'NVA DEMONS — Electronic Music Collective',
    template: '%s | NVA DEMONS',
  },
  description: 'Desde las profundidades del desierto, traemos el sonido del infierno. Techno industrial, dark beats y una experiencia sensorial como ninguna.',
  keywords: ['techno', 'electronic music', 'desert', 'infernal', 'NVA Demons', 'Tatacoa', 'dark beats', 'industrial'],
  authors: [{ name: 'NVA Demons' }],
  openGraph: {
    title: 'NVA DEMONS — Electronic Music Collective',
    description: 'Infernal Desert Techno — from the depths of Tatacoa',
    type: 'website',
    locale: 'es_CO',
    siteName: 'NVA DEMONS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NVA DEMONS',
    description: 'Infernal Desert Techno — from the depths of Tatacoa',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'NVA DEMONS',
  description: 'Electronic Music Collective — Infernal Desert Techno from Tatacoa',
  genre: ['Techno', 'Industrial', 'Electronic'],
  sameAs: ['https://github.com/Nxxo31/nva-demons'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`dark ${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#0a0000] font-inter">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
