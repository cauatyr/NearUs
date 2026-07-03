'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { ArrowLeft, Clock, Calendar, CreditCard, Wallet, Check } from 'lucide-react'
import {
  obtenerServicio, obtenerNegocio, empleadosDeNegocio
} from '@/lib/data/negocios'
import { useReservas } from '@/lib/store'
import { useCliente } from '@/lib/store-cliente'
import { useDatosStore } from '@/lib/store-datos'
import { formatoUSD, formatoDuracion, siguientesDias, generarHorarios, diasSemanaCorto, ahoraEnCuenca, diaLocalISO, franjaDelDia, horariosDeFranja } from '@/lib/utils'

export default function ReservarPage() {
  const { id } = useParams()
  const router = useRouter()
  const servicio = obtenerServicio(id)
  if (!servicio) return notFound()
  const negocio = obtenerNegocio(servicio.negocioId)
  const empleados = empleadosDeNegocio(servicio.negocioId)

  const [empleado, setEmpleado] = useState(empleados[0]?.id || 'cualquiera')
  const [fecha, setFecha] = useState(siguientesDias(1)[0])
  const [hora, setHora] = useState(null)
  const [pago, setPago] = useState('inapp')
  const [confirmando, setConfirmando] = useState(false)

  const { crearReserva } = useReservas()
  const cliente = useCliente((s) => s.cliente)
  const crearReservaPublica = useDatosStore((s) => s.crearReservaPublica)

  const dias = siguientesDias(14)
  const horariosOcupados = ['10:30', '14:00', '16:30']

  // Horario real del negocio: si tiene horario_semanal configurado, respetamos
  // los días/horas que abre. Si no (negocios viejos), caemos al 09–19 de siempre.
  const franjaHoy = franjaDelDia(negocio.horarioSemanal, fecha)
  const usaHorarioReal = Array.isArray(negocio.horarioSemanal)
  const diaCerrado = usaHorarioReal && (!franjaHoy || !franjaHoy.abierto)
  const horarios = diaCerrado
    ? []
    : usaHorarioReal && franjaHoy
      ? horariosDeFranja(franjaHoy.apertura, franjaHoy.cierre, servicio.duracion, 30)
      : generarHorarios(9, 19, 30)

  // No permitir horarios ya pasados cuando el día elegido es hoy (hora de Cuenca).
  // Compara el día del chip (calendario local que el usuario ve) con el hoy de Cuenca,
  // así funciona aunque el dispositivo esté en otra zona horaria (ej. test desde Brasil).
  const { fecha: hoyCuenca, minutos: ahoraMin } = ahoraEnCuenca()
  const esHoyCuenca = diaLocalISO(fecha) === hoyCuenca
  const horariosFiltrados = horarios.filter((h) => {
    if (horariosOcupados.includes(h)) return false
    if (esHoyCuenca) {
      const [hh, mm] = h.split(':').map(Number)
      if (hh * 60 + mm <= ahoraMin) return false
    }
    return true
  })

  // Días cerrados (para atenuar los chips del calendario)
  const esDiaCerrado = (d) => {
    if (!usaHorarioReal) return false
    const f = franjaDelDia(negocio.horarioSemanal, d)
    return !f || !f.abierto
  }

  // Al cambiar de día, limpiar la hora elegida (evita confirmar un horario inválido).
  useEffect(() => {
    setHora(null)
  }, [fecha])

  const confirmar = () => {
    if (!hora) return
    // Login obligatorio para reservar — si no hay cliente, vamos a /cuenta y volvemos.
    if (!cliente) {
      router.push(`/cuenta?next=${encodeURIComponent('/reservar/' + id)}`)
      return
    }
    setConfirmando(true)
    // Timestamp en hora de Cuenca (UTC-5) para guardar el instante correcto.
    const fechaDia = diaLocalISO(fecha)
    const fechaISO = new Date(`${fechaDia}T${hora}:00-05:00`).toISOString()
    setTimeout(async () => {
      // Copia local — para "Mis reservas" y la pantalla de confirmación del cliente.
      const reserva = crearReserva({
        negocioId: negocio.id,
        servicioId: servicio.id,
        empleadoId: empleado,
        fecha: fechaISO,
        hora,
        duracion: servicio.duracion,
        precio: servicio.precio,
        metodoPago: pago,
        cliente: { nombre: cliente.nombre, celular: cliente.celular },
        modo: 'agendada'
      })
      // Copia en Supabase — para que aparezca en la agenda del negocio (cualquier dispositivo).
      const { error } = await crearReservaPublica({
        id: reserva.id,
        codigo: reserva.codigo,
        negocioId: negocio.id,
        servicioId: servicio.id,
        empleadoId: empleado === 'cualquiera' ? null : empleado,
        fecha: fechaISO,
        duracion: servicio.duracion,
        precio: servicio.precio,
        metodoPago: pago,
        clienteUserId: cliente.id,
        cliente: { nombre: cliente.nombre, celular: cliente.celular }
      })
      if (error) console.warn('No se pudo guardar la reserva en el negocio:', error)
      try { sessionStorage.setItem('nearus-celebrar', reserva.id) } catch (_) {}
      router.push(`/confirmacion/${reserva.id}`)
    }, 600)
  }

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 bg-nocturno-500 border-b border-white/10">
        <div className="h-14 px-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Reservar</div>
            <div className="text-sm font-medium text-white truncate">{negocio.nombre}</div>
          </div>
        </div>
      </header>

      {/* Resumen servicio */}
      <div className="px-5 pt-5">
        <div className="bg-marca-500/10 border border-marca-500/20 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-white">{servicio.nombre}</div>
              <div className="mt-1 text-xs text-zinc-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatoDuracion(servicio.duracion)}
              </div>
            </div>
            <div className="text-xl font-semibold text-marca-600">{formatoUSD(servicio.precio)}</div>
          </div>
        </div>
      </div>

      {/* Profesional */}
      {empleados.length > 0 && (
        <Section titulo="Elige un profesional">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            <ChipPersona
              activo={empleado === 'cualquiera'}
              onClick={() => setEmpleado('cualquiera')}
              avatar="?"
              nombre="Cualquiera"
              cargo="Disponible"
            />
            {empleados.map((e) => (
              <ChipPersona
                key={e.id}
                activo={empleado === e.id}
                onClick={() => setEmpleado(e.id)}
                avatar={e.avatar}
                foto={e.foto}
                nombre={e.nombre.split(' ')[0]}
                cargo={e.cargo}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Fecha */}
      <Section titulo="Selecciona una fecha">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          {dias.map((d) => {
            const sel = d.toDateString() === fecha.toDateString()
            const cerrado = esDiaCerrado(d)
            return (
              <button
                key={d.toISOString()}
                onClick={() => setFecha(d)}
                className={`shrink-0 w-14 py-2.5 rounded-2xl border-2 transition flex flex-col items-center ${
                  sel
                    ? 'border-marca-500 bg-marca-500 text-white'
                    : cerrado
                      ? 'border-white/5 text-zinc-500 opacity-50'
                      : 'border-white/10 hover:border-white/20 text-zinc-200'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wide font-medium">
                  {diasSemanaCorto(d)}
                </span>
                <span className="text-xl font-semibold leading-tight">{d.getDate()}</span>
                {cerrado && !sel && (
                  <span className="text-[8px] uppercase tracking-wide">Cerrado</span>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Hora */}
      <Section titulo="Horarios disponibles">
        {diaCerrado ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-center text-sm text-zinc-400">
            El negocio está <span className="font-medium text-zinc-200">cerrado</span> este día. Elige otra fecha.
          </div>
        ) : horariosFiltrados.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-center text-sm text-zinc-400">
            No quedan horarios disponibles para este día. Prueba con otra fecha.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {horariosFiltrados.map((h) => (
              <button
                key={h}
                onClick={() => setHora(h)}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                  hora === h
                    ? 'border-marca-500 bg-marca-500 text-white'
                    : 'border-white/10 hover:border-white/20 text-zinc-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Pago */}
      <Section titulo="Método de pago">
        <div className="space-y-2">
          <OpcionPago
            activo={pago === 'inapp'}
            onClick={() => setPago('inapp')}
            icono={CreditCard}
            titulo="Pago en la app"
            descripcion="Tarjeta o transferencia · Te pre-autorizamos el monto"
          />
          <OpcionPago
            activo={pago === 'local'}
            onClick={() => setPago('local')}
            icono={Wallet}
            titulo="Pago en el local"
            descripcion="Efectivo, tarjeta o transferencia al llegar"
          />
        </div>
      </Section>

      {/* CTA */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto px-4 pt-3 pb-3 bg-nocturno-500 border-t border-white/10"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
      >
        <button
          disabled={!hora || confirmando}
          onClick={confirmar}
          className="w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
        >
          {confirmando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Confirmando...
            </>
          ) : !hora ? (
            'Selecciona un horario'
          ) : !cliente ? (
            <>
              <Calendar className="w-4 h-4" />
              Inicia sesión para reservar
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Confirmar reserva · {formatoUSD(servicio.precio)}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Section({ titulo, children }) {
  return (
    <div className="mt-7 px-5">
      <h3 className="text-sm font-semibold text-white mb-3">{titulo}</h3>
      {children}
    </div>
  )
}

function ChipPersona({ activo, onClick, avatar, foto, nombre, cargo }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-2.5 rounded-2xl border-2 transition flex items-center gap-2.5 ${
        activo
          ? 'border-marca-500 bg-marca-500/10'
          : 'border-white/10 hover:border-white/20 bg-nocturno-500'
      }`}
    >
      {foto ? (
        <img src={foto} alt={nombre} className="w-9 h-9 rounded-full object-cover border border-white/10" />
      ) : (
        <div className={`w-9 h-9 rounded-full grid place-items-center text-xs font-semibold ${
          activo ? 'bg-marca-500 text-white' : 'bg-white/10 text-zinc-300'
        }`}>
          {avatar}
        </div>
      )}
      <div className="text-left">
        <div className={`text-sm font-medium ${activo ? 'text-marca-700' : 'text-white'}`}>{nombre}</div>
        <div className="text-[10px] text-zinc-400">{cargo}</div>
      </div>
    </button>
  )
}

function OpcionPago({ activo, onClick, icono: Icono, titulo, descripcion }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition ${
        activo
          ? 'border-marca-500 bg-marca-500/10'
          : 'border-white/10 hover:border-white/20 bg-nocturno-500'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${
        activo ? 'bg-marca-500 text-white' : 'bg-white/10 text-zinc-300'
      }`}>
        <Icono className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className={`font-medium text-sm ${activo ? 'text-marca-700' : 'text-white'}`}>{titulo}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{descripcion}</div>
      </div>
      {activo && (
        <div className="w-5 h-5 rounded-full bg-marca-500 grid place-items-center text-white">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}
