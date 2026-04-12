// src/components/visual-editor/hooks/use-scroll-animation.ts
"use client"

import { useEffect, useRef } from "react"
import type { AnimationConfig } from "@/lib/visual-editor/types"

/**
 * Attaches scroll-triggered animation behaviour to an element.
 *
 * - If `trigger === "on-load"` the animation class is applied immediately
 *   (after the optional delay).
 * - If `trigger === "on-scroll"` an IntersectionObserver fires the animation
 *   when the element enters the viewport.
 *
 * Both the editor canvas and the public site renderer use this hook.
 */
export function useScrollAnimation(animation: AnimationConfig | undefined) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !animation || animation.type === "none") return

    const animClass = `ve-animate-${animation.type}`
    el.classList.add(animClass)

    if (animation.trigger === "on-load") {
      const timer = setTimeout(() => {
        // nothing extra needed — CSS runs immediately
      }, animation.delay)
      return () => clearTimeout(timer)
    }

    // on-scroll: pause until visible
    el.classList.add("ve-animate-paused")

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const delay = animation.delay
            if (delay > 0) {
              setTimeout(() => target.classList.add("ve-animate-active"), delay)
            } else {
              target.classList.add("ve-animate-active")
            }
            observer.unobserve(target)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      el.classList.remove(animClass, "ve-animate-paused", "ve-animate-active")
    }
  }, [animation])

  return ref
}
