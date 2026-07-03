'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Zap, MapPin, Clock, Star, ArrowRight, Check, X,
  Scissors, BadgeAlert, Hand, Sparkles, Flower2, Wand2, Palette, HandHelping
} from 'lucide-react'
import { useNegocios, serviciosDeNegocio } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { useReservas, useUbicacion } from '@/lib/store'
import { distanciaKm, formatoDistancia, formatoUSD } from '@/lib/utils'

const MapaBusqueda = dynamic(() => import('@/components/MapaBusqueda'), {
  ssr: false,
  loading: () => <div className="w-full h-full skeleton" />
})

const ICONOS = { Scissors, BadgeAlert, Hand, Sparkles, Flower2, Wand2, Palette, HandHelping }

export default function AhoraPage() {
  const router = useRouter()
  const { posicion } = useUbicacion()
  const { crearReserva } = useReservas()
  const NEGOCIOS = useNegocios()
  const [categoria, setCategoria] = useState('barberia')
  const [estado, setEstado] = useState('inicial') // inicial | buscando | viajando | encontrado
  const [negocioElegido, setNegocioElegido] = useState(null)

  const disponibles = useMemo(() => {
    return NEGOCIOS.filter((n) => n.aceptaAhora && n.categoria === categoria)
      .map((n) => ({ ...n, _dist: distanciaKm(posicion.lat, posicion.lng, n.lat, n.lng) }))
      .sort((a, b) => a._dist - b._dist)
  }, [NEGOCIOS, categoria, posicion])

  const buscar = () => {
    setEstado('buscando')
    setTimeout(() => {
      if (disponibles.length > 0) {
        setNegocioElegido(disponibles[0])
        setEstado('viajando')
      } else {
        setEstado('inicial')
      }
    }, 2400)
  }

  const reiniciar = () => {
    setNegocioElegido(null)
    setEstado('inicial')
  }

  const confirmar = () => {
    const servicio = serviciosDeNegocio(negocioElegido.id)[0]
    const ahora = new Date()
    const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String((Math.ceil(ahora.getMinutes() / 15) * 15) % 60).padStart(2, '0')}`
    const reserva = crearReserva({
      negocioId: negocioElegido.id,
      servicioId: servicio.id,
      empleadoId: 'cualquiera',
      fecha: ahora.toISOString(),
      hora: hora === '00:00' ? '14:00' : hora,
      modo: 'ahora'
    })
    try { sessionStorage.setItem('nearus-celebrar', reserva.id) } catch (_) {}
    router.push(`/confirmacion/${reserva.id}`)
  }

  const enMapa = estado !== 'inicial'
  const destinoMapa = estado === 'viajando' || estado === 'encontrado' ? negocioElegido : null

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] pb-24">
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-72"
        style={{ background: 'radial-gradient(130% 80% at 50% 0%, rgba(245,158,11,0.14), rgba(43,172,226,0.05) 45%, transparent 65%)' }}
      />

      {/* ===== INICIAL ===== */}
      {estado === 'inicial' && (
        <div className="relative px-5 pt-10">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ring-amber-500/20">
            <Zap className="w-3 h-3 fill-amber-400" /> Modo on-demand
          </span>
          <h1 className="mt-4 text-[2rem] font-extrabold text-white leading-[1.1]">
            Un servicio,
            <br />
            <span className="text-marca-500">ahora mismo</span>.
          </h1>
          <p className="mt-2.5 text-zinc-400 text-sm max-w-xs">
            Te conectamos al instante con el negocio disponible más cercano a ti.
          </p>

          <h3 className="mt-8 text-xs font-bold text-zinc-300 uppercase tracking-wide">¿Qué necesitas?</h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {CATEGORIAS.slice(0, 6).map((c) => {
              const Icono = ICONOS[c.icono] || Sparkles
              const activo = categoria === c.id
              const cuantos = NEGOCIOS.filter((n) => n.aceptaAhora && n.categoria === c.id).length
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoria(c.id)}
                  className={`relative p-4 rounded-2xl border text-left transition active:scale-[0.98] ${
                    activo
                      ? 'bg-nocturno-500 border-marca-500 ring-1 ring-marca-500/40'
                      : 'bg-nocturno-500/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center"
                    style={{ backgroundColor: `${c.color}22`, color: c.color }}
                  >
                    <Icono className="w-5 h-5" />
                  </div>
                  <div className="mt-3 font-semibold text-white text-sm">{c.nombre}</div>
                  <div className="text-[11px] text-zinc-500">
                    {cuantos} {cuantos === 1 ? 'disponible' : 'disponibles'}
                  </div>
                  {activo && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-marca-500 grid place-items-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {disponibles.length > 0 ? (
            <p className="mt-6 text-center text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acento-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-acento-500" />
                </span>
                <strong className="text-white">{disponibles.length}</strong> cerca de ti ahora mismo
              </span>
            </p>
          ) : (
            <p className="mt-6 text-center text-xs text-zinc-500">
              No hay negocios disponibles ahora en esta categoría. Prueba otra.
            </p>
          )}
        </div>
      )}

      {/* CTA dominante (solo en inicial) */}
      {estado === 'inicial' && (
        <div
          className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto px-4 pt-3 pb-3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent"
          style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
        >
          <button
            onClick={buscar}
            disabled={disponibles.length === 0}
            className="w-full bg-marca-500 hover:bg-marca-600 active:scale-[0.98] disabled:bg-white/10 disabled:text-zinc-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition shadow-marca"
          >
            <Zap className="w-5 h-5 fill-white" />
            Buscar atención inmediata
          </button>
        </div>
      )}

      {/* ===== MAPA DE FONDO (buscando / viajando / encontrado) ===== */}
      {enMapa && (
        <div className="fixed inset-0 z-40">
          <MapaBusqueda
            usuario={posicion}
            negocios={estado === 'buscando' ? disponibles : []}
            destino={destinoMapa}
            onLlegada={() => setEstado('encontrado')}
          />

          {/* Cerrar */}
          <button
            onClick={reiniciar}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/55 backdrop-blur grid place-items-center text-white hover:bg-black/70"
            aria-label="Cancelar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Buscando: radar */}
          {estado === 'buscando' && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 bg-marca-500/20 rounded-full animate-ping" />
                <div className="absolute inset-6 bg-marca-500/25 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-16 h-16 rounded-full bg-marca-500 grid place-items-center shadow-marca">
                    <Zap className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-white">Buscando cerca de ti…</h3>
              <p className="mt-2 text-sm text-zinc-300 max-w-xs">
                Confirmando disponibilidad en tiempo real con los negocios más cercanos.
              </p>
            </div>
          )}

          {/* Viajando: pill superior */}
          {estado === 'viajando' && negocioElegido && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-nocturno-500/95 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-flotante max-w-[80%]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marca-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-marca-500" />
              </span>
              <span className="text-sm font-semibold text-white truncate">
                Yendo a {negocioElegido.nombre}…
              </span>
            </div>
          )}

          {/* Encontrado: bottom sheet */}
          {estado === 'encontrado' && negocioElegido && (
            <div className="absolute inset-x-0 bottom-0 z-10 max-w-md mx-auto animate-slide-up">
              <div
                className="bg-nocturno-500 rounded-t-3xl border-t border-white/10 shadow-flotante p-5"
                style={{ paddingBottom: 'calc(1.25rem + var(--safe-bottom))' }}
              >
                <div className="flex justify-center pb-2.5">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="flex items-center gap-2 text-acento-500 text-xs font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acento-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-acento-500" />
                  </span>
                  ¡Te puede atender ahora!
                </div>

                <h2 className="mt-2 text-xl font-bold text-white">{negocioElegido.nombre}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <strong>{negocioElegido.rating ?? 'Nuevo'}</strong>
                  <span className="text-zinc-500">·</span>
                  <span>{negocioElegido.barrio}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <Stat icono={MapPin} valor={formatoDistancia(negocioElegido._dist)} label="Distancia" />
                  <Stat icono={Clock} valor="~5 min" label="En camino" />
                  <Stat icono={Zap} valor="Libre" label="Ahora" />
                </div>

                <div className="mt-4 bg-white/5 rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">Primer servicio disponible</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm font-medium text-white">
                      {serviciosDeNegocio(negocioElegido.id)[0]?.nombre}
                    </div>
                    <div className="font-bold text-white">
                      {formatoUSD(serviciosDeNegocio(negocioElegido.id)[0]?.precio || 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_1.6fr] gap-2">
                  <button
                    onClick={reiniciar}
                    className="bg-nocturno-500 border border-white/10 rounded-full py-3 text-sm font-medium text-zinc-200 hover:bg-white/5 active:scale-[0.98] transition"
                  >
                    Buscar otro
                  </button>
                  <button
                    onClick={confirmar}
                    className="bg-marca-500 hover:bg-marca-600 active:scale-[0.98] text-white rounded-full py-3 text-sm font-bold flex items-center justify-center gap-1 transition shadow-marca"
                  >
                    Confirmar ahora <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ icono: Icono, valor, label }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <Icono className="w-4 h-4 mx-auto text-marca-500" />
      <div className="mt-1.5 font-bold text-white text-sm">{valor}</div>
      <div className="text-[10px] text-zinc-500">{label}</div>
    </div>
  )
}
