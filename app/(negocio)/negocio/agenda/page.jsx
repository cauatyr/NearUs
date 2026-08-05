'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Phone, ChevronLeft, ChevronRight, Search, CreditCard, Wallet, Sparkles, TrendingUp, X } from 'lucide-react'
import { useReservasDemo, obtenerServicioDemo, obtenerEmpleadoDemo } from '@/lib/data/demo-negocio'
import { empleadosDeNegocio } from '@/lib/data/negocios'
import { useSesion } from '@/lib/store-sesion'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD, mesCorto, siguientesDias, generarHorarios, diasSemanaCorto, franjaDelDia, pausaValida } from '@/lib/utils'

// Paleta de colores por profesional (distinguibles sobre fondo oscuro)
const PALETA_EMP = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316']
function colorEmpleado(empleadoId, empleados) {
  if (!empleadoId) return '#6366F1'
  const i = empleados.findIndex((e) => e.id === empleadoId)
  return PALETA_EMP[(i >= 0 ? i : 0) % PALETA_EMP.length]
}

export default function AgendaPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const todasReservas = useReservasDemo()
  const RESERVAS_DEMO = useMemo(
    () => todasReservas.filter((r) => r.negocioId === negocioId),
    [todasReservas, negocioId]
  )
  const empleados = empleadosDeNegocio(negocioId)
  const negocios = useDatosStore((s) => s.negocios)
  const negocio = useMemo(() => negocios.find((n) => n.id === negocioId), [negocios, negocioId])
  const [fecha, setFecha] = useState(new Date())
  const [empleadoSel, setEmpleadoSel] = useState('todos')
  const [reservaAbierta, setReservaAbierta] = useState(null)

  const reservasDelDia = useMemo(() => {
    return RESERVAS_DEMO.filter((r) => {
      const f = new Date(r.fecha)
      return (
        f.toDateString() === fecha.toDateString() &&
        (empleadoSel === 'todos' || r.empleadoId === empleadoSel) &&
        r.estado !== 'cancelada' &&
        r.estado !== 'ausente'
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

  const ahora = new Date()
  const esHoy = fecha.toDateString() === ahora.toDateString()
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes()
  const franja = franjaDelDia(negocio?.horarioSemanal, fecha)

  return (
    <div className="p-5 md:p-8">
      {/* Banner promoción */}
      <BannerPromocion />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Agenda</h1>
          <p className="text-sm text-zinc-400">
            {esHoy ? 'Hoy' : ''} · {reservasDelDia.length} reservas · {formatoUSD(totalHoy)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-nocturno-500 border border-white/10 hover:bg-white/5 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Search className="w-4 h-4" /> <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
      </div>

      {/* Date nav */}
      <div className="mt-6 flex items-center justify-between bg-nocturno-500 rounded-2xl border border-white/10 p-3">
        <button onClick={() => cambiarFecha(-1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-white/10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-semibold text-white">
            {fecha.getDate()} de {mesCorto(fecha)} {fecha.getFullYear()}
          </div>
          <button
            onClick={() => setFecha(new Date())}
            className="text-xs text-marca-500 hover:underline mt-0.5"
          >
            Ir a hoy
          </button>
        </div>
        <button onClick={() => cambiarFecha(1)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-white/10">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filtros de empleado */}
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        <ChipEmpleado activo={empleadoSel === 'todos'} onClick={() => setEmpleadoSel('todos')}>
          Todo el equipo
        </ChipEmpleado>
        {empleados.map((e) => (
          <ChipEmpleado
            key={e.id}
            activo={empleadoSel === e.id}
            onClick={() => setEmpleadoSel(e.id)}
            color={colorEmpleado(e.id, empleados)}
          >
            {e.nombre.split(' ')[0]}
          </ChipEmpleado>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-5 grid md:grid-cols-[1fr_320px] gap-5">
        <TimelineDia
          reservas={reservasDelDia}
          franja={franja}
          esHoy={esHoy}
          ahoraMin={ahoraMin}
          empleados={empleados}
          onSelect={setReservaAbierta}
        />

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
          <div className="w-full bg-nocturno-500 rounded-t-3xl p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <DetalleReserva reserva={reservaAbierta} onCerrar={() => setReservaAbierta(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

function ChipEmpleado({ activo, onClick, color, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap flex items-center gap-1.5 ${
        activo
          ? 'bg-marca-500 border-marca-500 text-white'
          : 'bg-nocturno-500 border-white/10 text-zinc-200 hover:border-white/20'
      }`}
    >
      {color && (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      {children}
    </button>
  )
}

// Timeline proporcional: cada reserva es un bloque cuya altura = duración,
// coloreado por profesional. Marca las horas fuera del horario en gris y una
// línea del "ahora". Funciona en mobile (columna única) y desktop.
const PX_POR_MIN = 1.1 // 60 min ≈ 66px de alto

function TimelineDia({ reservas, franja, esHoy, ahoraMin, empleados, onSelect }) {
  const toMin = (t) => {
    const [h, m] = String(t).split(':').map(Number)
    return h * 60 + m
  }
  const abierto = franja ? franja.abierto : true
  const apMin = abierto && franja ? toMin(franja.apertura) : 9 * 60
  const ciMin = abierto && franja ? toMin(franja.cierre) : 19 * 60

  // Rango visible: abarca 08–20 y se estira si el horario excede ese margen.
  const startH = Math.min(8, Math.floor(apMin / 60))
  const endH = Math.max(20, Math.ceil(ciMin / 60))
  const rangoIni = startH * 60
  const totalMin = (endH - startH) * 60
  const altura = totalMin * PX_POR_MIN
  const top = (min) => (min - rangoIni) * PX_POR_MIN

  const horas = []
  for (let h = startH; h <= endH; h++) horas.push(h)

  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 overflow-hidden">
      <div className="relative" style={{ height: altura }}>
        {/* Grilla de horas */}
        {horas.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 flex"
            style={{ top: (h - startH) * 60 * PX_POR_MIN, height: 60 * PX_POR_MIN }}
          >
            <div className="w-14 sm:w-16 shrink-0 pr-2 pt-1 text-[11px] text-zinc-500 text-right">
              {String(h).padStart(2, '0')}:00
            </div>
            <div className="flex-1 border-t border-white/5" />
          </div>
        ))}

        {/* Zonas cerradas (gris) */}
        {abierto ? (
          <>
            {apMin > rangoIni && <ZonaCerrada top={0} height={(apMin - rangoIni) * PX_POR_MIN} />}
            {ciMin < endH * 60 && (
              <ZonaCerrada top={top(ciMin)} height={(endH * 60 - ciMin) * PX_POR_MIN} />
            )}
            {/* Pausa (almuerzo): mismo gris, en medio del día */}
            {pausaValida(franja) && (
              <ZonaCerrada
                top={top(toMin(franja.pausa.inicio))}
                height={(toMin(franja.pausa.fin) - toMin(franja.pausa.inicio)) * PX_POR_MIN}
                etiqueta="Pausa"
              />
            )}
          </>
        ) : (
          <ZonaCerrada top={0} height={altura} etiqueta="Cerrado este día" />
        )}

        {/* Línea del ahora */}
        {esHoy && ahoraMin >= rangoIni && ahoraMin <= endH * 60 && (
          <div
            className="absolute left-14 sm:left-16 right-0 z-20 pointer-events-none"
            style={{ top: top(ahoraMin) }}
          >
            <div className="relative border-t-2 border-red-500/80">
              <div className="absolute -left-1 -top-[5px] w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
        )}

        {/* Reservas */}
        <div className="absolute left-14 sm:left-16 right-0 top-0 bottom-0">
          {reservas.length === 0 && abierto && (
            <div className="absolute inset-0 grid place-items-center text-xs text-zinc-500">
              Sin reservas este día
            </div>
          )}
          {reservas.map((r) => {
            const ini = new Date(r.fecha)
            const min = ini.getHours() * 60 + ini.getMinutes()
            const color = colorEmpleado(r.empleadoId, empleados)
            const alto = Math.max(r.duracion * PX_POR_MIN, 30)
            const servicio = obtenerServicioDemo(r.servicioId)
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="absolute left-1.5 right-1.5 rounded-lg border-l-4 px-2.5 py-1 text-left overflow-hidden hover:brightness-125 transition"
                style={{ top: top(min), height: alto, borderLeftColor: color, backgroundColor: `${color}26` }}
              >
                <div className="text-xs font-medium text-white truncate">{r.cliente.nombre}</div>
                <div className="text-[10px] text-zinc-300 truncate">{servicio?.nombre}</div>
                {alto > 48 && (
                  <div className="mt-0.5 text-[10px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {String(ini.getHours()).padStart(2, '0')}:{String(ini.getMinutes()).padStart(2, '0')} · {r.duracion}m
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ZonaCerrada({ top, height, etiqueta }) {
  return (
    <div
      className="absolute left-14 sm:left-16 right-0 z-10 pointer-events-none bg-white/[0.03] grid place-items-center"
      style={{ top, height }}
    >
      {etiqueta && <span className="text-xs text-zinc-500">{etiqueta}</span>}
    </div>
  )
}

function DetalleReserva({ reserva, onCerrar }) {
  const servicio = obtenerServicioDemo(reserva.servicioId)
  const empleado = obtenerEmpleadoDemo(reserva.empleadoId)
  const fecha = new Date(reserva.fecha)
  const actualizarReserva = useDatosStore((s) => s.actualizarReserva)

  const [guardando, setGuardando] = useState(false)
  const [reagendando, setReagendando] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState(fecha)
  const [nuevaHora, setNuevaHora] = useState(null)
  const [error, setError] = useState(null)

  const atendido = reserva.estado === 'completada'
  const dias = siguientesDias(14)
  const horarios = generarHorarios(8, 20, 30)

  const marcarAtendido = async () => {
    setGuardando(true)
    const { error: err } = await actualizarReserva(reserva.id, { estado: 'completada' })
    setGuardando(false)
    if (err) { setError(err); return }
    onCerrar()
  }

  const cambiarEstado = async (estado, mensajeConfirm) => {
    if (mensajeConfirm && !confirm(mensajeConfirm)) return
    setGuardando(true)
    const { error: err } = await actualizarReserva(reserva.id, { estado })
    setGuardando(false)
    if (err) { setError(err); return }
    onCerrar()
  }

  const terminal = ['completada', 'cancelada', 'ausente'].includes(reserva.estado)

  const confirmarReagenda = async () => {
    if (!nuevaHora) return
    const [hh, mm] = nuevaHora.split(':').map(Number)
    const inicio = new Date(nuevaFecha)
    inicio.setHours(hh, mm, 0, 0)
    setGuardando(true)
    const { error: err } = await actualizarReserva(reserva.id, { fecha: inicio.toISOString() })
    setGuardando(false)
    if (err) { setError(err); return }
    onCerrar()
  }

  return (
    <div className="bg-nocturno-500 md:rounded-2xl border border-white/10 p-5 md:sticky md:top-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-marca-600 font-medium">Reserva</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-white">{reserva.codigo}</div>
        </div>
        <button onClick={onCerrar} className="text-zinc-400 hover:text-white text-lg">×</button>
      </div>

      <div className="mt-5">
        <div className="w-14 h-14 bg-marca-500/15 rounded-full grid place-items-center text-marca-600 font-semibold">
          {reserva.cliente.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <h3 className="mt-3 font-semibold text-lg text-white">{reserva.cliente.nombre}</h3>
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
        <Fila label="Estado" valor={etiquetaEstado(reserva.estado)} />
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
          No se pudo guardar: {error}
        </div>
      )}

      {reagendando ? (
        <div className="mt-5">
          <div className="text-xs font-semibold text-zinc-200 mb-2">Nueva fecha</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {dias.map((d) => {
              const sel = d.toDateString() === nuevaFecha.toDateString()
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setNuevaFecha(d)}
                  className={`shrink-0 w-12 py-2 rounded-xl border-2 transition flex flex-col items-center ${
                    sel ? 'border-marca-500 bg-marca-500 text-white' : 'border-white/10 text-zinc-200'
                  }`}
                >
                  <span className="text-[9px] uppercase font-medium">{diasSemanaCorto(d)}</span>
                  <span className="text-base font-semibold leading-tight">{d.getDate()}</span>
                </button>
              )
            })}
          </div>

          <div className="text-xs font-semibold text-zinc-200 mt-3 mb-2">Nueva hora</div>
          <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
            {horarios.map((h) => (
              <button
                key={h}
                onClick={() => setNuevaHora(h)}
                className={`py-2 rounded-lg text-xs font-medium border-2 transition ${
                  nuevaHora === h ? 'border-marca-500 bg-marca-500 text-white' : 'border-white/10 text-zinc-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => { setReagendando(false); setNuevaHora(null) }}
              className="bg-nocturno-500 border border-white/10 hover:bg-white/5 rounded-full py-2.5 text-xs font-medium text-zinc-200"
            >
              Cancelar
            </button>
            <button
              disabled={!nuevaHora || guardando}
              onClick={confirmarReagenda}
              className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white rounded-full py-2.5 text-xs font-semibold"
            >
              {guardando ? 'Guardando…' : 'Confirmar nueva fecha'}
            </button>
          </div>
        </div>
      ) : terminal ? (
        <div className="mt-5 text-center text-xs text-zinc-400 bg-white/5 border border-white/10 rounded-xl py-3">
          Reserva {etiquetaEstado(reserva.estado).toLowerCase()}
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReagendando(true)}
              disabled={guardando}
              className="bg-nocturno-500 border border-white/10 hover:bg-white/5 rounded-full py-2.5 text-xs font-medium text-zinc-200"
            >
              Reagendar
            </button>
            <button
              onClick={marcarAtendido}
              disabled={guardando}
              className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white rounded-full py-2.5 text-xs font-semibold"
            >
              {guardando ? 'Guardando…' : 'Marcar atendido'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => cambiarEstado('ausente')}
              disabled={guardando}
              className="border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-full py-2.5 text-xs font-medium disabled:opacity-50"
            >
              No vino
            </button>
            <button
              onClick={() => cambiarEstado('cancelada', '¿Cancelar esta reserva?')}
              disabled={guardando}
              className="border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-full py-2.5 text-xs font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function etiquetaEstado(estado) {
  switch (estado) {
    case 'completada': return 'Atendido ✓'
    case 'cancelada': return 'Cancelada'
    case 'ausente': return 'No vino'
    default: return 'Confirmada'
  }
}

function Fila({ label, valor, destacado }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-xs">{label}</span>
      <span className={destacado ? 'font-semibold text-white' : 'text-white'}>{valor}</span>
    </div>
  )
}

function ResumenDia({ reservas, total }) {
  const inapp = reservas.filter((r) => r.metodoPago === 'inapp').reduce((s, r) => s + r.precio, 0)
  const local = reservas.filter((r) => r.metodoPago === 'local').reduce((s, r) => s + r.precio, 0)
  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 p-5 sticky top-5">
      <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Resumen del día</div>
      <div className="mt-2 text-3xl font-semibold text-white">{formatoUSD(total)}</div>
      <div className="text-xs text-zinc-400">{reservas.length} reservas programadas</div>

      <div className="mt-5 space-y-3">
        <FilaPago icono={CreditCard} label="Pago en app" valor={formatoUSD(inapp)} />
        <FilaPago icono={Wallet} label="Pago en local" valor={formatoUSD(local)} />
      </div>

      <div className="mt-5 pt-5 border-t border-white/10">
        <p className="text-xs text-zinc-400">
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
          className="shrink-0 bg-nocturno-500 text-marca-600 hover:bg-amber-500/10 font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md transition"
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
      <span className="flex items-center gap-2 text-zinc-300">
        <Icono className="w-4 h-4 text-zinc-400" /> {label}
      </span>
      <span className="font-semibold text-white">{valor}</span>
    </div>
  )
}
