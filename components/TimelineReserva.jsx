'use client'
import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { estadoReserva } from '@/lib/utils'

const PASOS = ['Confirmada', 'Hoy', 'En progreso', 'Completada']

// Línea de tiempo "en vivo" de la reserva (estilo tracking de Uber).
// Se recalcula sola cada 30s para que el contador baje sin recargar.
export default function TimelineReserva({ reserva }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const est = estadoReserva(reserva)
  const cancelada = est.clave === 'cancelada'

  return (
    <div className="bg-nocturno-500 rounded-3xl border border-white/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {cancelada && <X className="w-4 h-4 text-red-400 shrink-0" strokeWidth={3} />}
            <span className={`text-base font-semibold ${cancelada ? 'text-red-400' : 'text-white'}`}>
              {est.etiqueta}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">{est.detalle}</div>
        </div>
        {est.cuenta && (
          <span className="shrink-0 bg-marca-500/15 text-marca-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            {est.cuenta}
          </span>
        )}
      </div>

      {!cancelada && (
        <div className="mt-6 flex items-start">
          {PASOS.map((label, i) => {
            const hecho = i <= est.paso
            const actual = i === est.paso
            return (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${
                      i <= est.paso ? 'bg-marca-500' : 'bg-white/10'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full grid place-items-center border-2 transition ${
                    hecho ? 'bg-marca-500 border-marca-500' : 'bg-nocturno-500 border-white/20'
                  } ${actual ? 'ring-4 ring-marca-500/25' : ''}`}
                >
                  {hecho && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span
                  className={`mt-2 text-[10px] text-center leading-tight ${
                    actual ? 'text-white font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
