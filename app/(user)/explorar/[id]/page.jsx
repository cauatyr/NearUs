'use client'
import { useState, useEffect } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, Clock, MapPin, Phone, Heart, Share2, Zap, Calendar, ChevronRight, BadgeCheck, MessageSquare
} from 'lucide-react'
import { obtenerNegocio, serviciosDeNegocio, empleadosDeNegocio } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { useReservas } from '@/lib/store'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD, formatoDuracion, tiempoRelativo } from '@/lib/utils'
import { ImagenSuave } from '@/components/Skeleton'

export default function DetalleNegocio() {
  const { id } = useParams()
  const router = useRouter()
  const negocio = obtenerNegocio(id)
  const servicios = serviciosDeNegocio(id)
  const empleados = empleadosDeNegocio(id)
  const todasResenas = useDatosStore((s) => s.resenas)
  const resenas = todasResenas
    .filter((r) => r.negocioId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const [tab, setTab] = useState('servicios')
  const [scrolled, setScrolled] = useState(false)

  const { favoritos, toggleFavorito } = useReservas()
  const esFav = favoritos.includes(id)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!negocio) return notFound()
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)
  const imagenes = [
    ...new Set([negocio.portada, negocio.imagen, ...(negocio.galeria || [])].filter(Boolean))
  ]

  const compartir = () =>
    navigator.share?.({ title: negocio.nombre, text: `Mira ${negocio.nombre} en NearUs` })

  return (
    <div className="pb-32">
      {/* Header que aparece al hacer scroll */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 max-w-md mx-auto transition-all duration-200 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="h-14 px-3 flex items-center gap-3 bg-nocturno-500/95 backdrop-blur border-b border-white/10">
          <button onClick={() => router.back()} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 font-semibold text-white truncate">{negocio.nombre}</div>
          <button onClick={() => toggleFavorito(id)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10">
            <Heart className={`w-5 h-5 ${esFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
      </div>

      {/* Galería */}
      <Galeria imagenes={imagenes}>
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/45 backdrop-blur rounded-full grid place-items-center shadow-md hover:bg-black/60"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={compartir}
            className="w-10 h-10 bg-black/45 backdrop-blur rounded-full grid place-items-center shadow-md hover:bg-black/60"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => toggleFavorito(id)}
            className="w-10 h-10 bg-black/45 backdrop-blur rounded-full grid place-items-center shadow-md hover:bg-black/60"
          >
            <Heart className={`w-5 h-5 ${esFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
        {negocio.aceptaAhora && (
          <div className="absolute bottom-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-white" /> Disponible ahora
          </div>
        )}
      </Galeria>

      {/* Cabecera */}
      <div className="px-5 pt-5">
        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: categoria?.color }}>
          {categoria?.nombre}
        </span>
        <h1 className="mt-1 text-2xl font-semibold text-white leading-tight">{negocio.nombre}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-zinc-300">
          {negocio.rating ? (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <strong className="text-white">{negocio.rating}</strong>
              <span className="text-zinc-400">({negocio.reviews} reseñas)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-marca-400 font-medium">
              <Star className="w-4 h-4 text-marca-400" /> Nuevo en NearUs
            </span>
          )}
        </div>

        <p className="mt-4 text-zinc-200 leading-relaxed">{negocio.descripcion}</p>

        <div className="mt-5 space-y-2.5 text-sm">
          <Info icono={MapPin}>
            <div>{negocio.direccion}</div>
            <div className="text-zinc-400">{negocio.barrio} · Cuenca</div>
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
      <div className="mt-7 border-b border-white/10 px-5">
        <div className="flex gap-1">
          {['servicios', 'equipo', 'reseñas'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-marca-500 text-marca-500' : 'border-transparent text-zinc-400 hover:text-white'
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
                className="block bg-nocturno-500 border border-white/10 hover:border-marca-300 active:scale-[0.99] rounded-2xl p-4 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  {s.foto && (
                    <img
                      src={s.foto}
                      alt={s.nombre}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{s.nombre}</div>
                    <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatoDuracion(s.duracion)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{formatoUSD(s.precio)}</div>
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
              <div className="text-center py-10 text-zinc-400 text-sm">
                Este negocio aún no ha agregado profesionales al panel.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {empleados.map((e) => (
                  <div key={e.id} className="bg-nocturno-500 border border-white/10 rounded-2xl p-4 text-center">
                    {e.foto ? (
                      <img
                        src={e.foto}
                        alt={e.nombre}
                        className="w-14 h-14 mx-auto rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 mx-auto rounded-full bg-marca-500/15 grid place-items-center text-marca-600 font-semibold">
                        {e.avatar}
                      </div>
                    )}
                    <div className="mt-3 font-medium text-sm text-white">{e.nombre}</div>
                    <div className="text-xs text-zinc-400">{e.cargo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reseñas' &&
          (resenas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto bg-white/10 rounded-full grid place-items-center text-zinc-400">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Aún no hay reseñas</h3>
              <p className="mt-1 text-sm text-zinc-400">Sé el primero en reseñar después de tu cita.</p>
            </div>
          ) : (
            <div>
              <ResumenResenas resenas={resenas} rating={negocio.rating} />
              <div className="space-y-3">
                {resenas.map((r) => (
                  <Resena
                    key={r.id}
                    nombre={r.clienteNombre}
                    fecha={tiempoRelativo(r.createdAt)}
                    rating={r.rating}
                    texto={r.comentario}
                    verificado={!!r.reservaId}
                    respuesta={r.respuesta}
                    respuestaFecha={r.respuestaAt ? tiempoRelativo(r.respuestaAt) : null}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* CTA fija inferior */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto px-4 pt-3 pb-3 bg-nocturno-500 border-t border-white/10"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
      >
        <Link
          href={`/reservar/${servicios[0]?.id || ''}`}
          className="block w-full bg-marca-500 hover:bg-marca-600 active:scale-[0.98] text-white text-center font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Reservar ahora
        </Link>
      </div>
    </div>
  )
}

function Galeria({ imagenes, children }) {
  const [idx, setIdx] = useState(0)
  const onScroll = (e) => {
    const w = e.currentTarget.clientWidth || 1
    setIdx(Math.round(e.currentTarget.scrollLeft / w))
  }
  return (
    <div className="relative h-64 bg-white/10">
      <div onScroll={onScroll} className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {imagenes.map((src, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-center">
            <ImagenSuave src={src} alt="" sizes="(max-width:768px) 100vw, 500px" priority={i === 0} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
      {children}
      {imagenes.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {imagenes.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ResumenResenas({ resenas, rating }) {
  const total = resenas.length
  const conteo = [5, 4, 3, 2, 1].map((s) => resenas.filter((r) => r.rating === s).length)
  const max = Math.max(...conteo, 1)
  return (
    <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-4 mb-3 flex gap-5">
      <div className="text-center shrink-0">
        <div className="text-4xl font-extrabold text-white leading-none">{rating ?? '—'}</div>
        <div className="flex gap-0.5 mt-1.5 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.round(rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-zinc-600'}`}
            />
          ))}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">{total} reseñas</div>
      </div>
      <div className="flex-1 self-center space-y-1.5">
        {[5, 4, 3, 2, 1].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 w-2">{s}</span>
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(conteo[i] / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Info({ icono: Icono, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icono className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
      <div className="text-zinc-200">{children}</div>
    </div>
  )
}

function Resena({ nombre, fecha, rating, texto, verificado, respuesta, respuestaFecha }) {
  const iniciales = (nombre || 'C').split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-marca-500/15 grid place-items-center text-marca-600 font-semibold text-xs">
            {iniciales}
          </div>
          <div>
            <div className="text-sm font-medium text-white flex items-center gap-1">
              {nombre}
              {verificado && (
                <span title="Cliente verificado">
                  <BadgeCheck className="w-3.5 h-3.5 text-marca-500" />
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400">{fecha}</div>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-600'}`} />
          ))}
        </div>
      </div>
      {texto && <p className="mt-3 text-sm text-zinc-200 leading-relaxed">{texto}</p>}

      {respuesta && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-marca-500/30">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-marca-500">
            <MessageSquare className="w-3 h-3" /> Respuesta del negocio
            {respuestaFecha && <span className="text-zinc-500 font-normal">· {respuestaFecha}</span>}
          </div>
          <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{respuesta}</p>
        </div>
      )}
    </div>
  )
}
