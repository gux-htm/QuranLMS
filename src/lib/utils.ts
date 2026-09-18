import { useEffect, useRef, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "Ahmed Malik" → "AM" */
export function initialsOf(name: string) {
  if (!name || !name.trim()) return '??'
  return name
    .trim()
    .split(' ')
    .filter(p => p.length > 0)
    .map((p) => p[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('')
    || '?'
}

/** Returns current window.scrollY, updated on scroll. */
export function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return y
}

/** Returns true once the element enters the viewport (fires once, then disconnects). */
export function useInView(
  ref: React.RefObject<HTMLDivElement | HTMLElement | null>,
  threshold = 0.15,
) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

