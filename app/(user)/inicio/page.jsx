'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Zap, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { useNegocios, obtenerNegocio, obtenerServicio } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { CIUDAD_DEFECTO } from '@/lib/data/ciudades'
import { useUbicacion } from '@/lib/store'
import { useCliente } from '@/lib/store-cliente'
import { useDatosStore } from '@/lib/store-datos'
import { distanciaKm } from '@/lib/utils'
import TarjetaNegocio from '@/components/TarjetaNegocio'
import FlujoUbicacion from '@/components/FlujoUbicacion'

export default function InicioPage() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const NEGOCIOS = useNegocios()
  const { posicion, ciudad, reabrirFlujo } = useUbicacion()
  const cliente = useCliente((s) => s.cliente)
  const todasReservas = useDatosStore((s) => s.reservas)

  const ciudadActiva = ciudad || CIUDAD_DEFECTO
  const nombre = cliente?.nombre?.trim().split(/\s+/)[0] || null

  // Negocios de la ciudad activa, ordenados por distancia al usuario.
  const conDist = useMemo(() => {
    return NEGOCIOS.filter(
      (n) =>
        distanciaKm(n.lat, n.lng, ciudadActiva.centro.lat, ciudadActiva.centro.lng) <=
        ciudadActiva.radioKm
    )
      .map((n) => ({ ...n, _dist: distanciaKm(posicion.lat, posicion.lng, n.lat, n.lng) }))
      .sort((a, b) => a._dist - b._dist)
  }, [NEGOCIOS, ciudadActiva, posicion])

  const disponiblesAhora = conDist.filter((n) => n.aceptaAhora).slice(0, 8)
  const cercaDeTi = conDist.slice(0, 6)

  // Próxima cita confirmada del cliente (más cercana en el futuro).
  const proxima = useMemo(() => {
    if (!cliente) return null
    const ahora = Date.now()
    return (
      todasReservas
        .filter(
          (r) =>
            r.clienteUserId === cliente.id &&
            r.estado === 'confirmada' &&
            new Date(r.fecha).getTime() > ahora
        )
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0] || null
    )
  }, [todasReservas, cliente])

  const buscar = (e) => {
    e?.preventDefault()
    const t = q.trim()
    router.push(`/explorar${t ? `?q=${encodeURIComponent(t)}` : ''}`)
  }

  return (
    <div className="min-h-screen pb-24">
      <FlujoUbicacion />

      {/* Saludo + ciudad */}
      <div className="px-5 pt-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {nombre ? <>Hola, {nombre} <span className="font-normal">👋</span></> : <>Hola 👋</>}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">¿Qué servicio buscas hoy?</p>
          </div>
          <button
            onClick={reabrirFlujo}
            className="shrink-0 flex items-center gap-1 bg-nocturno-500 border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-marca-200 transition"
            aria-label="Cambiar de ciudad"
          >
            <MapPin className="w-3.5 h-3.5 text-marca-500" />
            {ciudadActiva.nombre}
          </button>
        </div>

        {/* Búsqueda */}
        <form onSubmit={buscar} className="mt-4">
          <div className="bg-nocturno-500 rounded-2xl border border-white/10 px-3 flex items-center gap-2 focus-within:border-marca-500 transition">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar salón, barbería, spa..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none py-3"
            />
          </div>
        </form>
      </div>

      {/* Categorías */}
      <div className="mt-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/explorar?categoria=${c.id}`)}
              className="shrink-0 flex items-center gap-1.5 bg-nocturno-500 border border-white/10 rounded-full px-3.5 py-2 text-xs font-bold text-zinc-200 hover:border-marca-200 transition"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Tu próxima cita */}
      <div className="px-5 mt-6">
        {proxima ? (
          <ProximaCita reserva={proxima} />
        ) : (
          <Link
            href="/explorar"
            className="flex items-center gap-3 bg-gradient-to-br from-marca-700 to-nocturno-500 border border-marca-500/30 rounded-2xl p-4 hover:border-marca-500/60 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-marca-500/20 grid place-items-center text-marca-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white">Aún no tienes citas</div>
              <div className="text-xs text-zinc-300">Explora servicios y reserva en segundos.</div>
            </div>
            <ArrowRight className="w-4 h-4 text-marca-300 shrink-0" />
          </Link>
        )}
      </div>

      {/* Disponibles ahora */}
      {disponiblesAhora.length > 0 && (
        <Seccion titulo="Disponibles ahora" icono={Zap} verHref="/ahora">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
            {disponiblesAhora.map((n) => (
              <div key={n.id} className="w-60 shrink-0">
                <TarjetaNegocio negocio={n} usuario={posicion} />
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {/* Cerca de ti */}
      {cercaDeTi.length > 0 && (
        <Seccion titulo="Cerca de ti" icono={MapPin} verHref="/explorar">
          <div className="px-5 space-y-3">
            {cercaDeTi.map((n) => (
              <TarjetaNegocio key={n.id} negocio={n} usuario={posicion} compacta />
            ))}
          </div>
        </Seccion>
      )}
    </div>
  )
}

function Seccion({ titulo, icono: Icono, verHref, children }) {
  return (
    <div className="mt-6">
      <div className="px-5 flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-white">
          <Icono className="w-4 h-4 text-marca-500" />
          {titulo}
        </h2>
        {verHref && (
          <Link href={verHref} className="text-xs font-medium text-marca-400 flex items-center gap-0.5 hover:text-marca-300">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function ProximaCita({ reserva }) {
  const negocio = obtenerNegocio(reserva.negocioId)
  const servicio = obtenerServicio(reserva.servicioId)
  const fecha = new Date(reserva.fecha)
  const cuando = fecha.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short' })
  const hora = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`

  return (
    <Link
      href={`/confirmacion/${reserva.id}`}
      className="block bg-nocturno-500 border border-white/10 rounded-2xl p-4 hover:border-marca-200 transition"
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-bold text-marca-400">
        <Calendar className="w-3.5 h-3.5" /> Tu próxima cita
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-white truncate">{servicio?.nombre || 'Reserva'}</div>
          <div className="text-xs text-zinc-400 truncate">{negocio?.nombre}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-white capitalize">{cuando}</div>
          <div className="text-xs text-marca-400 font-semibold">{hora}</div>
        </div>
      </div>
    </Link>
  )
}
