'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import {
  CalendarDays, DollarSign, TrendingUp, Star, Gauge, Clock, User,
  ChevronRight, Scissors, Users, Sparkles, QrCode
} from 'lucide-react'
import { useSesion } from '@/lib/store-sesion'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD, formatoDuracion, franjaDelDia, resumenHorario, pausaValida } from '@/lib/utils'

export default function InicioPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const negocios = useDatosStore((s) => s.negocios)
  const reservas = useDatosStore((s) => s.reservas)
  const servicios = useDatosStore((s) => s.servicios)
  const empleados = useDatosStore((s) => s.empleados)

  const negocio = useMemo(() => negocios.find((n) => n.id === negocioId), [negocios, negocioId])

  const data = useMemo(() => {
    const ahora = new Date()
    const finHoy = new Date(ahora); finHoy.setHours(23, 59, 59, 999)
    const hace7 = new Date(ahora); hace7.setDate(ahora.getDate() - 6); hace7.setHours(0, 0, 0, 0)

    const activas = reservas.filter(
      (r) => r.negocioId === negocioId && r.estado !== 'cancelada' && r.estado !== 'ausente'
    )
    const esHoy = (iso) => new Date(iso).toDateString() === ahora.toDateString()
    const reservasHoy = activas.filter((r) => esHoy(r.fecha)).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    const ingresosHoy = reservasHoy.reduce((s, r) => s + r.precio, 0)

    const semana = activas.filter((r) => {
      const f = new Date(r.fecha)
      return f >= hace7 && f <= finHoy
    })
    const ingresosSemana = semana.reduce((s, r) => s + r.precio, 0)

    const futuras = activas
      .filter((r) => new Date(r.fecha) >= ahora)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    const proxima = futuras[0] || null

    // Ocupación de hoy según el horario configurado
    let ocupacion = null
    const franja = negocio ? franjaDelDia(negocio.horarioSemanal, ahora) : null
    if (franja && franja.abierto) {
      const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m }
      // La pausa (almuerzo) no es tiempo vendible → se descuenta de la capacidad.
      const pausaMin = pausaValida(franja) ? toMin(franja.pausa.fin) - toMin(franja.pausa.inicio) : 0
      const disp = toMin(franja.cierre) - toMin(franja.apertura) - pausaMin
      const usado = reservasHoy.reduce((s, r) => s + (r.duracion || 0), 0)
      ocupacion = disp > 0 ? Math.min(100, Math.round((usado / disp) * 100)) : null
    }

    return { reservasHoy, ingresosHoy, ingresosSemana, proxima, ocupacion }
  }, [reservas, negocioId, negocio])

  if (!negocio) {
    return (
      <div className="p-5 md:p-8">
        <p className="text-zinc-400">Cargando panel…</p>
      </div>
    )
  }

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const servicioDe = (id) => servicios.find((s) => s.id === id)
  const empleadoDe = (id) => empleados.find((e) => e.id === id)

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      {/* Saludo */}
      <div>
        <p className="text-sm text-zinc-400">{saludo},</p>
        <h1 className="text-2xl font-semibold text-white">{negocio.nombre}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{resumenHorario(negocio.horarioSemanal) || negocio.horario || 'Configura tu horario'}</p>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icono={CalendarDays} label="Reservas hoy" valor={data.reservasHoy.length} tono="marca" />
        <Kpi icono={DollarSign} label="Ingresos hoy" valor={formatoUSD(data.ingresosHoy)} tono="acento" />
        <Kpi icono={TrendingUp} label="Ingresos 7 días" valor={formatoUSD(data.ingresosSemana)} tono="marca" />
        <Kpi
          icono={data.ocupacion === null ? Star : Gauge}
          label={data.ocupacion === null ? 'Calificación' : 'Ocupación hoy'}
          valor={
            data.ocupacion === null
              ? (negocio.rating ? `${negocio.rating} ★` : 'Sin reseñas')
              : `${data.ocupacion}%`
          }
          tono="amber"
        />
      </div>

      {/* Próxima cita */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-white mb-2">Próxima cita</h2>
        {data.proxima ? (
          <Link
            href="/negocio/agenda"
            className="block bg-nocturno-500 border border-white/10 hover:border-marca-500/40 rounded-2xl p-4 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-marca-500/15 grid place-items-center text-marca-500 font-semibold shrink-0">
                {data.proxima.cliente.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{data.proxima.cliente.nombre}</div>
                <div className="text-xs text-zinc-400 truncate">
                  {servicioDe(data.proxima.servicioId)?.nombre}
                  {empleadoDe(data.proxima.empleadoId) ? ` · ${empleadoDe(data.proxima.empleadoId).nombre.split(' ')[0]}` : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-white">{fmtFechaCorta(data.proxima.fecha)}</div>
                <div className="text-[11px] text-zinc-400">{formatoDuracion(data.proxima.duracion)}</div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-sm text-zinc-400">No tienes reservas próximas.</p>
            <p className="text-xs text-zinc-500 mt-1">Comparte tu negocio en NearUs para recibir nuevas reservas.</p>
          </div>
        )}
      </div>

      {/* Reservas de hoy (resumen) */}
      {data.reservasHoy.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">Hoy</h2>
            <Link href="/negocio/agenda" className="text-xs text-marca-500 hover:underline flex items-center gap-0.5">
              Ver agenda <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-nocturno-500 border border-white/10 rounded-2xl divide-y divide-white/5">
            {data.reservasHoy.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3">
                <div className="w-14 text-xs font-semibold text-marca-500 shrink-0">{fmtHora(r.fecha)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{r.cliente.nombre}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{servicioDe(r.servicioId)?.nombre}</div>
                </div>
                <div className="text-sm font-medium text-white shrink-0">{formatoUSD(r.precio)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-white mb-2">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Acceso href="/negocio/servicios" icono={Scissors} label="Servicios" />
          <Acceso href="/negocio/empleados" icono={Users} label="Equipo" />
          <Acceso href="/negocio/validar" icono={QrCode} label="Check-in QR" />
          <Acceso href="/negocio/promocion" icono={Sparkles} label="Destacar" destacado />
        </div>
      </div>
    </div>
  )
}

function Kpi({ icono: Icono, label, valor, tono }) {
  const tonos = {
    marca: 'text-marca-500 bg-marca-500/15',
    acento: 'text-acento-500 bg-acento-500/15',
    amber: 'text-amber-500 bg-amber-500/15'
  }
  return (
    <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg grid place-items-center ${tonos[tono] || tonos.marca}`}>
        <Icono className="w-4 h-4" />
      </div>
      <div className="mt-3 text-xl font-semibold text-white leading-tight">{valor}</div>
      <div className="text-[11px] text-zinc-400 mt-0.5">{label}</div>
    </div>
  )
}

function Acceso({ href, icono: Icono, label, destacado }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
        destacado
          ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
          : 'border-white/10 bg-nocturno-500 hover:border-white/20'
      }`}
    >
      <Icono className={`w-5 h-5 ${destacado ? 'text-amber-500' : 'text-marca-500'}`} />
      <span className="text-xs font-medium text-zinc-200">{label}</span>
    </Link>
  )
}

function fmtHora(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtFechaCorta(iso) {
  const d = new Date(iso)
  const hoy = new Date()
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1)
  const hhmm = fmtHora(iso)
  if (d.toDateString() === hoy.toDateString()) return `Hoy ${hhmm}`
  if (d.toDateString() === manana.toDateString()) return `Mañana ${hhmm}`
  return `${d.getDate()}/${d.getMonth() + 1} ${hhmm}`
}
