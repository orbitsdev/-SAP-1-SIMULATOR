// src/lib/animation.ts
import { gsap } from 'gsap'
import { animationSpeed } from './settings'

const activeGlows = new Map<string, gsap.core.Timeline>()

export function loopMultipleComponentGlows(ids: string[]) {
  ids.forEach(id => {
    const el = document.getElementById(id)
    if (!el) return

    // Prevent duplicate glows
    if (activeGlows.has(id)) {
      activeGlows.get(id)?.kill()
      activeGlows.delete(id)
    }

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(el, {
      backgroundColor: '#fde047',
      boxShadow: '0 0 16px 6px rgba(253, 224, 71, 0.6)',
      duration: animationSpeed.value,
      ease: 'sine.inOut'
    }).to(el, {
      backgroundColor: '#86efac',
      boxShadow: '0 0 6px 2px rgba(253, 224, 71, 0.3)',
      duration: animationSpeed.value,
      ease: 'sine.inOut'
    })

    activeGlows.set(id, tl)
  })
}

export function stopSpecificGlows(ids: string[]) {
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return

      const tl = activeGlows.get(id)
      if (tl) {
        tl.kill()
        activeGlows.delete(id)
      }

      gsap.set(el, {
        backgroundColor: '',
        boxShadow: ''
      })
    })
  }

  export function stopAllComponentGlows() {
    activeGlows.forEach((tl, id) => {
      tl.kill()
      const el = document.getElementById(id)
      if (el) {
        gsap.set(el, {
          backgroundColor: '',
          boxShadow: ''
        })
      }
    })
    activeGlows.clear()
  }

export function stopComponentGlow(id: string) {
    const el = document.getElementById(id)
    if (!el) return

    const tl = activeGlows.get(id)
    if (tl) {
      tl.kill()
      activeGlows.delete(id)
    }

    // Reset visual style
    gsap.set(el, {
      backgroundColor: '',
      boxShadow: ''
    })
  }

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

    // 🔁 Pulse/Glow animation while moving
    const glowLoop = gsap.timeline({ repeat: -1, yoyo: true })
    glowLoop.to(labelEl, {
      backgroundColor: '#fde047',
      boxShadow: '0 0 20px 6px rgba(253, 224, 71, 0.6)',
      duration: 0.15,
      ease: 'sine.inOut'
    }).to(labelEl, {
      backgroundColor: '#fde047',
      boxShadow: '0 0 8px 2px rgba(253, 224, 71, 0.4)',
      duration: 0.15,
      ease: 'sine.inOut'
    })

    // 🚚 Movement animation
    const tl = gsap.timeline({
      onComplete: () => {
        glowLoop.kill()
        labelEl.innerText = ''
        gsap.set(labelEl, { opacity: 0 })
        onComplete?.()
      }
    })

    for (const point of rest) {
      tl.to(labelEl, {
        x: point.x,
        y: point.y,
        duration: animationSpeed.value,
        ease: 'power1.inOut'
      })
    }

    tl.to(labelEl, {
      opacity: 0,
      scale: 0.9,
      boxShadow: '0 0 0px 0px rgba(0,0,0,0)',
      duration: 0.5
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
