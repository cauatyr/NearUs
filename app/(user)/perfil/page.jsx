'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Heart, Star, ChevronRight, Settings, LogOut, Award } from 'lucide-react'
import { useReservas } from '@/lib/store'
import { useCliente } from '@/lib/store-cliente'
import { useDatosStore } from '@/lib/store-datos'
import { obtenerNegocio, obtenerServicio, useNegocios } from '@/lib/data/negocios'
import { formatoUSD, mesCorto, diasSemanaCorto } from '@/lib/utils'
import TarjetaNegocio from '@/components/TarjetaNegocio'
import { useUbicacion } from '@/lib/store'

export default function PerfilPage() {
  const [tab, setTab] = useState('reservas')
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
      {/* Cabecera */}
      <div className="bg-gradient-to-br from-marca-500 to-marca-700 text-white px-5 pt-10 pb-12 relative">
        {cliente ? (
          <button
            onClick={cerrarSesion}
            title="Cerrar sesión"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 grid place-items-center hover:bg-white/25 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 grid place-items-center">
            <Settings className="w-4 h-4" />
          </button>
        )}
        <div className="w-20 h-20 rounded-full bg-white/20 grid place-items-center text-2xl font-semibold">
          {iniciales}
        </div>
        <div className="mt-4">
          {cliente ? (
            <>
              <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
              <p className="text-marca-100 text-sm">{cliente.email}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Invitado</h1>
              <Link
                href="/cuenta"
                className="mt-2 inline-block bg-white/15 hover:bg-white/25 transition rounded-full px-4 py-1.5 text-sm font-medium"
              >
                Iniciar sesión o crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-suave grid grid-cols-3 divide-x divide-zinc-100">
          <Stat valor={reservas.length} label="Reservas" />
          <Stat valor={favoritos.length} label="Favoritos" />
          <Stat valor={pasadas.length} label="Visitas" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-7">
        <div className="bg-zinc-100 rounded-full p-1 grid grid-cols-2 gap-1">
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
    </div>
  )
}

function Stat({ valor, label }) {
  return (
    <div className="text-center p-4">
      <div className="text-2xl font-semibold text-zinc-900">{valor}</div>
      <div className="text-[11px] text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}

function TabBtn({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-full text-sm font-medium transition ${
        activo ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
      }`}
    >
      {children}
    </button>
  )
}

function SubTitulo({ children }) {
  return <div className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium pt-1">{children}</div>
}

function ItemReserva({ reserva }) {
  const negocio = obtenerNegocio(reserva.negocioId)
  const servicio = obtenerServicio(reserva.servicioId)
  const fecha = new Date(reserva.fecha)
  const hora =
    reserva.hora ||
    `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
  const colorEstado = {
    confirmada: 'bg-marca-100 text-marca-700',
    completada: 'bg-acento-500 text-white',
    cancelada: 'bg-zinc-200 text-zinc-600'
  }[reserva.estado]
  const textoEstado = {
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  }[reserva.estado]

  return (
    <Link
      href={`/confirmacion/${reserva.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-zinc-100 hover:border-marca-200"
    >
      <div className="w-14 h-14 rounded-xl bg-marca-100 grid place-items-center text-marca-600 font-semibold text-lg shrink-0">
        {fecha.getDate()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">
            {diasSemanaCorto(fecha)} {mesCorto(fecha)} · {hora}
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${colorEstado}`}>
            {textoEstado}
          </span>
        </div>
        <div className="font-medium text-sm text-zinc-900 truncate">{servicio?.nombre}</div>
        <div className="text-xs text-zinc-500 truncate">{negocio?.nombre}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </Link>
  )
}

function EstadoVacio({ icono: Icono, titulo, texto, accion }) {
  return (
    <div className="text-center py-10 px-5">
      <div className="w-14 h-14 mx-auto bg-zinc-100 rounded-full grid place-items-center text-zinc-400">
        <Icono className="w-6 h-6" />
      </div>
      <h3 className="mt-4 font-semibold text-zinc-900">{titulo}</h3>
      <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">{texto}</p>
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
