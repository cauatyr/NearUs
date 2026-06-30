'use client'
import { useEffect, useState } from 'react'
import { MapPin, Navigation, ChevronRight, Globe2, Loader2 } from 'lucide-react'
import { useUbicacion } from '@/lib/store'
import { ciudadesActivas } from '@/lib/data/ciudades'

// Overlay que resuelve la ubicación del usuario al entrar:
//   1) Soft-prompt amable ("¿permitir ubicación?")
//   2) Permiso real del navegador
//   3) Si lo niega / está fuera de cobertura → selector de ciudad manual
// Cierra solo cuando hay una ciudad activa (estado 'concedida').
export default function FlujoUbicacion() {
  const { estado, ciudad, pedirUbicacion, elegirCiudad } = useUbicacion()
  const [montado, setMontado] = useState(false)
  const [vista, setVista] = useState('auto') // 'auto' | 'selector'

  useEffect(() => {
    setMontado(true)
  }, [])

  // Al montar por primera vez: si ya sabemos el estado del permiso, lo usamos
  // sin molestar. 'granted' o 'denied' → resolvemos en silencio (no abre prompt
  // nativo). Solo 'prompt'/desconocido deja el soft-prompt visible.
  useEffect(() => {
    if (!montado) return
    if (useUbicacion.getState().estado !== 'idle') return
    if (useUbicacion.getState().ciudad) return

    let cancelado = false
    const permisos = typeof navigator !== 'undefined' ? navigator.permissions : null
    if (permisos && permisos.query) {
      permisos
        .query({ name: 'geolocation' })
        .then((res) => {
          if (cancelado) return
          if (res.state === 'granted' || res.state === 'denied') {
            pedirUbicacion(true) // silencioso: granted resuelve ciudad, denied → 'denegada'
          }
        })
        .catch(() => {})
    }
    return () => {
      cancelado = true
    }
  }, [montado, pedirUbicacion])

  if (!montado) return null
  if (estado === 'concedida') return null // ya hay ciudad → nada que mostrar

  const mostrarSelector =
    vista === 'selector' ||
    estado === 'denegada' ||
    estado === 'no-soportada' ||
    estado === 'fuera-cobertura' ||
    (estado === 'idle' && !!ciudad) // re-apertura para cambiar de ciudad

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-nocturno-500 rounded-3xl shadow-flotante overflow-hidden">
        {estado === 'pidiendo' ? (
          <Pidiendo />
        ) : mostrarSelector ? (
          <SelectorCiudad
            motivo={estado}
            onElegir={(c) => elegirCiudad(c)}
          />
        ) : (
          <SoftPrompt
            onPermitir={() => pedirUbicacion(false)}
            onManual={() => setVista('selector')}
          />
        )}
      </div>
    </div>
  )
}

function SoftPrompt({ onPermitir, onManual }) {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-marca-500/10 grid place-items-center text-marca-500">
        <Navigation className="w-8 h-8" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">¿Dónde te mostramos?</h2>
      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
        NearUs usa tu ubicación para abrir el mapa en tu ciudad y mostrarte los
        negocios cerca de ti. No la compartimos con nadie.
      </p>

      <button
        onClick={onPermitir}
        className="mt-5 w-full bg-marca-500 hover:bg-marca-600 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-marca"
      >
        <MapPin className="w-5 h-5" /> Permitir mi ubicación
      </button>
      <button
        onClick={onManual}
        className="mt-2 w-full text-zinc-300 hover:text-white font-medium py-3 rounded-2xl transition text-sm"
      >
        Elegir mi ciudad a mano
      </button>
    </div>
  )
}

function Pidiendo() {
  return (
    <div className="p-10 text-center">
      <Loader2 className="w-10 h-10 mx-auto text-marca-500 animate-spin" />
      <h2 className="mt-4 text-lg font-bold text-white">Buscando tu ubicación…</h2>
      <p className="mt-1 text-sm text-zinc-400">Acepta el permiso del navegador.</p>
    </div>
  )
}

function SelectorCiudad({ motivo, onElegir }) {
  const ciudades = ciudadesActivas()

  const encabezado =
    motivo === 'fuera-cobertura'
      ? {
          titulo: 'Todavía no llegamos a tu zona',
          texto:
            'NearUs aún no opera donde estás. Mientras tanto, podés explorar una de nuestras ciudades:'
        }
      : motivo === 'denegada'
      ? {
          titulo: 'Elegí tu ciudad',
          texto:
            'Sin tu ubicación no podemos detectarla automáticamente. Elegí dónde querés explorar:'
        }
      : {
          titulo: 'Elegí tu ciudad',
          texto: 'Seleccioná dónde querés ver los negocios de NearUs:'
        }

  return (
    <div className="p-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-marca-500/10 grid place-items-center text-marca-500">
        <Globe2 className="w-7 h-7" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white text-center">
        {encabezado.titulo}
      </h2>
      <p className="mt-2 text-sm text-zinc-300 text-center leading-relaxed">
        {encabezado.texto}
      </p>

      <div className="mt-5 space-y-2">
        {ciudades.map((c) => (
          <button
            key={c.id}
            onClick={() => onElegir(c)}
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-marca-500/10 border border-white/10 hover:border-marca-200 rounded-2xl p-3.5 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-nocturno-500 grid place-items-center text-marca-500 shadow-sm shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white leading-tight">{c.nombre}</div>
              <div className="text-xs text-zinc-400">{c.pais}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-marca-500 transition" />
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-400">
        Estamos sumando más ciudades pronto.
      </p>
    </div>
  )
}
