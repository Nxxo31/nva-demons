'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}

/**
 * Scroll-triggered reveal animation using Framer Motion.
 * Replaces the old CSS `.reveal` class with buttery spring animations.
 */
export default function Reveal({ children, delay = 0, y = 30, className = '' }: RevealProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
