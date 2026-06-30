'use client'
import { useState, useRef, useEffect } from 'react'
import { QrCode, Camera, CameraOff, Check, X, AlertCircle, Search } from 'lucide-react'
import { useReservasDemo, obtenerServicioDemo, obtenerEmpleadoDemo } from '@/lib/data/demo-negocio'
import { useSesion } from '@/lib/store-sesion'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD } from '@/lib/utils'

const QR_REGION_ID = 'qr-reader-region'

// Acepta "nearus://reserva/NU-XXXX" o el código pelado y devuelve el código.
function extraerCodigo(texto) {
  if (!texto) return ''
  const limpio = String(texto).trim()
  const m = limpio.match(/([A-Za-z]{2}-[A-Za-z0-9]+)\s*$/)
  if (m) return m[1].toUpperCase()
  return limpio.split('/').pop().toUpperCase()
}

export default function ValidarPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const todas = useReservasDemo()
  const RESERVAS = todas.filter((r) => r.negocioId === negocioId)
  const actualizarReserva = useDatosStore((s) => s.actualizarReserva)

  const [codigoBusqueda, setCodigoBusqueda] = useState('')
  const [resultado, setResultado] = useState(null)
  const [escaneando, setEscaneando] = useState(false)
  const [errorCam, setErrorCam] = useState(null)
  const scannerRef = useRef(null)

  const reservasHoy = RESERVAS.filter((r) => {
    const f = new Date(r.fecha)
    return f.toDateString() === new Date().toDateString() && r.estado === 'confirmada'
  })

  // Busca por código contra los datos más frescos del store (evita closures viejos).
  const buscarPorCodigo = (codigo) => {
    const limpio = extraerCodigo(codigo)
    if (!limpio) return
    const delNegocio = useDatosStore.getState().reservas.filter((r) => r.negocioId === negocioId)
    const encontrada = delNegocio.find((r) => r.codigo === limpio)
    setResultado(encontrada || { error: true, codigo: limpio })
  }

  const detener = async () => {
    const s = scannerRef.current
    scannerRef.current = null
    if (s) {
      try { await s.stop() } catch {}
      try { s.clear() } catch {}
    }
    setEscaneando(false)
  }

  const iniciar = async () => {
    setErrorCam(null)
    setResultado(null)
    setEscaneando(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(QR_REGION_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          buscarPorCodigo(decoded)
          detener()
        },
        () => {} // ignora fallos por frame
      )
    } catch (e) {
      setErrorCam('No pudimos acceder a la cámara. Revisa los permisos del navegador o usa el código manual.')
      setEscaneando(false)
      scannerRef.current = null
    }
  }

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      const s = scannerRef.current
      if (s) {
        try { s.stop().catch(() => {}) } catch {}
      }
    }
  }, [])

  const buscar = () => buscarPorCodigo(codigoBusqueda)

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-white">Check-in con QR</h1>
      <p className="text-sm text-zinc-400">
        Escanea el QR del cliente o introduce el código manualmente
      </p>

      {/* Scanner area */}
      <div className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-5">
        <div className="aspect-square max-w-xs mx-auto bg-zinc-900 rounded-2xl relative overflow-hidden">
          <div id={QR_REGION_ID} className={escaneando ? 'w-full h-full' : 'hidden'} />
          {!escaneando && (
            <div className="absolute inset-0 grid place-items-center text-white/60">
              <div className="text-center">
                <QrCode className="w-20 h-20 mx-auto opacity-50" />
                <p className="mt-3 text-xs opacity-70">Cámara lista</p>
              </div>
            </div>
          )}
        </div>

        {!escaneando ? (
          <button
            onClick={iniciar}
            className="mt-5 w-full bg-marca-500 hover:bg-marca-600 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Iniciar escaneo
          </button>
        ) : (
          <button
            onClick={detener}
            className="mt-5 w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
          >
            <CameraOff className="w-4 h-4" /> Detener
          </button>
        )}

        {errorCam && (
          <div className="mt-3 bg-red-500/10 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">{errorCam}</div>
          </div>
        )}
      </div>

      {/* O ingresar código */}
      <div className="mt-5 bg-nocturno-500 rounded-2xl border border-white/10 p-4">
        <div className="text-xs font-medium text-zinc-200 mb-2">O ingresa el código manualmente</div>
        <div className="flex gap-2">
          <input
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            placeholder="Ej. NU-A4D1X"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-marca-500 focus:bg-nocturno-400"
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
      {resultado && !resultado.error && (
        <TarjetaResultado
          reserva={resultado}
          onCerrar={() => setResultado(null)}
          onConfirmar={(id) => actualizarReserva(id, { estado: 'completada' })}
        />
      )}
      {resultado?.error && <TarjetaError codigo={resultado.codigo} onCerrar={() => setResultado(null)} />}

      {/* Reservas del día */}
      <div className="mt-7">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
          Reservas esperadas hoy
        </div>
        <div className="bg-nocturno-500 rounded-2xl border border-white/10 overflow-hidden">
          {reservasHoy.length === 0 && (
            <div className="p-6 text-center text-sm text-zinc-400">
              No hay reservas confirmadas pendientes para hoy.
            </div>
          )}
          {reservasHoy.map((r) => {
            const servicio = obtenerServicioDemo(r.servicioId)
            const fecha = new Date(r.fecha)
            return (
              <button
                key={r.id}
                onClick={() => setResultado(r)}
                className="w-full flex items-center justify-between gap-3 p-4 border-b border-zinc-50 last:border-b-0 hover:bg-white/5 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-marca-500/15 grid place-items-center text-marca-600 font-semibold text-sm">
                    {String(fecha.getHours()).padStart(2, '0')}{String(fecha.getMinutes()).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{r.cliente.nombre}</div>
                    <div className="text-xs text-zinc-400 truncate">{servicio?.nombre}</div>
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

function TarjetaResultado({ reserva, onCerrar, onConfirmar }) {
  const servicio = obtenerServicioDemo(reserva.servicioId)
  const empleado = obtenerEmpleadoDemo(reserva.empleadoId)
  const fecha = new Date(reserva.fecha)
  const [confirmado, setConfirmado] = useState(reserva.estado === 'completada')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const confirmar = async () => {
    setGuardando(true)
    const { error: err } = await onConfirmar(reserva.id)
    setGuardando(false)
    if (err) { setError(err); return }
    setConfirmado(true)
  }

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
      <p className="text-emerald-100 text-sm">{servicio?.nombre}{empleado ? ` · ${empleado.nombre.split(' ')[0]}` : ''}</p>

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

      {error && (
        <div className="mt-4 bg-white/15 rounded-xl px-3 py-2 text-xs">No se pudo confirmar: {error}</div>
      )}

      <button
        onClick={confirmar}
        disabled={confirmado || guardando}
        className="mt-5 w-full bg-nocturno-500 text-acento-600 hover:bg-emerald-50 disabled:bg-emerald-100 font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" strokeWidth={3} />
        {confirmado ? 'Cliente confirmado' : guardando ? 'Confirmando…' : 'Confirmar entrada'}
      </button>
    </div>
  )
}

function TarjetaError({ codigo, onCerrar }) {
  return (
    <div className="mt-5 bg-red-500/10 border border-red-200 rounded-3xl p-5 animate-slide-up">
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
