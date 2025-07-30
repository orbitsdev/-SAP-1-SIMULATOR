// src/lib/animation.ts
import { gsap } from 'gsap'
export function animateMovingText(
    labelId: string,
    path: { x: number; y: number }[],
    text: string,
    onComplete?: () => void
  ) {
    const labelEl = document.getElementById(labelId) as HTMLElement
    if (!labelEl) return

    // Set initial position
    const [start, ...rest] = path
    labelEl.innerText = text
    gsap.set(labelEl, { x: start.x, y: start.y })

    const tl = gsap.timeline({
      onComplete: () => {
        labelEl.innerText = ''
        onComplete?.()
      }
    })

    for (const point of rest) {
      tl.to(labelEl, {
        x: point.x,
        y: point.y,
        duration: 1.5,
        ease: 'power2.inOut'
      })
    }
  }


export function highlightComponent(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  gsap.set(el, { backgroundColor: '#86efac' })
  gsap.timeline()
    .to(el, { backgroundColor: '#fde047', duration: 0.3 })
    .to(el, { backgroundColor: '#86efac', duration: 0.6, delay: 0.2 })
}
export function animateHighlightAndGlow(id: string) {
    const el = document.getElementById(id)
    if (!el) return

    gsap.timeline()
      .to(el, {
        backgroundColor: '#fde047', // yellow-300
        boxShadow: '0 0 20px 8px rgba(253, 224, 71, 0.6)', // soft yellow glow
        duration: 0.4,
        ease: 'power2.out'
      })
      .to(el, {
        backgroundColor: '#86efac', // green-300
        boxShadow: '0 0 0px 0px rgba(253, 224, 71, 0.2)', // fades out smoothly
        duration: 0.6,
        ease: 'power2.in',
        delay: 0.3
      })
  }
