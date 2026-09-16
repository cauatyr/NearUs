'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Navigation, Loader2, MapPin, Check, AlertTriangle } from 'lucide-react'
import { detectarCiudad } from '@/lib/data/ciudades'

const MapaPin = dynamic(() => import('@/components/MapaPin'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-2xl bg-white/5 animate-pulse" />
})

// Selector de ubicación exacta: mapa con pin arrastrable + "usar mi ubicación
// actual" (GPS de alta precisión) + confirmación explícita.
//
// Muestra en qué ciudad de NearUs cae el punto: si cae fuera del radio de toda
// ciudad activa, el negocio no le aparece a NADIE, así que avisa antes de
// guardar en vez de dejar el negocio invisible.
//
// props:
//   lat, lng     coordenadas actuales (o null)
//   onCambio     (lat, lng) => void
//   confirmada   bool — el usuario ya dijo "sí, es acá"
//   onConfirmar  (bool) => void
export default function SelectorUbicacion({ lat, lng, onCambio, confirmada, onConfirmar }) {
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState(null)
  const [precision, setPrecision] = useState(null)

  const hayPin = typeof lat === 'number' && typeof lng === 'number'
  const ciudad = hayPin ? detectarCiudad(lat, lng) : null

  const cambiar = (nuevaLat, nuevaLng, precisionM = null) => {
    setPrecision(precisionM)
    onConfirmar(false) // mover el pin invalida la confirmación anterior
    onCambio(nuevaLat, nuevaLng)
  }

  const usarMiUbicacion = () => {
    setError(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Tu navegador no permite geolocalización. Marcá el pin a mano.')
      return
    }
    setBuscando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false)
        cambiar(pos.coords.latitude, pos.coords.longitude, Math.round(pos.coords.accuracy))
      },
      (err) => {
        setBuscando(false)
        setError(
          err && err.code === 1
            ? 'Permiso de ubicación denegado. Marcá el pin a mano en el mapa.'
            : 'No pudimos obtener tu ubicación. Marcá el pin a mano.'
        )
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={usarMiUbicacion}
        disabled={buscando}
        className="w-full flex items-center justify-center gap-2 bg-marca-500/10 hover:bg-marca-500/20 disabled:opacity-60 text-marca-300 font-medium py-3 rounded-2xl border border-marca-500/25 transition"
      >
        {buscando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Buscando tu ubicación…
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" /> Usar mi ubicación actual
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-3">
        <MapaPin lat={lat} lng={lng} onCambio={(la, ln) => cambiar(la, ln)} />
      </div>

      {hayPin && (
        <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 text-sm text-white">
            <MapPin className="w-4 h-4 text-marca-500 shrink-0" />
            <span className="tabular-nums">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
            {precision != null && (
              <span className="text-xs text-zinc-400">· precisión ±{precision} m</span>
            )}
          </div>

          <div className="mt-2 text-xs">
            {ciudad ? (
              <span className="text-zinc-300">
                Cae en <strong className="text-white">{ciudad.nombre}</strong>, {ciudad.pais}.
              </span>
            ) : (
              <span className="flex items-start gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Este punto está fuera del radio de todas las ciudades activas: el negocio no le
                aparecería a ningún cliente hasta activar esa ciudad.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onConfirmar(!confirmada)}
            className={`mt-3 w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 rounded-xl transition ${
              confirmada
                ? 'bg-acento-500 text-white'
                : 'bg-white/10 hover:bg-white/15 text-zinc-100'
            }`}
          >
            <Check className="w-4 h-4" />
            {confirmada ? 'Ubicación confirmada' : 'Confirmar esta ubicación'}
          </button>
        </div>
      )}
    </div>
  )
}
