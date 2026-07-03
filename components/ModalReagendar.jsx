'use client'
import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import {
  siguientesDias, generarHorarios, diasSemanaCorto, ahoraEnCuenca, diaLocalISO
} from '@/lib/utils'

// Modal para que el CLIENTE reagende su reserva. Reusa la misma lógica de
// fecha/hora que la pantalla de reservar (incluye el filtro de fuso de Cuenca).
// onConfirm(fechaISO, hora) — el padre persiste (actualizarReserva).
export default function ModalReagendar({ onClose, onConfirm }) {
  const dias = siguientesDias(14)
  const [fecha, setFecha] = useState(dias[0])
  const [hora, setHora] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const horarios = generarHorarios(9, 19, 30)
  const ocupados = ['10:30', '14:00', '16:30']
  const { fecha: hoyCuenca, minutos: ahoraMin } = ahoraEnCuenca()
  const esHoy = diaLocalISO(fecha) === hoyCuenca
  const filtrados = horarios.filter((h) => {
    if (ocupados.includes(h)) return false
    if (esHoy) {
      const [hh, mm] = h.split(':').map(Number)
      if (hh * 60 + mm <= ahoraMin) return false
    }
    return true
  })

  const confirmar = async () => {
    if (!hora || guardando) return
    setGuardando(true)
    const iso = new Date(`${diaLocalISO(fecha)}T${hora}:00-05:00`).toISOString()
    await onConfirm(iso, hora)
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-[90] max-w-md mx-auto bg-nocturno-500 rounded-t-3xl border-t border-white/10 animate-slide-up">
        <div className="flex justify-center pt-2.5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <h3 className="font-semibold text-white">Reagendar cita</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="px-5 pb-5 max-h-[70vh] overflow-y-auto"
          style={{ paddingBottom: 'calc(1.25rem + var(--safe-bottom))' }}
        >
          <div className="text-xs font-semibold text-zinc-300 mt-2 mb-2">Nueva fecha</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            {dias.map((d) => {
              const sel = d.toDateString() === fecha.toDateString()
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => { setFecha(d); setHora(null) }}
                  className={`shrink-0 w-14 py-2.5 rounded-2xl border-2 transition flex flex-col items-center ${
                    sel ? 'border-marca-500 bg-marca-500 text-white' : 'border-white/10 text-zinc-200'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wide font-medium">{diasSemanaCorto(d)}</span>
                  <span className="text-xl font-semibold leading-tight">{d.getDate()}</span>
                </button>
              )
            })}
          </div>

          <div className="text-xs font-semibold text-zinc-300 mt-5 mb-2">Nuevo horario</div>
          {filtrados.length === 0 ? (
            <div className="text-sm text-zinc-400 py-4 text-center">No quedan horarios para este día.</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {filtrados.map((h) => (
                <button
                  key={h}
                  onClick={() => setHora(h)}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                    hora === h ? 'border-marca-500 bg-marca-500 text-white' : 'border-white/10 text-zinc-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          <button
            disabled={!hora || guardando}
            onClick={confirmar}
            className="mt-6 w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
          >
            {guardando ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Calendar className="w-4 h-4" /> Confirmar nueva fecha</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
