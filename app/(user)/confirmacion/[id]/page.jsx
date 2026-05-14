'use client'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Check, MapPin, Clock, Calendar, Phone, Home, X, Share2 } from 'lucide-react'
import { useReservas } from '@/lib/store'
import { obtenerNegocio, obtenerServicio } from '@/lib/data/negocios'
import { formatoUSD, formatoDuracion, mesCorto, diasSemanaCorto } from '@/lib/utils'

export default function ConfirmacionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { reservas, cancelarReserva } = useReservas()
  const reserva = reservas.find((r) => r.id === id)

  if (!reserva) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500">Reserva no encontrada.</p>
        <Link href="/explorar" className="text-marca-500 mt-3 inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const negocio = obtenerNegocio(reserva.negocioId)
  const servicio = obtenerServicio(reserva.servicioId)
  const fecha = new Date(reserva.fecha)
  const cancelada = reserva.estado === 'cancelada'

  return (
    <div className="pb-32 bg-zinc-50">
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

      {/* QR */}
      {!cancelada && (
        <div className="px-5 -mt-5">
          <div className="bg-white rounded-3xl p-6 shadow-suave border border-zinc-100">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                Código de check-in
              </div>
              <div className="mt-4 inline-block p-3 bg-white border-2 border-zinc-200 rounded-2xl">
                <QRCodeSVG
                  value={`nearus://reserva/${reserva.codigo}`}
                  size={160}
                  bgColor="#FFFFFF"
                  fgColor="#1F1B4A"
                  level="M"
                />
              </div>
              <div className="mt-4 font-mono font-semibold text-lg tracking-wider text-zinc-900">
                {reserva.codigo}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Muéstralo al llegar al negocio
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden">
          <div className="p-5 border-b border-zinc-100">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Servicio</div>
            <div className="mt-1 font-semibold text-zinc-900">{servicio.nombre}</div>
            <div className="text-sm text-zinc-500">{negocio.nombre}</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatoDuracion(servicio.duracion)}
              </span>
              <span className="font-semibold text-zinc-900">{formatoUSD(servicio.precio)}</span>
            </div>
          </div>

          <Detalle icono={Calendar} titulo="Fecha y hora">
            {diasSemanaCorto(fecha)} {fecha.getDate()} de {mesCorto(fecha)} · {reserva.hora}
          </Detalle>

          <Detalle icono={MapPin} titulo="Dirección">
            <div>{negocio.direccion}</div>
            <div className="text-zinc-500">{negocio.barrio} · Cuenca</div>
          </Detalle>

          <Detalle icono={Phone} titulo="Contacto del negocio">
            <a href={`tel:${negocio.telefono}`} className="text-marca-500">{negocio.telefono}</a>
          </Detalle>
        </div>

        {/* Acciones */}
        {!cancelada && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigator.share?.({ title: 'Mi reserva NearUs', text: reserva.codigo })}
              className="bg-white border border-zinc-200 rounded-2xl py-3 text-sm font-medium text-zinc-700 flex items-center justify-center gap-2 hover:bg-zinc-50"
            >
              <Share2 className="w-4 h-4" /> Compartir
            </button>
            <button
              onClick={() => {
                if (confirm('¿Cancelar esta reserva?')) cancelarReserva(reserva.id)
              }}
              className="bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        )}

        <Link
          href="/explorar"
          className="mt-3 w-full bg-marca-500 hover:bg-marca-600 text-white text-center font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  )
}

function Detalle({ icono: Icono, titulo, children }) {
  return (
    <div className="p-5 border-b border-zinc-100 last:border-b-0 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-marca-50 grid place-items-center shrink-0">
        <Icono className="w-4 h-4 text-marca-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{titulo}</div>
        <div className="mt-0.5 text-sm text-zinc-900">{children}</div>
      </div>
    </div>
  )
}
