'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, MapPin, Clock, Star, ArrowRight, Check } from 'lucide-react'
import { useNegocios, serviciosDeNegocio } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { useReservas, useUbicacion } from '@/lib/store'
import { distanciaKm, formatoDistancia, formatoUSD, generarHorarios } from '@/lib/utils'

const ESTADOS = ['inicial', 'buscando', 'encontrado', 'confirmado']

export default function AhoraPage() {
  const router = useRouter()
  const { posicion } = useUbicacion()
  const { crearReserva } = useReservas()
  const NEGOCIOS = useNegocios()
  const [categoria, setCategoria] = useState('barberia')
  const [estado, setEstado] = useState('inicial')
  const [negocioElegido, setNegocioElegido] = useState(null)

  const disponibles = useMemo(() => {
    return NEGOCIOS.filter((n) => n.aceptaAhora && n.categoria === categoria)
      .map((n) => ({
        ...n,
        _dist: distanciaKm(posicion.lat, posicion.lng, n.lat, n.lng)
      }))
      .sort((a, b) => a._dist - b._dist)
  }, [categoria, posicion])

  const buscar = () => {
    setEstado('buscando')
    setTimeout(() => {
      if (disponibles.length > 0) {
        setNegocioElegido(disponibles[0])
        setEstado('encontrado')
      } else {
        setEstado('inicial')
      }
    }, 2200)
  }

  const confirmar = () => {
    const servicios = serviciosDeNegocio(negocioElegido.id)
    const servicio = servicios[0]
    const ahora = new Date()
    const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(Math.ceil(ahora.getMinutes() / 15) * 15 % 60).padStart(2, '0')}`
    const reserva = crearReserva({
      negocioId: negocioElegido.id,
      servicioId: servicio.id,
      empleadoId: 'cualquiera',
      fecha: ahora.toISOString(),
      hora: hora === '00:00' ? '14:00' : hora,
      modo: 'ahora'
    })
    router.push(`/confirmacion/${reserva.id}`)
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
          <Zap className="w-3 h-3 fill-amber-700" /> Modo on-demand
        </span>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900 leading-tight">
          ¿Necesitas un servicio
          <br />
          <span className="text-marca-500">ahora mismo</span>?
        </h1>
        <p className="mt-2 text-zinc-600">
          Te conectamos al instante con el negocio más cercano disponible.
        </p>
      </div>

      {estado === 'inicial' && (
        <div className="px-5 mt-2">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">¿Qué necesitas?</h3>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIAS.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoria(c.id)}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  categoria === c.id
                    ? 'border-marca-500 bg-white'
                    : 'border-transparent bg-white/70'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-white font-semibold"
                  style={{ backgroundColor: c.color }}
                >
                  {c.nombre[0]}
                </div>
                <div className="mt-2.5 font-medium text-zinc-900">{c.nombre}</div>
                <div className="text-[11px] text-zinc-500">
                  {NEGOCIOS.filter((n) => n.aceptaAhora && n.categoria === c.id).length} disponibles
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={buscar}
            disabled={disponibles.length === 0}
            className="mt-6 w-full bg-marca-500 hover:bg-marca-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-5 h-5 fill-white" />
            Buscar atención inmediata
          </button>
          {disponibles.length === 0 && (
            <p className="mt-3 text-center text-xs text-zinc-500">
              No hay negocios disponibles ahora en esta categoría. Prueba otra.
            </p>
          )}
        </div>
      )}

      {estado === 'buscando' && (
        <div className="px-5 mt-6 flex flex-col items-center text-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 bg-marca-100 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-4 bg-marca-200 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.3s' }} />
            <div className="absolute inset-8 bg-marca-300 rounded-full animate-ping opacity-25" style={{ animationDelay: '0.6s' }} />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-16 h-16 rounded-full bg-marca-500 grid place-items-center shadow-lg">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
          <h3 className="mt-8 text-xl font-semibold text-zinc-900">
            Buscando negocios disponibles...
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            Estamos confirmando disponibilidad en tiempo real con los negocios cercanos.
          </p>
        </div>
      )}

      {estado === 'encontrado' && negocioElegido && (
        <div className="px-5 mt-2 animate-slide-up">
          <div className="bg-white rounded-3xl p-5 border-2 border-marca-200 shadow-flotante">
            <div className="flex items-center gap-2 text-marca-600 text-xs font-semibold uppercase tracking-wider">
              <Check className="w-4 h-4" /> ¡Te puede atender ahora!
            </div>
            <h2 className="mt-3 text-xl font-semibold text-zinc-900">{negocioElegido.nombre}</h2>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-zinc-600">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <strong>{negocioElegido.rating}</strong>
              <span className="text-zinc-400">·</span>
              <span>{negocioElegido.barrio}</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat icono={MapPin} valor={formatoDistancia(negocioElegido._dist)} label="Distancia" />
              <Stat icono={Clock} valor="~5 min" label="Camino" />
              <Stat icono={Zap} valor="Libre" label="Estado" />
            </div>

            <div className="mt-5 bg-zinc-50 rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">Primer servicio disponible</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-900">
                  {serviciosDeNegocio(negocioElegido.id)[0]?.nombre}
                </div>
                <div className="font-semibold text-zinc-900">
                  {formatoUSD(serviciosDeNegocio(negocioElegido.id)[0]?.precio || 0)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setEstado('inicial')}
                className="bg-white border border-zinc-200 rounded-full py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Buscar otro
              </button>
              <button
                onClick={confirmar}
                className="bg-marca-500 hover:bg-marca-600 text-white rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-1"
              >
                Confirmar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {disponibles.length > 1 && (
            <div className="mt-5">
              <div className="text-xs text-zinc-500 font-medium mb-2">Otros disponibles ahora</div>
              <div className="space-y-2">
                {disponibles.slice(1, 4).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setNegocioElegido(n)}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 border border-zinc-100 hover:border-marca-200 text-left transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 truncate">{n.nombre}</div>
                      <div className="text-xs text-zinc-500">
                        {formatoDistancia(n._dist)} · {n.barrio}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
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
    <div className="bg-zinc-50 rounded-xl p-3">
      <Icono className="w-4 h-4 mx-auto text-marca-500" />
      <div className="mt-1.5 font-semibold text-zinc-900 text-sm">{valor}</div>
      <div className="text-[10px] text-zinc-500">{label}</div>
    </div>
  )
}
