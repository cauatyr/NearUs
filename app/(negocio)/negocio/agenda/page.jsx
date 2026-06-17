'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Phone, ChevronLeft, ChevronRight, Plus, Search, CreditCard, Wallet, Sparkles, TrendingUp, X } from 'lucide-react'
import { useReservasDemo, obtenerServicioDemo, obtenerEmpleadoDemo } from '@/lib/data/demo-negocio'
import { empleadosDeNegocio } from '@/lib/data/negocios'
import { useSesion } from '@/lib/store-sesion'
import { formatoUSD, mesCorto } from '@/lib/utils'

const HORAS = Array.from({ length: 13 }, (_, i) => 8 + i) // 8 a 20

export default function AgendaPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const todasReservas = useReservasDemo()
  const RESERVAS_DEMO = useMemo(
    () => todasReservas.filter((r) => r.negocioId === negocioId),
    [todasReservas, negocioId]
  )
  const empleados = empleadosDeNegocio(negocioId)
  const [fecha, setFecha] = useState(new Date())
  const [empleadoSel, setEmpleadoSel] = useState('todos')
  const [reservaAbierta, setReservaAbierta] = useState(null)

  const reservasDelDia = useMemo(() => {
    return RESERVAS_DEMO.filter((r) => {
      const f = new Date(r.fecha)
      return (
        f.toDateString() === fecha.toDateString() &&
        (empleadoSel === 'todos' || r.empleadoId === empleadoSel) &&
        r.estado !== 'cancelada'
      )
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  }, [RESERVAS_DEMO, fecha, empleadoSel])

  const totalHoy = reservasDelDia.reduce((s, r) => s + r.precio, 0)

  // Cerrar detalle al cambiar de día (evita referencias stale)
  useEffect(() => {
    setReservaAbierta(null)
  }, [fecha, empleadoSel])

  const cambiarFecha = (delta) => {
    const d = new Date(fecha)
    d.setDate(d.getDate() + delta)
    setFecha(d)
  }

  const esHoy = fecha.toDateString() === new Date().toDateString()

  return (
    <div className="p-5 md:p-8">
      {/* Banner promoción */}
      <BannerPromocion />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Agenda</h1>
          <p className="text-sm text-zinc-500">
            {esHoy ? 'Hoy' : ''} · {reservasDelDia.length} reservas · {formatoUSD(totalHoy)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Search className="w-4 h-4" /> <span className="hidden sm:inline">Buscar</span>
          </button>
          <button className="bg-marca-500 hover:bg-marca-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>
      </div>

      {/* Date nav */}
      <div className="mt-6 flex items-center justify-between bg-white rounded-2xl border border-zinc-100 p-3">
        <button onClick={() => cambiarFecha(-1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-zinc-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-semibold text-zinc-900">
            {fecha.getDate()} de {mesCorto(fecha)} {fecha.getFullYear()}
          </div>
          <button
            onClick={() => setFecha(new Date())}
            className="text-xs text-marca-500 hover:underline mt-0.5"
          >
            Ir a hoy
          </button>
        </div>
        <button onClick={() => cambiarFecha(1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-zinc-100">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filtros de empleado */}
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        <ChipEmpleado activo={empleadoSel === 'todos'} onClick={() => setEmpleadoSel('todos')}>
          Todo el equipo
        </ChipEmpleado>
        {empleados.map((e) => (
          <ChipEmpleado key={e.id} activo={empleadoSel === e.id} onClick={() => setEmpleadoSel(e.id)}>
            {e.nombre.split(' ')[0]}
          </ChipEmpleado>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-5 grid md:grid-cols-[1fr_320px] gap-5">
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          {HORAS.map((h) => {
            const enHora = reservasDelDia.filter((r) => new Date(r.fecha).getHours() === h)
            return (
              <div key={h} className="flex border-b border-zinc-50 last:border-b-0">
                <div className="w-16 sm:w-20 shrink-0 p-3 text-xs text-zinc-500 text-right font-medium border-r border-zinc-50">
                  {String(h).padStart(2, '0')}:00
                </div>
                <div className="flex-1 min-h-[80px] p-2 space-y-1.5">
                  {enHora.length === 0 ? (
                    <button className="w-full h-full min-h-[64px] border-2 border-dashed border-zinc-100 rounded-xl text-xs text-zinc-300 hover:text-zinc-500 hover:border-zinc-200 transition">
                      + Disponible
                    </button>
                  ) : (
                    enHora.map((r) => (
                      <BloqueReserva
                        key={r.id}
                        reserva={r}
                        onClick={() => setReservaAbierta(r)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Panel derecho — detalle de reserva */}
        <div className="hidden md:block">
          {reservaAbierta ? (
            <DetalleReserva reserva={reservaAbierta} onCerrar={() => setReservaAbierta(null)} />
          ) : (
            <ResumenDia reservas={reservasDelDia} total={totalHoy} />
          )}
        </div>
      </div>

      {/* Modal mobile */}
      {reservaAbierta && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40 flex items-end" onClick={() => setReservaAbierta(null)}>
          <div className="w-full bg-white rounded-t-3xl p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <DetalleReserva reserva={reservaAbierta} onCerrar={() => setReservaAbierta(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

function ChipEmpleado({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap ${
        activo
          ? 'bg-marca-500 border-marca-500 text-white'
          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}

function BloqueReserva({ reserva, onClick }) {
  const servicio = obtenerServicioDemo(reserva.servicioId)
  const empleado = obtenerEmpleadoDemo(reserva.empleadoId)
  const fecha = new Date(reserva.fecha)

  return (
    <button
      onClick={onClick}
      className="w-full bg-marca-50 hover:bg-marca-100 border-l-4 border-marca-500 rounded-xl px-3 py-2.5 text-left transition group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-sm text-zinc-900 truncate">{reserva.cliente.nombre}</div>
          <div className="text-xs text-zinc-600 truncate">{servicio?.nombre}</div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {String(fecha.getHours()).padStart(2, '0')}:{String(fecha.getMinutes()).padStart(2, '0')}
            </span>
            <span>·</span>
            <span>{reserva.duracion} min</span>
            <span>·</span>
            <span>{empleado?.nombre.split(' ')[0]}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-zinc-900">{formatoUSD(reserva.precio)}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {reserva.metodoPago === 'inapp' ? 'App' : 'Local'}
          </div>
        </div>
      </div>
    </button>
  )
}

function DetalleReserva({ reserva, onCerrar }) {
  const servicio = obtenerServicioDemo(reserva.servicioId)
  const empleado = obtenerEmpleadoDemo(reserva.empleadoId)
  const fecha = new Date(reserva.fecha)

  return (
    <div className="bg-white md:rounded-2xl border border-zinc-100 p-5 md:sticky md:top-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-marca-600 font-medium">Reserva</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900">{reserva.codigo}</div>
        </div>
        <button onClick={onCerrar} className="text-zinc-400 hover:text-zinc-900 text-lg">×</button>
      </div>

      <div className="mt-5">
        <div className="w-14 h-14 bg-marca-100 rounded-full grid place-items-center text-marca-600 font-semibold">
          {reserva.cliente.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <h3 className="mt-3 font-semibold text-lg text-zinc-900">{reserva.cliente.nombre}</h3>
        <a href={`tel:${reserva.cliente.celular}`} className="mt-1 text-sm text-marca-500 flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" /> {reserva.cliente.celular}
        </a>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <Fila label="Servicio" valor={servicio?.nombre} />
        <Fila label="Profesional" valor={empleado?.nombre || 'Sin asignar'} />
        <Fila label="Fecha" valor={`${fecha.getDate()}/${fecha.getMonth() + 1} · ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`} />
        <Fila label="Duración" valor={`${reserva.duracion} min`} />
        <Fila label="Pago" valor={reserva.metodoPago === 'inapp' ? 'App (pre-autorizado)' : 'En el local'} />
        <Fila label="Total" valor={formatoUSD(reserva.precio)} destacado />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full py-2.5 text-xs font-medium text-zinc-700">
          Reagendar
        </button>
        <button className="bg-marca-500 hover:bg-marca-600 text-white rounded-full py-2.5 text-xs font-semibold">
          Marcar atendido
        </button>
      </div>
    </div>
  )
}

function Fila({ label, valor, destacado }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className={destacado ? 'font-semibold text-zinc-900' : 'text-zinc-900'}>{valor}</span>
    </div>
  )
}

function ResumenDia({ reservas, total }) {
  const inapp = reservas.filter((r) => r.metodoPago === 'inapp').reduce((s, r) => s + r.precio, 0)
  const local = reservas.filter((r) => r.metodoPago === 'local').reduce((s, r) => s + r.precio, 0)
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 sticky top-5">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Resumen del día</div>
      <div className="mt-2 text-3xl font-semibold text-zinc-900">{formatoUSD(total)}</div>
      <div className="text-xs text-zinc-500">{reservas.length} reservas programadas</div>

      <div className="mt-5 space-y-3">
        <FilaPago icono={CreditCard} label="Pago en app" valor={formatoUSD(inapp)} />
        <FilaPago icono={Wallet} label="Pago en local" valor={formatoUSD(local)} />
      </div>

      <div className="mt-5 pt-5 border-t border-zinc-100">
        <p className="text-xs text-zinc-500">
          Selecciona una reserva en la agenda para ver sus detalles.
        </p>
      </div>
    </div>
  )
}

function BannerPromocion() {
  const [cerrado, setCerrado] = useState(false)
  if (cerrado) return null

  return (
    <div className="mb-5 relative bg-gradient-to-r from-marca-500 via-marca-600 to-marca-700 text-white rounded-2xl p-4 sm:p-5 overflow-hidden shadow-suave">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
      <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-marca-300/20 rounded-full blur-3xl" />

      <button
        onClick={() => setCerrado(true)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-white/15 grid place-items-center text-white/70 hover:text-white"
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="relative flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 grid place-items-center shadow-lg shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Nuevo
            </span>
            <span className="text-xs text-marca-100">Más reservas, sin esfuerzo</span>
          </div>
          <h3 className="mt-1 font-semibold text-base sm:text-lg">
            Destaca tu negocio en NearUs
          </h3>
          <p className="text-xs sm:text-sm text-marca-100 mt-0.5">
            Aparece primero en el mapa, recibe hasta 25 reservas extra por semana.
          </p>
        </div>
        <Link
          href="/negocio/promocion"
          className="shrink-0 bg-white text-marca-600 hover:bg-amber-50 font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md transition"
        >
          <TrendingUp className="w-4 h-4" /> Ver planes y destaques
        </Link>
      </div>
    </div>
  )
}

function FilaPago({ icono: Icono, label, valor }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-zinc-600">
        <Icono className="w-4 h-4 text-zinc-400" /> {label}
      </span>
      <span className="font-semibold text-zinc-900">{valor}</span>
    </div>
  )
}
