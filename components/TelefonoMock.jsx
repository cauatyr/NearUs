'use client'
import dynamic from 'next/dynamic'
import { MapPin, Star, Calendar, Wifi, BatteryFull, SignalHigh, Navigation } from 'lucide-react'

// El mapa (MapLibre) sólo corre en cliente → dynamic ssr:false, con placeholder
// para que no haya salto de layout mientras carga.
const HeroMapa = dynamic(() => import('./HeroMapa'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-nocturno-500 to-nocturno-600" />
})

const NEGOCIOS_MOCK = [
  { n: 'Don Carlos Barbería', c: 'Barbería · 0.4 km', r: '4.9', ini: 'DC', color: '#0F6E56', chip: 'Abierto', chipTono: 'acento' },
  { n: 'Estilo Andino Salón', c: 'Cabello · 0.8 km', r: '4.8', ini: 'EA', color: '#534AB7', chip: 'Reservar', chipTono: 'marca' }
]

export default function TelefonoMock() {
  return (
    <div className="relative w-[270px] rounded-[2.75rem] bg-gradient-to-b from-zinc-700 to-zinc-900 p-2.5 shadow-flotante ring-1 ring-white/10">
      {/* Botones laterales */}
      <div className="absolute -left-1 top-24 w-1 h-12 rounded-l bg-zinc-700" />
      <div className="absolute -left-1 top-40 w-1 h-16 rounded-l bg-zinc-700" />
      <div className="absolute -right-1 top-32 w-1 h-20 rounded-r bg-zinc-700" />

      {/* Pantalla */}
      <div className="relative rounded-[2.25rem] bg-nocturno-700 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-30" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1.5 text-[10px] font-semibold text-white/90">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <SignalHigh className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryFull className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="px-3 pb-4">
          {/* Encabezado */}
          <div className="flex items-center justify-between mt-1 mb-2.5">
            <div>
              <div className="text-[9px] text-zinc-400 uppercase tracking-wide">Cerca de ti</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-marca-500" /> Cuenca
              </div>
            </div>
            <div className="text-[9px] font-semibold bg-acento-500/15 text-acento-500 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-acento-500 animate-pulso" /> En vivo
            </div>
          </div>

          {/* Mapa REAL (sin etiquetas) */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10">
            <HeroMapa />
            <div className="absolute top-2 left-2 z-10 text-[9px] text-white/80 font-medium bg-black/40 backdrop-blur px-1.5 py-0.5 rounded-md pointer-events-none">
              Centro Histórico
            </div>
          </div>

          {/* Cards de negocios */}
          <div className="mt-3 space-y-2">
            {NEGOCIOS_MOCK.map((b) => (
              <div key={b.n} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/10">
                <div
                  className="w-9 h-9 rounded-lg grid place-items-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}cc)` }}
                >
                  {b.ini}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{b.n}</div>
                  <div className="text-[9px] text-zinc-400">{b.c}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="text-[9px] flex items-center gap-0.5 text-zinc-200">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {b.r}
                  </div>
                  <span
                    className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                      b.chipTono === 'acento' ? 'bg-acento-500/15 text-acento-500' : 'bg-marca-500/15 text-marca-400'
                    }`}
                  >
                    {b.chip}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Barra inferior tipo nav */}
          <div className="mt-3 flex items-center justify-around bg-white/[0.03] border border-white/10 rounded-2xl py-2">
            <MapPin className="w-4 h-4 text-marca-500" />
            <Navigation className="w-4 h-4 text-zinc-500" />
            <Calendar className="w-4 h-4 text-zinc-500" />
            <Star className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
