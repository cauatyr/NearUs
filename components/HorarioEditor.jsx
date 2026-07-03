'use client'
import { resumenHorario } from '@/lib/utils'

// Opciones de hora en pasos de 30 min (00:00 … 23:30)
const HORAS_OPCIONES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

// Editor de horario por día, controlado.
//   valor:    array de 7 { dia, abierto, apertura, cierre } (orden Lun→Dom)
//   onChange: (nuevoArray) => void
// Funciona igual en mobile y desktop (filas apiladas, selects compactos).
export default function HorarioEditor({ valor, onChange, mostrarResumen = true }) {
  const horario = Array.isArray(valor) ? valor : []

  const setDia = (idx, campos) => {
    onChange(horario.map((d, i) => (i === idx ? { ...d, ...campos } : d)))
  }

  const aplicarATodos = () => {
    const base = horario.find((d) => d.abierto)
    if (!base) return
    onChange(
      horario.map((d) => (d.abierto ? { ...d, apertura: base.apertura, cierre: base.cierre } : d))
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {horario.map((d, i) => (
          <div
            key={d.dia}
            className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition ${
              d.abierto ? 'border-marca-500/30 bg-marca-500/5' : 'border-white/10 bg-white/5'
            }`}
          >
            <button
              type="button"
              onClick={() => setDia(i, { abierto: !d.abierto })}
              className={`shrink-0 w-12 py-1.5 rounded-lg text-xs font-semibold transition ${
                d.abierto ? 'bg-marca-500 text-white' : 'bg-white/10 text-zinc-400'
              }`}
            >
              {d.dia}
            </button>

            {d.abierto ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <SelectHora valor={d.apertura} onChange={(v) => setDia(i, { apertura: v })} />
                <span className="text-zinc-500 text-xs shrink-0">a</span>
                <SelectHora valor={d.cierre} onChange={(v) => setDia(i, { cierre: v })} />
                {d.apertura >= d.cierre && (
                  <span className="text-[10px] text-amber-500 shrink-0">revisa</span>
                )}
              </div>
            ) : (
              <span className="flex-1 text-sm text-zinc-500">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={aplicarATodos}
        className="mt-3 text-xs text-marca-500 hover:text-marca-400 font-medium"
      >
        Aplicar el mismo horario a todos los días abiertos
      </button>

      {mostrarResumen && (
        <div className="mt-4 bg-marca-500/10 border border-marca-500/20 rounded-2xl p-3 text-sm text-marca-700">
          Resumen: <span className="font-semibold">{resumenHorario(horario) || 'Sin horario'}</span>
        </div>
      )}
    </div>
  )
}

function SelectHora({ valor, onChange }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 flex-1 bg-nocturno-400 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-marca-500"
    >
      {HORAS_OPCIONES.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  )
}
