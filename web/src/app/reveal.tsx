'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fades and slides its children up into view the first time they scroll into
 * the viewport. Pure animation, no layout effect either way, so it degrades
 * safely: a `motion-reduce` guard turns it off for anyone who asked for less
 * motion, and the `<noscript>` override in page.tsx shows everything for
 * anyone without JavaScript (this component never even mounts for them).
 */
export const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`reveal-target motion-reduce:opacity-100! motion-reduce:translate-y-0! transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
