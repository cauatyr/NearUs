'use client'
import { useState } from 'react'
import { Navigation, Loader2, X } from 'lucide-react'
import { useUbicacion } from '@/lib/store'

// Franja discreta para las pantallas que dependen de la distancia (/inicio,
// /explorar). Aparece sólo cuando estamos usando el centro de la ciudad en vez
// de la ubicación real de la persona.
//
// No bloquea nada: el flujo bloqueante es FlujoUbicacion, y sólo la primera vez.
export default function AvisoUbicacionExacta({ className = '' }) {
  const { gpsConcedido, ciudad, estado, pedirUbicacion } = useUbicacion()
  const [oculto, setOculto] = useState(false)
  const [pidiendo, setPidiendo] = useState(false)

  if (gpsConcedido || oculto || !ciudad) return null

  const denegado = estado === 'denegada' || estado === 'no-soportada'

  const activar = async () => {
    setPidiendo(true)
    await pedirUbicacion(false)
    setPidiendo(false)
  }

  return (
    <div className={`bg-marca-500/10 border border-marca-500/25 rounded-2xl p-3 flex items-center gap-3 ${className}`}>
      <Navigation className="w-4 h-4 text-marca-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">
          {denegado ? 'Ubicación bloqueada en el navegador' : 'Distancias desde el centro de la ciudad'}
        </div>
        <div className="text-[11px] text-zinc-400 leading-snug">
          {denegado
            ? `Habilitá la ubicación para NearUs en tu navegador para ver qué tenés cerca de verdad.`
            : `Activá tu ubicación exacta para ver qué hay cerca tuyo en ${ciudad.nombre}.`}
        </div>
      </div>

      {!denegado && (
        <button
          onClick={activar}
          disabled={pidiendo}
          className="shrink-0 bg-marca-500 hover:bg-marca-600 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
        >
          {pidiendo && <Loader2 className="w-3 h-3 animate-spin" />}
          Activar
        </button>
      )}

      <button
        onClick={() => setOculto(true)}
        className="shrink-0 w-7 h-7 grid place-items-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition"
        aria-label="Ocultar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
