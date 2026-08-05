'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, MapPin, Zap, Heart } from 'lucide-react'
import { CATEGORIAS } from '@/lib/data/categorias'
import { serviciosDeNegocio } from '@/lib/data/negocios'
import { useReservas } from '@/lib/store'
import { distanciaKm, formatoDistancia, formatoUSD, horarioAbierto, horarioAbiertoDeSemanal } from '@/lib/utils'
import { ImagenSuave } from '@/components/Skeleton'

// Botón de favorito con animación de "pop". Reutilizado en las dos variantes.
function BotonFav({ negocioId, size = 'md' }) {
  const favoritos = useReservas((s) => s.favoritos)
  const toggleFavorito = useReservas((s) => s.toggleFavorito)
  const esFav = favoritos.includes(negocioId)
  const [pop, setPop] = useState(false)
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const ic = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorito(negocioId)
        setPop(true)
        setTimeout(() => setPop(false), 400)
      }}
      className={`${dim} rounded-full bg-black/45 backdrop-blur grid place-items-center hover:bg-black/60 transition`}
      aria-label="Favorito"
    >
      <Heart className={`${ic} ${esFav ? 'fill-red-500 text-red-500' : 'text-white'} ${pop ? 'animate-pop' : ''}`} />
    </button>
  )
}

function datos(negocio, usuario) {
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)
  const distancia = usuario ? distanciaKm(usuario.lat, usuario.lng, negocio.lat, negocio.lng) : null
  const precios = serviciosDeNegocio(negocio.id).map((s) => s.precio)
  const precioDesde = precios.length ? Math.min(...precios) : null
  // El horario estructurado sabe de días y de pausa de almuerzo; el texto no.
  // Sólo caemos al texto cuando el negocio todavía no configuró su horario.
  const abierto = horarioAbiertoDeSemanal(negocio.horarioSemanal) ?? horarioAbierto(negocio.horario)
  return { categoria, distancia, precioDesde, abierto }
}

export default function TarjetaNegocio({ negocio, usuario, compacta = false }) {
  const { categoria, distancia, precioDesde, abierto } = datos(negocio, usuario)

  if (compacta) {
    return (
      <Link
        href={`/explorar/${negocio.id}`}
        className="group flex items-center gap-3 bg-nocturno-500 rounded-2xl p-2.5 border border-white/10 hover:border-white/20 active:scale-[0.98] transition"
      >
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0">
          <ImagenSuave src={negocio.imagen} alt={negocio.nombre} sizes="64px" />
          {negocio.aceptaAhora && (
            <span className="absolute bottom-0.5 left-0.5 bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">
              AHORA
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: categoria?.color }}>
              {categoria?.nombre}
            </span>
            {abierto !== null && (
              <span className={`text-[9px] font-bold ${abierto ? 'text-acento-500' : 'text-zinc-500'}`}>
                {abierto ? 'Abierto' : 'Cerrado'}
              </span>
            )}
          </div>
          <div className="font-semibold text-sm text-white truncate">{negocio.nombre}</div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {negocio.rating ?? 'Nuevo'}
            </span>
            <span>·</span>
            <span className="truncate">
              {negocio.barrio}
              {distancia && ` · ${formatoDistancia(distancia)}`}
            </span>
          </div>
          {precioDesde != null && (
            <div className="text-[11px] text-zinc-400">
              desde <strong className="text-zinc-200">{formatoUSD(precioDesde)}</strong>
            </div>
          )}
        </div>
        <div className="shrink-0">
          <BotonFav negocioId={negocio.id} size="sm" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/explorar/${negocio.id}`}
      className="group block bg-nocturno-500 rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 active:scale-[0.98] transition"
    >
      <div className="relative h-36 bg-white/10">
        <ImagenSuave src={negocio.imagen} alt={negocio.nombre} sizes="(max-width:768px) 90vw, 400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute top-2 left-2 bg-black/55 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {negocio.rating ?? 'Nuevo'}
        </div>
        <div className="absolute top-2 right-2">
          <BotonFav negocioId={negocio.id} />
        </div>
        {negocio.aceptaAhora && (
          <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Zap className="w-3 h-3 fill-white" /> Disponible ahora
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: categoria?.color }}>
            {categoria?.nombre}
          </span>
          {abierto !== null && (
            <span className={`text-[10px] font-bold ${abierto ? 'text-acento-500' : 'text-zinc-500'}`}>
              {abierto ? '● Abierto' : '● Cerrado'}
            </span>
          )}
        </div>
        <h3 className="mt-1 font-bold text-white leading-snug truncate">{negocio.nombre}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-400 flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {negocio.barrio}
              {distancia && ` · ${formatoDistancia(distancia)}`}
            </span>
          </div>
          {precioDesde != null && (
            <div className="text-xs text-zinc-300 shrink-0">
              desde <strong className="text-white">{formatoUSD(precioDesde)}</strong>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
