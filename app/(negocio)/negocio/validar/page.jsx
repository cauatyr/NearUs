'use client'
import { useState } from 'react'
import { QrCode, Camera, Check, X, AlertCircle, Search } from 'lucide-react'
import { RESERVAS_DEMO, obtenerServicioDemo, obtenerEmpleadoDemo } from '@/lib/data/demo-negocio'
import { formatoUSD } from '@/lib/utils'

export default function ValidarPage() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('')
  const [resultado, setResultado] = useState(null)
  const [escaneando, setEscaneando] = useState(false)

  const reservasHoy = RESERVAS_DEMO.filter((r) => {
    const f = new Date(r.fecha)
    return f.toDateString() === new Date().toDateString() && r.estado === 'confirmada'
  })

  const buscar = () => {
    const limpio = codigoBusqueda.trim().toUpperCase()
    if (!limpio) return
    const encontrada = RESERVAS_DEMO.find((r) => r.codigo === limpio)
    setResultado(encontrada || { error: true, codigo: limpio })
  }

  const simularEscaneo = () => {
    setEscaneando(true)
    setTimeout(() => {
      const aleatoria = reservasHoy[Math.floor(Math.random() * reservasHoy.length)]
      setResultado(aleatoria)
      setEscaneando(false)
    }, 1800)
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Check-in con QR</h1>
      <p className="text-sm text-zinc-500">
        Escanea el QR del cliente o introduce el código manualmente
      </p>

      {/* Scanner area */}
      <div className="mt-7 bg-white rounded-3xl border border-zinc-100 p-5">
        <div className="aspect-square max-w-xs mx-auto bg-zinc-900 rounded-2xl relative overflow-hidden">
          {escaneando ? (
            <>
              {/* Marco escaneo */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-2xl">
                <div className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-marca-300 rounded-tl-2xl" />
                <div className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-marca-300 rounded-tr-2xl" />
                <div className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-marca-300 rounded-bl-2xl" />
                <div className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-marca-300 rounded-br-2xl" />
              </div>
              {/* Línea animada */}
              <div
                className="absolute left-8 right-8 h-0.5 bg-marca-300 shadow-[0_0_12px_2px_rgba(83,74,183,0.8)]"
                style={{
                  animation: 'escaner 1.6s ease-in-out infinite alternate',
                  top: '30%'
                }}
              />
              <style>{`
                @keyframes escaner {
                  from { top: 25%; }
                  to { top: 75%; }
                }
              `}</style>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs">
                Escaneando...
              </div>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/60">
              <div className="text-center">
                <QrCode className="w-20 h-20 mx-auto opacity-50" />
                <p className="mt-3 text-xs opacity-70">Cámara lista</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={simularEscaneo}
          disabled={escaneando}
          className="mt-5 w-full bg-marca-500 hover:bg-marca-600 disabled:bg-zinc-200 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          {escaneando ? 'Escaneando...' : 'Iniciar escaneo'}
        </button>
      </div>

      {/* O ingresar código */}
      <div className="mt-5 bg-white rounded-2xl border border-zinc-100 p-4">
        <div className="text-xs font-medium text-zinc-700 mb-2">O ingresa el código manualmente</div>
        <div className="flex gap-2">
          <input
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            placeholder="Ej. NU-A4D1X"
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-marca-500 focus:bg-white"
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button
            onClick={buscar}
            className="bg-marca-500 hover:bg-marca-600 text-white rounded-xl px-4 text-sm font-medium flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" /> Validar
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && !resultado.error && <TarjetaResultado reserva={resultado} onCerrar={() => setResultado(null)} />}
      {resultado?.error && <TarjetaError codigo={resultado.codigo} onCerrar={() => setResultado(null)} />}

      {/* Reservas del día */}
      <div className="mt-7">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
          Reservas esperadas hoy
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          {reservasHoy.map((r) => {
            const servicio = obtenerServicioDemo(r.servicioId)
            const fecha = new Date(r.fecha)
            return (
              <button
                key={r.id}
                onClick={() => setResultado(r)}
                className="w-full flex items-center justify-between gap-3 p-4 border-b border-zinc-50 last:border-b-0 hover:bg-zinc-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-marca-100 grid place-items-center text-marca-600 font-semibold text-sm">
                    {String(fecha.getHours()).padStart(2, '0')}{String(fecha.getMinutes()).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-zinc-900 truncate">{r.cliente.nombre}</div>
                    <div className="text-xs text-zinc-500 truncate">{servicio?.nombre}</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-zinc-400">{r.codigo}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TarjetaResultado({ reserva, onCerrar }) {
  const servicio = obtenerServicioDemo(reserva.servicioId)
  const empleado = obtenerEmpleadoDemo(reserva.empleadoId)
  const fecha = new Date(reserva.fecha)
  const [confirmado, setConfirmado] = useState(false)

  return (
    <div className="mt-5 bg-acento-500 text-white rounded-3xl p-6 shadow-flotante animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
          <Check className="w-4 h-4" /> Reserva válida
        </div>
        <button onClick={onCerrar} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 font-mono text-lg font-semibold">{reserva.codigo}</div>
      <h3 className="mt-3 text-2xl font-semibold">{reserva.cliente.nombre}</h3>
      <p className="text-emerald-100 text-sm">{servicio?.nombre} · {empleado?.nombre.split(' ')[0]}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-emerald-100">Hora</div>
          <div className="font-semibold mt-0.5">{String(fecha.getHours()).padStart(2, '0')}:{String(fecha.getMinutes()).padStart(2, '0')}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-emerald-100">Duración</div>
          <div className="font-semibold mt-0.5">{reserva.duracion} min</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-emerald-100">Total</div>
          <div className="font-semibold mt-0.5">{formatoUSD(reserva.precio)}</div>
        </div>
      </div>

      <button
        onClick={() => setConfirmado(true)}
        disabled={confirmado}
        className="mt-5 w-full bg-white text-acento-600 hover:bg-emerald-50 disabled:bg-emerald-100 font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" strokeWidth={3} />
        {confirmado ? 'Cliente confirmado' : 'Confirmar entrada'}
      </button>
    </div>
  )
}

function TarjetaError({ codigo, onCerrar }) {
  return (
    <div className="mt-5 bg-red-50 border border-red-200 rounded-3xl p-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-700 font-semibold">
          <AlertCircle className="w-5 h-5" /> Código no válido
        </div>
        <button onClick={onCerrar} className="text-red-400 hover:text-red-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-2 text-sm text-red-700">
        No encontramos ninguna reserva con el código <strong>{codigo}</strong>. Verifica con el cliente.
      </p>
    </div>
  )
}
