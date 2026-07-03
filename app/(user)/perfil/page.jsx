'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Heart, Star, ChevronRight, Settings, LogOut, Pencil, BadgeCheck } from 'lucide-react'
import ModalEditarPerfil from '@/components/ModalEditarPerfil'
import { useReservas } from '@/lib/store'
import { useCliente } from '@/lib/store-cliente'
import { useDatosStore } from '@/lib/store-datos'
import { obtenerNegocio, obtenerServicio, useNegocios } from '@/lib/data/negocios'
import { formatoUSD, mesCorto, diasSemanaCorto, estadoReserva } from '@/lib/utils'
import TarjetaNegocio from '@/components/TarjetaNegocio'
import Billetera from '@/components/Billetera'
import { useUbicacion } from '@/lib/store'

export default function PerfilPage() {
  const [tab, setTab] = useState('reservas')
  const [editando, setEditando] = useState(false)
  const { favoritos } = useReservas()
  const { posicion } = useUbicacion()
  const NEGOCIOS = useNegocios()
  const cliente = useCliente((s) => s.cliente)
  const cerrarSesion = useCliente((s) => s.cerrarSesion)

  // Reservas del cliente desde Supabase (ligadas a su cuenta — cross-device).
  const todasReservas = useDatosStore((s) => s.reservas)
  const reservas = useMemo(
    () => (cliente ? todasReservas.filter((r) => r.clienteUserId === cliente.id) : []),
    [todasReservas, cliente]
  )

  const iniciales = cliente
    ? cliente.nombre.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'IN'

  const activas = reservas.filter((r) => r.estado === 'confirmada')
  const pasadas = reservas.filter((r) => r.estado !== 'confirmada')
  const favoritosNegocios = NEGOCIOS.filter((n) => favoritos.includes(n.id))

  return (
    <div className="pb-24">
      {/* Cabecera premium (oscura + glow de marca) */}
      <div className="relative overflow-hidden px-5 pt-10 pb-14">
        <div
          className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(43,172,226,0.22), transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -top-10 left-0 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)' }}
        />

        {/* Acciones */}
        <div className="relative flex justify-end gap-2">
          {cliente && (
            <button
              onClick={() => setEditando(true)}
              title="Editar perfil"
              className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-zinc-200 hover:bg-white/20 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={cliente ? cerrarSesion : undefined}
            title={cliente ? 'Cerrar sesión' : 'Ajustes'}
            className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-zinc-200 hover:bg-white/20 transition"
          >
            {cliente ? <LogOut className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </button>
        </div>

        {/* Avatar + identidad */}
        <div className="relative mt-2 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-marca-500/15 grid place-items-center text-2xl font-bold text-marca-300 ring-2 ring-marca-500/40 shrink-0">
            {cliente?.foto ? (
              <img src={cliente.foto} alt="" className="w-full h-full object-cover" />
            ) : (
              iniciales
            )}
          </div>
          <div className="min-w-0">
            {cliente ? (
              <>
                <h1 className="text-xl font-bold text-white truncate">{cliente.nombre}</h1>
                <span className="inline-flex items-center gap-1 mt-1 bg-marca-500/15 text-marca-300 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-marca-500/25">
                  <BadgeCheck className="w-3.5 h-3.5" /> Cliente verificado
                </span>
                <p className="mt-1.5 text-sm text-zinc-400 truncate">{cliente.email}</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white">Invitado</h1>
                <Link
                  href="/cuenta"
                  className="mt-2 inline-block bg-marca-500 hover:bg-marca-600 transition rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Iniciar sesión o crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-6">
        <div className="bg-nocturno-500 rounded-2xl border border-white/10 shadow-suave grid grid-cols-3 divide-x divide-white/10">
          <Stat valor={reservas.length} label="Reservas" />
          <Stat valor={favoritos.length} label="Favoritos" />
          <Stat valor={pasadas.length} label="Visitas" />
        </div>
      </div>

      {/* Billetera (saldo + recarga + movimientos) */}
      <Billetera />

      {/* Tabs */}
      <div className="px-5 mt-7">
        <div className="bg-white/10 rounded-full p-1 grid grid-cols-2 gap-1">
          <TabBtn activo={tab === 'reservas'} onClick={() => setTab('reservas')}>
            Reservas
          </TabBtn>
          <TabBtn activo={tab === 'favoritos'} onClick={() => setTab('favoritos')}>
            Favoritos
          </TabBtn>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-5 mt-5 space-y-3">
        {tab === 'reservas' && (
          <>
            {activas.length === 0 && pasadas.length === 0 ? (
              <EstadoVacio
                icono={Calendar}
                titulo="Aún no tienes reservas"
                texto="Explora servicios cerca de ti y reserva en segundos."
                accion={{ texto: 'Explorar servicios', href: '/explorar' }}
              />
            ) : (
              <>
                {activas.length > 0 && (
                  <>
                    <SubTitulo>Próximas</SubTitulo>
                    {activas.map((r) => (
                      <ItemReserva key={r.id} reserva={r} />
                    ))}
                  </>
                )}
                {pasadas.length > 0 && (
                  <>
                    <SubTitulo>Anteriores</SubTitulo>
                    {pasadas.map((r) => (
                      <ItemReserva key={r.id} reserva={r} />
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {tab === 'favoritos' && (
          <>
            {favoritosNegocios.length === 0 ? (
              <EstadoVacio
                icono={Heart}
                titulo="Sin favoritos por ahora"
                texto="Guarda los negocios que más te gustan para reservar más rápido."
                accion={{ texto: 'Descubrir negocios', href: '/explorar' }}
              />
            ) : (
              favoritosNegocios.map((n) => (
                <TarjetaNegocio key={n.id} negocio={n} usuario={posicion} compacta />
              ))
            )}
          </>
        )}
      </div>

      {editando && <ModalEditarPerfil onClose={() => setEditando(false)} />}
    </div>
  )
}

function Stat({ valor, label }) {
  return (
    <div className="text-center p-4">
      <div className="text-2xl font-semibold text-white">{valor}</div>
      <div className="text-[11px] text-zinc-400 mt-0.5">{label}</div>
    </div>
  )
}

function TabBtn({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-full text-sm font-medium transition ${
        activo ? 'bg-nocturno-500 text-white shadow-sm' : 'text-zinc-400'
      }`}
    >
      {children}
    </button>
  )
}

function SubTitulo({ children }) {
  return <div className="text-[11px] uppercase tracking-wide text-zinc-400 font-medium pt-1">{children}</div>
}

function ItemReserva({ reserva }) {
  const negocio = obtenerNegocio(reserva.negocioId)
  const servicio = obtenerServicio(reserva.servicioId)
  const fecha = new Date(reserva.fecha)
  const hora =
    reserva.hora ||
    `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
  const est = estadoReserva(reserva)
  const colorEstado = {
    confirmada: 'bg-marca-500/15 text-marca-700',
    completada: 'bg-acento-500 text-white',
    cancelada: 'bg-white/10 text-zinc-300'
  }[reserva.estado]
  // Para reservas confirmadas mostramos el estado "en vivo" (Te esperan hoy / En progreso).
  const textoEstado =
    reserva.estado === 'confirmada'
      ? est.etiqueta
      : { completada: 'Completada', cancelada: 'Cancelada' }[reserva.estado]

  return (
    <Link
      href={`/confirmacion/${reserva.id}`}
      className="flex items-center gap-3 bg-nocturno-500 rounded-2xl p-3 border border-white/10 hover:border-marca-200"
    >
      <div className="w-14 h-14 rounded-xl bg-marca-500/15 grid place-items-center text-marca-600 font-semibold text-lg shrink-0">
        {fecha.getDate()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">
            {diasSemanaCorto(fecha)} {mesCorto(fecha)} · {hora}
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${colorEstado}`}>
            {textoEstado}
          </span>
        </div>
        <div className="font-medium text-sm text-white truncate">{servicio?.nombre}</div>
        <div className="text-xs text-zinc-400 truncate">{negocio?.nombre}</div>
        {est.cuenta && (
          <div className="text-[11px] text-marca-400 font-medium mt-0.5">{est.cuenta}</div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </Link>
  )
}

function EstadoVacio({ icono: Icono, titulo, texto, accion }) {
  return (
    <div className="text-center py-10 px-5">
      <div className="w-14 h-14 mx-auto bg-white/10 rounded-full grid place-items-center text-zinc-400">
        <Icono className="w-6 h-6" />
      </div>
      <h3 className="mt-4 font-semibold text-white">{titulo}</h3>
      <p className="mt-1 text-sm text-zinc-400 max-w-xs mx-auto">{texto}</p>
      {accion && (
        <Link
          href={accion.href}
          className="mt-5 inline-block bg-marca-500 hover:bg-marca-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
        >
          {accion.texto}
        </Link>
      )}
    </div>
  )
}
