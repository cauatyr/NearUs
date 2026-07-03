'use client'
import { useEffect, useRef, useState } from 'react'
import { BellRing, X, CalendarClock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSesion } from '@/lib/store-sesion'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD, TZ_CUENCA } from '@/lib/utils'

// Escucha en tiempo real las reservas NUEVAS del negocio del dueño logado y
// le avisa: toast in-app + notificación nativa del navegador + beep.
// Gancho para WhatsApp/push offline: cuando haya proveedor, disparar aquí en
// el mismo punto donde se crea el `aviso` (ver comentario más abajo).
export default function AvisoReservasNegocio() {
  const negocioId = useSesion((s) => s.negocioId)
  const servicios = useDatosStore((s) => s.servicios)
  const [avisos, setAvisos] = useState([])
  const [permiso, setPermiso] = useState('default')
  const serviciosRef = useRef(servicios)
  serviciosRef.current = servicios

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermiso(Notification.permission)
    }
  }, [])

  const pedirPermiso = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    try {
      const p = await Notification.requestPermission()
      setPermiso(p)
    } catch {}
  }

  const cerrar = (id) => setAvisos((prev) => prev.filter((a) => a.id !== id))

  useEffect(() => {
    if (!negocioId) return

    const canal = supabase
      .channel(`avisos-reservas-${negocioId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservas', filter: `negocio_id=eq.${negocioId}` },
        (payload) => {
          const r = payload.new
          const servicio = serviciosRef.current.find((s) => s.id === r.servicio_id)
          const aviso = {
            id: r.id,
            cliente: r.cliente_nombre || 'Cliente',
            servicio: servicio?.nombre || 'Reserva',
            fecha: r.fecha,
            precio: Number(r.precio) || 0
          }

          // 1) Toast in-app (máx 4 en pantalla, auto-cierre en 12s)
          setAvisos((prev) => [aviso, ...prev].slice(0, 4))
          setTimeout(() => cerrar(aviso.id), 12000)

          // 2) Notificación nativa del navegador (si el dueño dio permiso)
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Nueva reserva en NearUs 🎉', {
                body: `${aviso.cliente} · ${aviso.servicio}`,
                tag: aviso.id,
                icon: '/logo.jpeg'
              })
            } catch {}
          }

          // 3) Beep suave
          reproducirBeep()

          // 4) [GANCHO WhatsApp/push offline] — cuando haya proveedor (UazAPI/
          //    Twilio/web-push con VAPID), disparar el envío aquí con `aviso`.
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [negocioId])

  const formatoFecha = (iso) => {
    try {
      return new Date(iso).toLocaleString('es-EC', {
        timeZone: TZ_CUENCA,
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  return (
    <>
      {/* Pastilla para activar los avisos del navegador (solo si no está concedido) */}
      {permiso === 'default' && (
        <button
          onClick={pedirPermiso}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-marca-500 hover:bg-marca-600 text-white text-xs font-medium px-3.5 py-2.5 rounded-full shadow-flotante"
        >
          <BellRing className="w-4 h-4" /> Activar avisos de reservas
        </button>
      )}

      {/* Stack de toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,22rem)]">
        {avisos.map((a) => (
          <div
            key={a.id}
            className="bg-nocturno-400 border border-marca-500/30 rounded-2xl shadow-flotante p-4 animate-in slide-in-from-top-2 fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-marca-500/20 grid place-items-center">
                <BellRing className="w-4 h-4 text-marca-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">¡Nueva reserva! 🎉</div>
                <div className="mt-1 text-xs text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-400" /> {a.cliente}
                </div>
                <div className="mt-0.5 text-xs text-zinc-300 truncate">{a.servicio}</div>
                <div className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1.5">
                  <CalendarClock className="w-3 h-3" /> {formatoFecha(a.fecha)}
                  {a.precio > 0 && <span className="text-acento-500 font-medium">· {formatoUSD(a.precio)}</span>}
                </div>
              </div>
              <button
                onClick={() => cerrar(a.id)}
                className="shrink-0 w-7 h-7 rounded-full hover:bg-white/10 grid place-items-center text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// Beep corto vía WebAudio (best-effort; si el navegador bloquea el audio, no pasa nada)
function reproducirBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.start()
    osc.stop(ctx.currentTime + 0.36)
    osc.onended = () => ctx.close()
  } catch {}
}
