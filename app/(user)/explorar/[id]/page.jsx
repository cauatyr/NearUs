'use client'
import { useState } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Star, Clock, MapPin, Phone, Heart, Share2, Zap, Calendar, ChevronRight
} from 'lucide-react'
import { obtenerNegocio, serviciosDeNegocio, empleadosDeNegocio } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { useReservas } from '@/lib/store'
import { formatoUSD, formatoDuracion } from '@/lib/utils'

export default function DetalleNegocio() {
  const { id } = useParams()
  const router = useRouter()
  const negocio = obtenerNegocio(id)
  const servicios = serviciosDeNegocio(id)
  const empleados = empleadosDeNegocio(id)
  const [tab, setTab] = useState('servicios')

  const { favoritos, toggleFavorito } = useReservas()
  const esFav = favoritos.includes(id)

  if (!negocio) return notFound()
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)

  return (
    <div className="pb-32">
      {/* Portada */}
      <div className="relative h-56 bg-zinc-200">
        <Image
          src={negocio.portada}
          alt={negocio.nombre}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 500px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full grid place-items-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full grid place-items-center shadow-md">
            <Share2 className="w-4 h-4 text-zinc-900" />
          </button>
          <button
            onClick={() => toggleFavorito(id)}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full grid place-items-center shadow-md"
          >
            <Heart className={`w-5 h-5 ${esFav ? 'fill-red-500 text-red-500' : 'text-zinc-900'}`} />
          </button>
        </div>

        {negocio.aceptaAhora && (
          <div className="absolute bottom-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-white" /> Disponible ahora
          </div>
        )}
      </div>

      {/* Cabecera */}
      <div className="px-5 pt-5">
        <span
          className="text-[10px] font-medium uppercase tracking-wide"
          style={{ color: categoria?.color }}
        >
          {categoria?.nombre}
        </span>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 leading-tight">
          {negocio.nombre}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-zinc-600">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <strong className="text-zinc-900">{negocio.rating}</strong>
            <span className="text-zinc-500">({negocio.reviews} reseñas)</span>
          </span>
        </div>

        <p className="mt-4 text-zinc-700 leading-relaxed">{negocio.descripcion}</p>

        <div className="mt-5 space-y-2.5 text-sm">
          <Info icono={MapPin}>
            <div>{negocio.direccion}</div>
            <div className="text-zinc-500">{negocio.barrio} · Cuenca</div>
          </Info>
          <Info icono={Clock}>{negocio.horario}</Info>
          <Info icono={Phone}>
            <a href={`tel:${negocio.telefono}`} className="hover:text-marca-600">
              {negocio.telefono}
            </a>
          </Info>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-7 border-b border-zinc-100 px-5">
        <div className="flex gap-1">
          {['servicios', 'equipo', 'reseñas'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition ${
                tab === t
                  ? 'border-marca-500 text-marca-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 pt-5">
        {tab === 'servicios' && (
          <div className="space-y-2.5">
            {servicios.map((s) => (
              <Link
                key={s.id}
                href={`/reservar/${s.id}`}
                className="block bg-white border border-zinc-100 hover:border-marca-300 rounded-2xl p-4 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900">{s.nombre}</div>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatoDuracion(s.duracion)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900">{formatoUSD(s.precio)}</div>
                    <div className="text-xs text-marca-500 mt-1 flex items-center justify-end gap-0.5 group-hover:gap-1.5 transition-all">
                      Reservar <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'equipo' && (
          <div>
            {empleados.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                Este negocio aún no ha agregado profesionales al panel.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {empleados.map((e) => (
                  <div key={e.id} className="bg-white border border-zinc-100 rounded-2xl p-4 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-marca-100 grid place-items-center text-marca-600 font-semibold">
                      {e.avatar}
                    </div>
                    <div className="mt-3 font-medium text-sm text-zinc-900">{e.nombre}</div>
                    <div className="text-xs text-zinc-500">{e.cargo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reseñas' && (
          <div className="space-y-3">
            <ResenaDemo
              nombre="María Cabrera"
              fecha="hace 3 días"
              rating={5}
              texto="Excelente atención. Reservé desde la app en 30 segundos, llegué y todo estaba listo. ¡Recomendado!"
            />
            <ResenaDemo
              nombre="Pablo Andrade"
              fecha="hace 1 semana"
              rating={5}
              texto="Por fin no tengo que escribir por WhatsApp para hacer una cita. NearUs cambió mi vida."
            />
            <ResenaDemo
              nombre="Andrea Vélez"
              fecha="hace 2 semanas"
              rating={4}
              texto="Buen servicio, ambiente agradable. Volvería sin duda."
            />
          </div>
        )}
      </div>

      {/* CTA fija inferior */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto px-4 pt-3 pb-3 bg-white border-t border-zinc-100"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
      >
        <Link
          href={`/reservar/${servicios[0]?.id || ''}`}
          className="block w-full bg-marca-500 hover:bg-marca-600 text-white text-center font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Reservar ahora
        </Link>
      </div>
    </div>
  )
}

function Info({ icono: Icono, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icono className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
      <div className="text-zinc-700">{children}</div>
    </div>
  )
}

function ResenaDemo({ nombre, fecha, rating, texto }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-marca-100 grid place-items-center text-marca-600 font-semibold text-xs">
            {nombre.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-900">{nombre}</div>
            <div className="text-xs text-zinc-500">{fecha}</div>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-700 leading-relaxed">{texto}</p>
    </div>
  )
}
