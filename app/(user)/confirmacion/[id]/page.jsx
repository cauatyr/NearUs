'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Check, MapPin, Clock, Calendar, CalendarClock, Phone, Home, X, Share2 } from 'lucide-react'
import { useReservas } from '@/lib/store'
import { useCliente } from '@/lib/store-cliente'
import { useDatosStore } from '@/lib/store-datos'
import { obtenerNegocio, obtenerServicio } from '@/lib/data/negocios'
import { formatoUSD, formatoDuracion, mesCorto, diasSemanaCorto, estadoReserva } from '@/lib/utils'
import TimelineReserva from '@/components/TimelineReserva'
import ModalReagendar from '@/components/ModalReagendar'
import FormResena from '@/components/FormResena'
import Confeti from '@/components/Confeti'

export default function ConfirmacionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reservas, cancelarReserva, reagendarReserva } = useReservas()
  const supaReservas = useDatosStore((s) => s.reservas)
  const resenas = useDatosStore((s) => s.resenas)
  const actualizarReserva = useDatosStore((s) => s.actualizarReserva)
  const agregarResena = useDatosStore((s) => s.agregarResena)
  const cliente = useCliente((s) => s.cliente)
  const [reagendando, setReagendando] = useState(false)
  const [festejo, setFestejo] = useState(0)
  // La copia local da campos instantáneos (ej. `hora`); la de Supabase es la
  // fuente de verdad del ESTADO (completada/cancelada/reagendada desde otro
  // dispositivo o el panel del negocio). Merge: local de base, Supabase encima.
  const reservaLocal = reservas.find((r) => r.id === id)
  const reservaSupa = supaReservas.find((r) => r.id === id)
  const reserva = reservaSupa ? { ...reservaLocal, ...reservaSupa } : reservaLocal

  // Confeti al llegar de una reserva recién creada (flag puesta en reservar/ahora).
  useEffect(() => {
    if (!reserva) return
    try {
      if (sessionStorage.getItem('nearus-celebrar') === reserva.id) {
        sessionStorage.removeItem('nearus-celebrar')
        setFestejo((f) => f + 1)
      }
    } catch (_) {}
  }, [reserva?.id])

  if (!reserva) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Reserva no encontrada.</p>
        <Link href="/explorar" className="text-marca-500 mt-3 inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const negocio = obtenerNegocio(reserva.negocioId)
  const servicio = obtenerServicio(reserva.servicioId)
  const fecha = new Date(reserva.fecha)
  const hora =
    reserva.hora ||
    `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
  const cancelada = reserva.estado === 'cancelada'
  const est = estadoReserva(reserva)
  const yaReseño = resenas.some((r) => r.reservaId === reserva.id)
  const puedeReseñar = est.clave === 'completada' && !yaReseño

  const reagendar = async (fechaISO, horaNueva) => {
    reagendarReserva(reserva.id, fechaISO, horaNueva)
    await actualizarReserva(reserva.id, { fecha: fechaISO })
    setReagendando(false)
  }

  const enviarResena = async (rating, comentario) => {
    const res = await agregarResena({
      negocioId: reserva.negocioId,
      reservaId: reserva.id,
      clienteUserId: cliente?.id || reserva.clienteUserId || null,
      clienteNombre: cliente?.nombre || reserva.cliente?.nombre || 'Cliente',
      rating,
      comentario
    })
    if (!res?.error) setFestejo((f) => f + 1)
    return res
  }

  return (
    <div className="pb-32 bg-white/5">
      <Confeti trigger={festejo} />

      {/* Hero confirmación */}
      <div className={`px-5 pt-10 pb-8 text-center text-white ${cancelada ? 'bg-zinc-600' : 'bg-marca-500'}`}>
        <div className="w-16 h-16 mx-auto bg-white/20 rounded-full grid place-items-center backdrop-blur">
          {cancelada ? (
            <X className="w-8 h-8" strokeWidth={3} />
          ) : (
            <Check className="w-8 h-8" strokeWidth={3} />
          )}
        </div>
        <h1 className="mt-4 text-2xl font-semibold">
          {cancelada ? 'Reserva cancelada' : '¡Reserva confirmada!'}
        </h1>
        <p className="mt-1 text-marca-100 text-sm">
          {cancelada ? 'Esta cita fue cancelada' : 'Te esperamos. No te olvides de tu QR.'}
        </p>
      </div>

      {/* Timeline en vivo (tracking estilo Uber) */}
      <div className="px-5 -mt-5">
        <TimelineReserva reserva={reserva} />
      </div>

      {/* Calificar la cita completada */}
      {puedeReseñar && (
        <div className="px-5 mt-4">
          <FormResena onSubmit={enviarResena} />
        </div>
      )}
      {est.clave === 'completada' && yaReseño && (
        <div className="px-5 mt-4">
          <div className="bg-acento-500/15 border border-acento-500/30 rounded-2xl p-4 text-center text-sm text-acento-500 font-medium">
            ¡Gracias por tu reseña! ⭐
          </div>
        </div>
      )}

      {/* QR (solo mientras la cita no ocurrió) */}
      {!cancelada && est.clave !== 'completada' && (
        <div className="px-5 mt-4">
          <div className="bg-nocturno-500 rounded-3xl p-6 shadow-suave border border-white/10">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                Código de check-in
              </div>
              <div className="mt-4 inline-block p-3 bg-nocturno-500 border-2 border-white/10 rounded-2xl">
                <QRCodeSVG
                  value={`nearus://reserva/${reserva.codigo}`}
                  size={160}
                  bgColor="#FFFFFF"
                  fgColor="#1F1B4A"
                  level="M"
                />
              </div>
              <div className="mt-4 font-mono font-semibold text-lg tracking-wider text-white">
                {reserva.codigo}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Muéstralo al llegar al negocio
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles */}
      <div className="px-5 mt-4">
        <div className="bg-nocturno-500 rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Servicio</div>
            <div className="mt-1 font-semibold text-white">{servicio.nombre}</div>
            <div className="text-sm text-zinc-400">{negocio.nombre}</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatoDuracion(servicio.duracion)}
              </span>
              <span className="font-semibold text-white">{formatoUSD(servicio.precio)}</span>
            </div>
          </div>

          <Detalle icono={Calendar} titulo="Fecha y hora">
            {diasSemanaCorto(fecha)} {fecha.getDate()} de {mesCorto(fecha)} · {hora}
          </Detalle>

          <Detalle icono={MapPin} titulo="Dirección">
            <div>{negocio.direccion}</div>
            <div className="text-zinc-400">{negocio.barrio} · Cuenca</div>
          </Detalle>

          <Detalle icono={Phone} titulo="Contacto del negocio">
            <a href={`tel:${negocio.telefono}`} className="text-marca-500">{negocio.telefono}</a>
          </Detalle>
        </div>

        {/* Acciones */}
        {!cancelada && est.clave !== 'completada' && (
          <div className="mt-4 space-y-2">
            {(est.clave === 'confirmada' || est.clave === 'hoy') && (
              <button
                onClick={() => setReagendando(true)}
                className="w-full bg-nocturno-500 border border-white/10 rounded-2xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/5"
              >
                <CalendarClock className="w-4 h-4 text-marca-500" /> Reagendar cita
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigator.share?.({ title: 'Mi reserva NearUs', text: reserva.codigo })}
                className="bg-nocturno-500 border border-white/10 rounded-2xl py-3 text-sm font-medium text-zinc-200 flex items-center justify-center gap-2 hover:bg-white/5"
              >
                <Share2 className="w-4 h-4" /> Compartir
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Cancelar esta reserva?')) {
                    cancelarReserva(reserva.id)
                    actualizarReserva(reserva.id, { estado: 'cancelada' })
                  }
                }}
                className="bg-nocturno-500 border border-red-200 text-red-600 hover:bg-red-500/10 rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </div>
        )}

        <Link
          href="/explorar"
          className="mt-3 w-full bg-marca-500 hover:bg-marca-600 text-white text-center font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>

      {reagendando && (
        <ModalReagendar onClose={() => setReagendando(false)} onConfirm={reagendar} />
      )}
    </div>
  )
}

function Detalle({ icono: Icono, titulo, children }) {
  return (
    <div className="p-5 border-b border-white/10 last:border-b-0 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-marca-500/10 grid place-items-center shrink-0">
        <Icono className="w-4 h-4 text-marca-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{titulo}</div>
        <div className="mt-0.5 text-sm text-white">{children}</div>
      </div>
    </div>
  )
}
