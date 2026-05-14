'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const registrar = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        // En cambio de versión, actualizar al activar
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.info('NearUs: nueva versión disponible')
            }
          })
        })
      } catch (err) {
        console.warn('NearUs SW no se pudo registrar:', err)
      }
    }

    // Esperar a load para no competir con render inicial
    if (document.readyState === 'complete') {
      registrar()
    } else {
      window.addEventListener('load', registrar, { once: true })
    }
  }, [])

  return null
}
