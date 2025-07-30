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

    const [start, ...rest] = path
    labelEl.innerText = text

    gsap.set(labelEl, {
      x: start.x,
      y: start.y,
      opacity: 1,
      scale: 1,
      color: '#ffffff',
      backgroundColor: '#2563eb',
      boxShadow: '0 0 10px 4px rgba(37, 99, 235, 0.5)',
      borderRadius: '4px',
      zIndex: 999
    })

    // 🔁 Flicker animation while moving
    const glowLoop = gsap.timeline({ repeat: -1, yoyo: true });

    glowLoop.to(labelEl, {
    //   scale: 1.2,
      backgroundColor: '#fde047', // yellow-300
      boxShadow: '0 0 20px 6px rgba(253, 224, 71, 0.6)', // bright yellow pulse
      duration: 0.08,
      ease: 'sine.inOut'
    }).to(labelEl, {
    //   scale: 1,
      backgroundColor: '#fde047',
      boxShadow: '0 0 8px 2px rgba(253, 224, 71, 0.4)',
      duration: 0.08,
      ease: 'sine.inOut'
    });





    // 📦 Move across the path
    const tl = gsap.timeline({
      onComplete: () => {
        glowLoop.kill() // 🔚 Stop glow loop
        labelEl.innerText = ''
        gsap.set(labelEl, { opacity: 0 })
        onComplete?.()
      }
    })

    for (const point of rest) {
      tl.to(labelEl, {
        x: point.x,
        y: point.y,
        duration: 0.8,
        ease: 'power1.inOut'
      })
    }

    // 🧨 Final fade out with smooth scale down
    tl.to(labelEl, {
      opacity: 0,
      scale: 0.9,
      boxShadow: '0 0 0px 0px rgba(0,0,0,0)',
      duration: 0.25
    })
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
