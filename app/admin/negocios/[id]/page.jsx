'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Settings2, ExternalLink, Trash2, AlertTriangle, Loader2, Crown, Zap,
  MapPin, Phone, Clock, User, Star, Calendar, DollarSign, Store, FileCheck
} from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { useSesion } from '@/lib/store-sesion'
import { fetchAdmin, useAdmin } from '@/lib/store-admin'
import { CATEGORIAS } from '@/lib/data/categorias'
import { detectarCiudad } from '@/lib/data/ciudades'
import { formatoUSD, logoPlaceholder, comisionDeReservas, resumenHorario } from '@/lib/utils'

export default function FichaNegocioPage() {
  const { id } = useParams()
  const router = useRouter()

  const negocios = useDatosStore((s) => s.negocios)
  const servicios = useDatosStore((s) => s.servicios)
  const empleados = useDatosStore((s) => s.empleados)
  const reservas = useDatosStore((s) => s.reservas)
  const resenas = useDatosStore((s) => s.resenas)
  const absorberNegocio = useDatosStore((s) => s.absorberNegocio)
  const olvidarNegocio = useDatosStore((s) => s.olvidarNegocio)
  const entrarComoNegocio = useSesion((s) => s.entrarComoNegocio)
  const verFinanzas = useAdmin((s) => s.puede('finanzas.ver'))
  const puedeEditar = useAdmin((s) => s.puede('negocios.editar'))
  const puedeEliminar = useAdmin((s) => s.puede('negocios.eliminar'))
  const puedeGestionar = useAdmin((s) => s.puede('negocios.gestionar'))

  const [dueno, setDueno] = useState(null)
  const [guardando, setGuardando] = useState(null)
  const [error, setError] = useState(null)
  const [modalBorrar, setModalBorrar] = useState(false)

  const negocio = negocios.find((n) => n.id === id)

  const propios = useMemo(() => {
    const misReservas = reservas.filter((r) => r.negocioId === id)
    const { cobradoEnApp, comision } = comisionDeReservas(misReservas)
    const validas = misReservas.filter((r) => r.estado !== 'cancelada')
    return {
      servicios: servicios.filter((s) => s.negocioId === id),
      empleados: empleados.filter((e) => e.negocioId === id),
      reservas: misReservas,
      resenas: resenas.filter((r) => r.negocioId === id),
      ingresos: validas.reduce((s, r) => s + Number(r.precio || 0), 0),
      cobradoEnApp,
      comision,
      canceladas: misReservas.length - validas.length
    }
  }, [id, servicios, empleados, reservas, resenas])

  // El email del dueño sólo existe en auth → viene del servidor.
  useEffect(() => {
    if (!negocio?.ownerUserId) {
      setDueno(null)
      return
    }
    let vivo = true
    fetchAdmin('/api/admin/resumen').then(({ datos }) => {
      if (!vivo || !datos) return
      setDueno(datos.usuarios.find((u) => u.id === negocio.ownerUserId) || null)
    })
    return () => {
      vivo = false
    }
  }, [negocio?.ownerUserId])

  if (!negocio) {
    return (
      <div className="p-5 md:p-8 max-w-3xl">
        <Link href="/admin/negocios" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Negocios
        </Link>
        <div className="mt-6 bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
          <Store className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="mt-3 text-sm text-zinc-400">Este negocio no existe o fue eliminado.</p>
        </div>
      </div>
    )
  }

  const cat = CATEGORIAS.find((c) => c.id === negocio.categoria)
  const ciudad = detectarCiudad(negocio.lat, negocio.lng)

  const alternar = async (campo) => {
    setError(null)
    setGuardando(campo)
    const { datos, error: err } = await fetchAdmin(`/api/admin/negocios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ [campo]: !negocio[campo] })
    })
    setGuardando(null)
    if (err) return setError(err)
    absorberNegocio(datos.negocio)
  }

  const gestionar = () => {
    entrarComoNegocio(negocio.id)
    router.push('/negocio/inicio')
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <Link href="/admin/negocios" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Negocios
      </Link>

      {/* Cabecera */}
      <div className="mt-3 flex items-start gap-4 flex-wrap">
        <div
          className="w-16 h-16 rounded-2xl overflow-hidden shrink-0"
          style={{ backgroundColor: cat?.color || '#2BACE2' }}
        >
          <img src={negocio.logo || logoPlaceholder(negocio.nombre, cat?.color)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2 flex-wrap">
            {negocio.nombre}
            {negocio.destacado && <Crown className="w-5 h-5 text-amber-400" />}
            {negocio.aceptaAhora && <Zap className="w-5 h-5 text-amber-400" />}
          </h1>
          <p className="text-sm text-zinc-400">
            {cat?.nombre} · {negocio.barrio || 'sin barrio'} ·{' '}
            {ciudad ? ciudad.nombre : <span className="text-amber-300">fuera de cobertura</span>}
          </p>
          <p className="text-[11px] text-zinc-600 mt-1 font-mono">{negocio.id}</p>
        </div>
        <div className="flex gap-2">
          {puedeGestionar && (
            <button
              onClick={gestionar}
              className="bg-marca-500 hover:bg-marca-600 text-white font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition"
            >
              <Settings2 className="w-4 h-4" /> Gestionar
            </button>
          )}
          <Link
            href={`/explorar/${negocio.id}`}
            className="bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition"
          >
            <ExternalLink className="w-4 h-4" /> Ver en el app
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Métricas */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metrica icono={Calendar} label="Reservas" valor={propios.reservas.length} pie={`${propios.canceladas} canceladas`} />
        {verFinanzas && (
          <>
            <Metrica icono={DollarSign} label="Facturado" valor={formatoUSD(propios.ingresos)} pie={`${formatoUSD(propios.cobradoEnApp)} en la app`} />
            <Metrica icono={DollarSign} label="Comisión NearUs" valor={formatoUSD(propios.comision)} pie="Sólo pagos in-app" />
          </>
        )}
        <Metrica
          icono={Star}
          label="Reseñas"
          valor={propios.resenas.length}
          pie={negocio.rating ? `${negocio.rating}★ promedio` : 'sin nota'}
        />
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {/* Datos */}
        <Panel titulo="Datos del negocio">
          <Dato icono={MapPin} label="Dirección" valor={negocio.direccion || '—'} />
          <Dato icono={MapPin} label="Coordenadas" valor={`${negocio.lat?.toFixed(6)}, ${negocio.lng?.toFixed(6)}`} />
          <Dato icono={Phone} label="Teléfono" valor={negocio.telefono || '—'} />
          <Dato
            icono={Clock}
            label="Horario"
            valor={negocio.horarioSemanal ? resumenHorario(negocio.horarioSemanal) : negocio.horario || '—'}
          />
          {negocio.descripcion && (
            <p className="text-sm text-zinc-300 leading-relaxed pt-1">{negocio.descripcion}</p>
          )}
        </Panel>

        {/* Dueño + interruptores */}
        <Panel titulo="Acceso y visibilidad">
          <Dato
            icono={User}
            label="Dueño"
            valor={
              negocio.ownerUserId
                ? dueno?.email || 'cuenta vinculada'
                : 'sin dueño — nadie puede entrar al panel'
            }
            alerta={!negocio.ownerUserId}
          />
          <Dato
            icono={FileCheck}
            label="Contrato"
            valor={
              negocio.terminosAceptadosEn
                ? `Aceptado el ${new Date(negocio.terminosAceptadosEn).toLocaleDateString('es-EC')} (v${negocio.terminosVersion || '?'})`
                : 'sin registro de aceptación'
            }
            alerta={!negocio.terminosAceptadosEn}
          />

          {dueno?.ultimoAcceso && (
            <div className="text-[11px] text-zinc-500 -mt-2 pl-7">
              Último acceso: {new Date(dueno.ultimoAcceso).toLocaleString('es-EC')}
            </div>
          )}

          {puedeEditar && (
          <div className="pt-2 space-y-2">
            <BotonEstado
              activo={negocio.aceptaAhora}
              cargando={guardando === 'aceptaAhora'}
              onClick={() => alternar('aceptaAhora')}
              titulo="Acepta clientes ahora"
              nota="Aparece en Near you"
            />
            <BotonEstado
              activo={negocio.destacado}
              cargando={guardando === 'destacado'}
              onClick={() => alternar('destacado')}
              titulo="Destacado (Plan Pro)"
              nota="Corona dorada en la lista"
            />
          </div>
          )}
        </Panel>

        {/* Servicios */}
        <Panel titulo={`Servicios (${propios.servicios.length})`}>
          {propios.servicios.length === 0 ? (
            <Aviso texto="Sin servicios cargados: el negocio NO es reservable todavía." />
          ) : (
            <div className="space-y-1.5">
              {propios.servicios.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-sm bg-white/5 rounded-xl px-3 py-2.5">
                  <span className="text-zinc-200 truncate">{s.nombre}</span>
                  <span className="text-zinc-400 text-xs shrink-0 tabular-nums">
                    {s.duracion} min · {formatoUSD(s.precio)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Equipo */}
        <Panel titulo={`Equipo (${propios.empleados.length})`}>
          {propios.empleados.length === 0 ? (
            <Aviso texto="Sin equipo cargado." />
          ) : (
            <div className="space-y-1.5">
              {propios.empleados.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 text-sm bg-white/5 rounded-xl px-3 py-2.5">
                  <span className="text-zinc-200 truncate">{e.nombre}</span>
                  <span className="text-zinc-400 text-xs shrink-0">{e.cargo || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Últimas reservas */}
      <div className="mt-5">
        <Panel titulo={`Últimas reservas (${propios.reservas.length})`}>
          {propios.reservas.length === 0 ? (
            <Aviso texto="Todavía no recibió reservas." />
          ) : (
            <div className="space-y-1.5">
              {[...propios.reservas]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 10)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 text-sm bg-white/5 rounded-xl px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-zinc-200 truncate">{r.cliente?.nombre || 'Cliente'}</div>
                      <div className="text-[11px] text-zinc-500">
                        {new Date(r.fecha).toLocaleString('es-EC')} · {r.metodoPago === 'inapp' ? 'pago in-app' : 'paga en el local'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {verFinanzas && (
                        <div className="text-white font-medium tabular-nums">{formatoUSD(r.precio)}</div>
                      )}
                      <div className={`text-[11px] ${r.estado === 'cancelada' ? 'text-red-300' : 'text-zinc-500'}`}>
                        {r.estado}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Zona peligrosa */}
      {puedeEliminar && (
      <div className="mt-5 bg-red-500/5 border border-red-500/25 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-red-300 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4" /> Eliminar negocio
        </div>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          Borra el negocio y, en cascada, sus {propios.servicios.length} servicios,{' '}
          {propios.empleados.length} del equipo, {propios.reservas.length} reservas y{' '}
          {propios.resenas.length} reseñas. No se puede deshacer.
        </p>
        <button
          onClick={() => setModalBorrar(true)}
          className="mt-3 bg-red-500/15 hover:bg-red-500/25 text-red-200 font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition"
        >
          <Trash2 className="w-4 h-4" /> Eliminar este negocio
        </button>
      </div>
      )}

      {modalBorrar && (
        <ModalBorrar
          negocio={negocio}
          conteos={propios}
          tieneDueno={!!negocio.ownerUserId}
          emailDueno={dueno?.email}
          onCerrar={() => setModalBorrar(false)}
          onBorrado={() => {
            olvidarNegocio(negocio.id)
            router.push('/admin/negocios')
          }}
        />
      )}
    </div>
  )
}

function Panel({ titulo, children }) {
  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 p-5">
      <div className="text-sm font-semibold text-white">{titulo}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}

function Metrica({ icono: Icono, label, valor, pie }) {
  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 p-4">
      <div className="w-9 h-9 rounded-xl bg-marca-500 text-white grid place-items-center">
        <Icono className="w-4 h-4" />
      </div>
      <div className="mt-3 text-xl font-semibold text-white tabular-nums">{valor}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
      {pie && <div className="text-[10px] text-zinc-500 mt-1.5">{pie}</div>}
    </div>
  )
}

function Dato({ icono: Icono, label, valor, alerta }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono className={`w-4 h-4 shrink-0 mt-0.5 ${alerta ? 'text-amber-400' : 'text-zinc-500'}`} />
      <div className="min-w-0">
        <div className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</div>
        <div className={`text-sm break-words ${alerta ? 'text-amber-300' : 'text-zinc-200'}`}>{valor}</div>
      </div>
    </div>
  )
}

function Aviso({ texto }) {
  return <p className="text-sm text-zinc-500">{texto}</p>
}

function BotonEstado({ activo, cargando, onClick, titulo, nota }) {
  return (
    <button
      onClick={onClick}
      disabled={cargando}
      className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-60 rounded-xl p-3 text-left transition"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{titulo}</div>
        <div className="text-[11px] text-zinc-500">{nota}</div>
      </div>
      {cargando ? (
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
      ) : (
        <div className={`w-11 h-6 rounded-full shrink-0 transition relative ${activo ? 'bg-marca-500' : 'bg-white/15'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${activo ? 'left-[22px]' : 'left-0.5'}`} />
        </div>
      )}
    </button>
  )
}

function ModalBorrar({ negocio, conteos, tieneDueno, emailDueno, onCerrar, onBorrado }) {
  const [texto, setTexto] = useState('')
  const [borrarCuenta, setBorrarCuenta] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [error, setError] = useState(null)

  const puede = texto.trim() === negocio.nombre.trim()

  const borrar = async () => {
    setError(null)
    setBorrando(true)
    const { error: err } = await fetchAdmin(
      `/api/admin/negocios/${negocio.id}${borrarCuenta ? '?cuenta=1' : ''}`,
      { method: 'DELETE' }
    )
    setBorrando(false)
    if (err) return setError(err)
    onBorrado()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3" onClick={onCerrar}>
      <div
        className="bg-nocturno-500 w-full max-w-md rounded-3xl border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 grid place-items-center text-red-300">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">Eliminar {negocio.nombre}</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Se van también {conteos.servicios.length} servicios, {conteos.empleados.length} del equipo,{' '}
          {conteos.reservas.length} reservas y {conteos.resenas.length} reseñas. No hay vuelta atrás.
        </p>

        {tieneDueno && (
          <label className="mt-4 flex items-start gap-2.5 bg-white/5 rounded-xl p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={borrarCuenta}
              onChange={(e) => setBorrarCuenta(e.target.checked)}
              className="mt-0.5 accent-red-500"
            />
            <span className="text-xs text-zinc-300">
              Borrar también la cuenta de acceso {emailDueno ? <strong>({emailDueno})</strong> : ''}.
              Se mantiene si esa cuenta es dueña de otro negocio.
            </span>
          </label>
        )}

        <div className="mt-4">
          <label className="text-xs text-zinc-400">
            Escribí <strong className="text-white">{negocio.nombre}</strong> para confirmar:
          </label>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-red-400 transition"
          />
        </div>

        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={borrar}
            disabled={!puede || borrando}
            className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-white/10 disabled:text-zinc-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {borrando && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
