'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import {
  Store, Calendar, DollarSign, Users, Star, Percent, AlertTriangle, ChevronRight, MapPin
} from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { CATEGORIAS } from '@/lib/data/categorias'
import { detectarCiudad, ciudadesActivas } from '@/lib/data/ciudades'
import { formatoUSD, COMISION_NEARUS, comisionDeReservas } from '@/lib/utils'

const MS_SEMANA = 7 * 24 * 60 * 60 * 1000

export default function AdminInicioPage() {
  const negocios = useDatosStore((s) => s.negocios)
  const servicios = useDatosStore((s) => s.servicios)
  const reservas = useDatosStore((s) => s.reservas)
  const resenas = useDatosStore((s) => s.resenas)

  const stats = useMemo(() => {
    const validas = reservas.filter((r) => r.estado !== 'cancelada')
    const gmv = validas.reduce((s, r) => s + Number(r.precio || 0), 0)
    const { cobradoEnApp, comision } = comisionDeReservas(reservas)

    const hace30 = Date.now() - 30 * 24 * 60 * 60 * 1000
    const ultimos30 = validas.filter((r) => new Date(r.fecha).getTime() >= hace30)

    const clientes = new Set(
      validas.map((r) => r.clienteUserId || r.cliente?.celular).filter(Boolean)
    )

    const conNota = resenas.length
      ? resenas.reduce((s, r) => s + Number(r.rating || 0), 0) / resenas.length
      : null

    return {
      gmv,
      cobradoEnApp,
      comision,
      reservasTotal: validas.length,
      reservas30: ultimos30.length,
      canceladas: reservas.length - validas.length,
      clientes: clientes.size,
      notaMedia: conNota
    }
  }, [reservas, resenas])

  // Reservas de las últimas 8 semanas, por semana (una sola serie).
  const porSemana = useMemo(() => {
    const ahora = Date.now()
    const buckets = Array.from({ length: 8 }, (_, i) => {
      const fin = ahora - (7 - i) * MS_SEMANA + MS_SEMANA
      return { desde: fin - MS_SEMANA, hasta: fin, cantidad: 0 }
    })
    reservas
      .filter((r) => r.estado !== 'cancelada')
      .forEach((r) => {
        const t = new Date(r.fecha).getTime()
        const b = buckets.find((x) => t >= x.desde && t < x.hasta)
        if (b) b.cantidad += 1
      })
    return buckets
  }, [reservas])

  const porCategoria = useMemo(() => {
    return CATEGORIAS.map((c) => ({
      ...c,
      cantidad: negocios.filter((n) => n.categoria === c.id).length
    })).sort((a, b) => b.cantidad - a.cantidad)
  }, [negocios])

  const topNegocios = useMemo(() => {
    const porNegocio = {}
    reservas
      .filter((r) => r.estado !== 'cancelada')
      .forEach((r) => {
        porNegocio[r.negocioId] = (porNegocio[r.negocioId] || 0) + Number(r.precio || 0)
      })
    return Object.entries(porNegocio)
      .map(([id, ingresos]) => ({
        id,
        ingresos,
        nombre: negocios.find((n) => n.id === id)?.nombre || id
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 8)
  }, [reservas, negocios])

  const porCiudad = useMemo(() => {
    const activas = ciudadesActivas()
    const filas = activas.map((c) => ({ id: c.id, nombre: c.nombre, pais: c.pais, cantidad: 0 }))
    let fuera = 0
    negocios.forEach((n) => {
      const c = detectarCiudad(n.lat, n.lng)
      const fila = c && filas.find((f) => f.id === c.id)
      if (fila) fila.cantidad += 1
      else fuera += 1
    })
    return { filas, fuera }
  }, [negocios])

  // Pendientes reales antes del lanzamiento: lo que hay que limpiar o completar.
  const avisos = useMemo(() => {
    const idsConServicio = new Set(servicios.map((s) => s.negocioId))
    return {
      sinDueno: negocios.filter((n) => !n.ownerUserId),
      sinServicios: negocios.filter((n) => !idsConServicio.has(n.id)),
      dePrueba: negocios.filter((n) => n.id.startsWith('demo-') || n.id.startsWith('n-test-'))
    }
  }, [negocios, servicios])

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Visión general</h1>
        <p className="text-sm text-zinc-400">Toda la plataforma NearUs en un vistazo.</p>
      </div>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icono={Store} label="Negocios" valor={negocios.length} pie={`${negocios.filter((n) => n.aceptaAhora).length} aceptan ahora`} />
        <KPI icono={Calendar} label="Reservas" valor={stats.reservasTotal} pie={`${stats.reservas30} en los últimos 30 días`} />
        <KPI icono={DollarSign} label="Volumen (GMV)" valor={formatoUSD(stats.gmv)} pie={`${formatoUSD(stats.cobradoEnApp)} cobrado en la app`} />
        <KPI
          icono={Percent}
          label={`Comisión NearUs (${Math.round(COMISION_NEARUS * 100)}%)`}
          valor={formatoUSD(stats.comision)}
          pie="Sólo sobre pagos in-app"
          acento
        />
        <KPI icono={Users} label="Clientes" valor={stats.clientes} pie="Con al menos una reserva" />
        <KPI icono={Star} label="Nota media" valor={stats.notaMedia ? stats.notaMedia.toFixed(1) : '—'} pie={`${resenas.length} reseñas`} />
        <KPI icono={Calendar} label="Canceladas" valor={stats.canceladas} pie="Del total histórico" />
        <KPI icono={Store} label="Servicios" valor={servicios.length} pie="Publicados por los negocios" />
      </div>

      {/* Pendientes */}
      {(avisos.sinDueno.length > 0 || avisos.sinServicios.length > 0 || avisos.dePrueba.length > 0) && (
        <div className="mt-5 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" /> Pendientes antes del lanzamiento
          </div>
          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            <Pendiente titulo="Sin dueño" negocios={avisos.sinDueno} nota="Nadie puede entrar al panel" />
            <Pendiente titulo="Sin servicios" negocios={avisos.sinServicios} nota="No son reservables" />
            <Pendiente titulo="De prueba / demo" negocios={avisos.dePrueba} nota="Conviene borrarlos" />
          </div>
        </div>
      )}

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {/* Reservas por semana */}
        <Panel titulo="Reservas por semana" nota="Últimas 8 semanas, sin canceladas">
          <GraficoSemanas datos={porSemana} />
        </Panel>

        {/* Negocios por categoría */}
        <Panel titulo="Negocios por categoría" nota={`${negocios.length} en total`}>
          <div className="space-y-2.5">
            {porCategoria.map((c) => (
              <BarraHorizontal
                key={c.id}
                etiqueta={c.nombre}
                valor={c.cantidad}
                max={porCategoria[0]?.cantidad || 1}
                color={c.color}
              />
            ))}
          </div>
        </Panel>

        {/* Top negocios */}
        <Panel titulo="Negocios que más facturan" nota="Volumen acumulado">
          {topNegocios.length === 0 ? (
            <Vacio texto="Todavía no hay reservas." />
          ) : (
            <div className="space-y-2.5">
              {topNegocios.map((n) => (
                <BarraHorizontal
                  key={n.id}
                  etiqueta={n.nombre}
                  valor={n.ingresos}
                  formato={formatoUSD}
                  max={topNegocios[0].ingresos || 1}
                  href={`/admin/negocios/${n.id}`}
                />
              ))}
            </div>
          )}
        </Panel>

        {/* Ciudades */}
        <Panel titulo="Cobertura" nota="Negocios por ciudad activa">
          <div className="space-y-2">
            {porCiudad.filas.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3.5 py-3">
                <MapPin className="w-4 h-4 text-marca-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{c.nombre}</div>
                  <div className="text-[11px] text-zinc-400">{c.pais}</div>
                </div>
                <div className="text-lg font-semibold text-white tabular-nums">{c.cantidad}</div>
              </div>
            ))}
            {porCiudad.fuera > 0 && (
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3.5 py-3 border border-amber-500/25">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">Fuera de cobertura</div>
                  <div className="text-[11px] text-zinc-400">
                    No aparecen para nadie hasta activar su ciudad
                  </div>
                </div>
                <div className="text-lg font-semibold text-white tabular-nums">{porCiudad.fuera}</div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Link
        href="/admin/negocios"
        className="mt-5 flex items-center justify-between gap-3 bg-nocturno-500 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 transition"
      >
        <div>
          <div className="font-semibold text-white">Ver todos los negocios</div>
          <div className="text-xs text-zinc-400">Crear, editar, gestionar o eliminar</div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-400" />
      </Link>
    </div>
  )
}

function KPI({ icono: Icono, label, valor, pie, acento }) {
  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 p-4">
      <div
        className={`w-9 h-9 rounded-xl grid place-items-center text-white ${
          acento ? 'bg-acento-500' : 'bg-marca-500'
        }`}
      >
        <Icono className="w-4 h-4" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-white tabular-nums">{valor}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
      {pie && <div className="text-[10px] text-zinc-500 mt-2">{pie}</div>}
    </div>
  )
}

function Panel({ titulo, nota, children }) {
  return (
    <div className="bg-nocturno-500 rounded-2xl border border-white/10 p-5">
      <div className="text-sm font-semibold text-white">{titulo}</div>
      {nota && <div className="text-[11px] text-zinc-500 mt-0.5">{nota}</div>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Vacio({ texto }) {
  return <p className="text-sm text-zinc-500 py-6 text-center">{texto}</p>
}

function Pendiente({ titulo, negocios, nota }) {
  return (
    <div className="bg-nocturno-500/60 rounded-xl p-3.5">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-white tabular-nums">{negocios.length}</span>
        <span className="text-sm text-zinc-200">{titulo}</span>
      </div>
      <div className="text-[11px] text-zinc-500 mt-0.5">{nota}</div>
      <div className="mt-2 space-y-1">
        {negocios.slice(0, 3).map((n) => (
          <Link
            key={n.id}
            href={`/admin/negocios/${n.id}`}
            className="block text-xs text-marca-400 hover:text-marca-300 truncate"
          >
            {n.nombre}
          </Link>
        ))}
        {negocios.length > 3 && (
          <div className="text-[11px] text-zinc-500">y {negocios.length - 3} más…</div>
        )}
      </div>
    </div>
  )
}

// Barras verticales, una sola serie → sin leyenda (el título la nombra).
function GraficoSemanas({ datos }) {
  const max = Math.max(...datos.map((d) => d.cantidad), 1)
  const fmt = (t) => {
    const d = new Date(t)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }
  return (
    <div className="flex items-end justify-between gap-2 h-44">
      {datos.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="text-[10px] font-semibold text-zinc-300 tabular-nums">{d.cantidad}</div>
          <div
            className="w-full bg-marca-500 rounded-t transition-all"
            style={{ height: `${Math.max((d.cantidad / max) * 100, 3)}%` }}
            title={`${d.cantidad} reservas · ${fmt(d.desde)} a ${fmt(d.hasta - 1)}`}
          />
          <div className="text-[10px] text-zinc-500 truncate w-full text-center">{fmt(d.desde)}</div>
        </div>
      ))}
    </div>
  )
}

// Barra horizontal. El color sigue a la entidad (categoría), no al ranking.
function BarraHorizontal({ etiqueta, valor, max, color, formato, href }) {
  const pct = max ? (valor / max) * 100 : 0
  const texto = formato ? formato(valor) : valor
  const contenido = (
    <>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-200 truncate">{etiqueta}</span>
        <span className="font-semibold text-white tabular-nums shrink-0">{texto}</span>
      </div>
      <div className="mt-1.5 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, valor > 0 ? 3 : 0)}%`, backgroundColor: color || '#2BACE2' }}
        />
      </div>
    </>
  )
  if (!href) return <div title={`${etiqueta}: ${texto}`}>{contenido}</div>
  return (
    <Link href={href} className="block hover:opacity-90 transition" title={`${etiqueta}: ${texto}`}>
      {contenido}
    </Link>
  )
}
