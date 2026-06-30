'use client'
import { Sparkles } from 'lucide-react'
import { formatoUSD } from '@/lib/utils'

export default function PromocionPage() {
  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Promoción</h1>
        <p className="text-sm text-zinc-400">
          Haz que más clientes encuentren tu negocio
        </p>
      </div>

      {/* Plan Pro — único plan, un solo beneficio */}
      <div className="relative mt-7 bg-gradient-to-br from-black via-nocturno-500 to-marca-700 text-white rounded-3xl p-6 shadow-flotante overflow-hidden flex flex-col">
        {/* Decoración */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-marca-400/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 grid place-items-center shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-950 fill-amber-950" />
            </div>
            <h3 className="text-lg font-extrabold">Plan Pro</h3>
          </div>
          <p className="text-sm text-zinc-300 mt-1">Tu negocio siempre destacado</p>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">{formatoUSD(19.99)}</span>
            <span className="text-sm text-zinc-300">/ mes</span>
          </div>
          <div className="mt-1 text-xs text-amber-300 font-medium">
            ⚡ Promo: {formatoUSD(9.99)} los primeros 3 meses
          </div>
        </div>

        {/* Visualización del beneficio único */}
        <div className="relative mt-6 bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 flex-1 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            El único beneficio
          </div>

          <div className="mt-3 flex items-center justify-center py-4">
            <PreviewMarcadorBrillo />
          </div>

          <h4 className="text-center text-xl font-extrabold leading-tight">
            Tu negocio destacado en el mapa
          </h4>
          <p className="text-center text-sm text-zinc-300 mt-2 leading-relaxed">
            Aparece con un <strong className="text-amber-300">brillo dorado</strong> visible para
            todos los usuarios de NearUs. Posicionado primero en los resultados.
            Más visualizaciones, más reservas.
          </p>
        </div>

        <button className="relative mt-6 w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold py-3 rounded-full transition shadow-marca">
          Activar Pro
        </button>
        <p className="relative mt-2 text-center text-[10px] text-zinc-400">
          Sin permanencia · Cancela cuando quieras
        </p>
      </div>

      {/* Aclaración */}
      <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-marca-500 shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-200 leading-relaxed">
          <strong className="text-white">El plan Pro tiene un único beneficio:</strong> tu negocio
          aparece <strong>destacado en el mapa con un brillo dorado</strong> mientras pagues la
          suscripción mensual. Todas las demás funciones (agenda, reservas, reportes, equipo,
          QR) están incluidas de forma gratuita.
        </div>
      </div>
    </div>
  )
}

function PreviewMarcadorBrillo() {
  return (
    <div className="relative">
      <svg width="40" height="40" viewBox="0 0 32 32" className="mx-auto mb-1 animate-pulse">
        <defs>
          <linearGradient id="brillo-preview" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 C17.2 11 21 14.8 30 16 C21 17.2 17.2 21 16 30 C14.8 21 11 17.2 2 16 C11 14.8 14.8 11 16 2 Z"
          fill="url(#brillo-preview)"
          stroke="#B45309"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M25.5 3 C25.8 5.4 26.6 6.2 29 6.5 C26.6 6.8 25.8 7.6 25.5 10 C25.2 7.6 24.4 6.8 22 6.5 C24.4 6.2 25.2 5.4 25.5 3 Z"
          fill="#FEF3C7"
        />
      </svg>
      {/* Marcador estilo NearUs debajo */}
      <div className="mx-auto" style={{ width: 64 }}>
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-md animate-pulso" />
          <div className="relative w-16 h-16 rounded-full bg-marca-500 border-[5px] border-amber-400 grid place-items-center shadow-2xl">
            <span className="text-3xl">✂️</span>
          </div>
        </div>
        <div className="mx-auto mt-[-2px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-marca-500" />
      </div>
    </div>
  )
}
