'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Zap } from 'lucide-react'
import { CATEGORIAS } from '@/lib/data/categorias'
import { distanciaKm, formatoDistancia } from '@/lib/utils'

export default function TarjetaNegocio({ negocio, usuario, compacta = false }) {
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)
  const distancia = usuario
    ? distanciaKm(usuario.lat, usuario.lng, negocio.lat, negocio.lng)
    : null

  if (compacta) {
    return (
      <Link
        href={`/explorar/${negocio.id}`}
        className="flex items-center gap-3 bg-nocturno-500 rounded-2xl p-3 border border-white/10 hover:border-marca-200 transition"
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0">
          <Image
            src={negocio.imagen}
            alt={negocio.nombre}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: categoria?.color }}>
              {categoria?.nombre}
            </span>
            {negocio.aceptaAhora && (
              <span className="bg-amber-500/15 text-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-amber-700" /> ahora
              </span>
            )}
          </div>
          <div className="font-medium text-sm text-white truncate">{negocio.nombre}</div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {negocio.rating}
            </span>
            <span>·</span>
            <span>{negocio.barrio}</span>
            {distancia && (
              <>
                <span>·</span>
                <span>{formatoDistancia(distancia)}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/explorar/${negocio.id}`}
      className="block bg-nocturno-500 rounded-2xl border border-white/10 hover:border-marca-200 hover:shadow-suave overflow-hidden transition"
    >
      <div className="relative h-32 bg-white/10">
        <Image
          src={negocio.imagen}
          alt={negocio.nombre}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 400px"
        />
        {negocio.aceptaAhora && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Zap className="w-3 h-3 fill-white" /> Disponible ahora
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: categoria?.color }}
          >
            {categoria?.nombre}
          </span>
          <span className="text-xs flex items-center gap-0.5 text-zinc-200">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <strong>{negocio.rating}</strong>
            <span className="text-zinc-400">({negocio.reviews})</span>
          </span>
        </div>
        <h3 className="mt-1 font-semibold text-white leading-snug">{negocio.nombre}</h3>
        <div className="mt-1.5 text-xs text-zinc-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {negocio.barrio}
          {distancia && <span> · {formatoDistancia(distancia)}</span>}
        </div>
      </div>
    </Link>
  )
}
