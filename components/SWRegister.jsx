'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // En DESARROLLO no usamos service worker: cachea los chunks de Next (con hash
    // cambiante) y deja la app pegada en pantallas viejas ("Cargando NearUs…").
    // Además desregistramos cualquier SW y limpiamos caches que hayan quedado,
    // para auto-reparar el navegador sin tener que hacerlo a mano.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister())
      })
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
      }
      return
    }

    const registrar = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        // En cambio de versión, actualizar al activar
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
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
