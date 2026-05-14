'use client'
import { useState, useMemo } from 'react'
import { TrendingUp, Users, Calendar, DollarSign, Star, Clock } from 'lucide-react'
import { RESERVAS_DEMO, obtenerServicioDemo, obtenerEmpleadoDemo } from '@/lib/data/demo-negocio'
import { formatoUSD } from '@/lib/utils'

const PERIODOS = [
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: '90d', label: 'Últimos 90 días' }
]

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState('7d')

  const stats = useMemo(() => {
    const limites = { '7d': 7, '30d': 30, '90d': 90 }
    const dias = limites[periodo]
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)

    const enRango = RESERVAS_DEMO.filter((r) => new Date(r.fecha) >= desde)
    const completadas = enRango.filter((r) => r.estado !== 'cancelada')
    const ingresos = completadas.reduce((s, r) => s + r.precio, 0)
    const clientesUnicos = new Set(completadas.map((r) => r.cliente.celular)).size

    // Por servicio
    const porServicio = {}
    completadas.forEach((r) => {
      const s = obtenerServicioDemo(r.servicioId)
      if (!s) return
      porServicio[s.nombre] = (porServicio[s.nombre] || 0) + 1
    })
    const topServicios = Object.entries(porServicio)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Por empleado
    const porEmpleado = {}
    completadas.forEach((r) => {
      const e = obtenerEmpleadoDemo(r.empleadoId)
      if (!e) return
      porEmpleado[e.nombre] = (porEmpleado[e.nombre] || { reservas: 0, ingresos: 0 })
      porEmpleado[e.nombre].reservas += 1
      porEmpleado[e.nombre].ingresos += r.precio
    })

    // Días de la semana
    const porDia = [0, 0, 0, 0, 0, 0, 0]
    completadas.forEach((r) => {
      porDia[new Date(r.fecha).getDay()] += 1
    })

    return {
      total: completadas.length,
      ingresos,
      clientesUnicos,
      ticketPromedio: completadas.length ? ingresos / completadas.length : 0,
      topServicios,
      porEmpleado,
      porDia
    }
  }, [periodo])

  const maxDia = Math.max(...stats.porDia, 1)

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Reportes</h1>
          <p className="text-sm text-zinc-500">Métricas y desempeño del negocio</p>
        </div>
        <div className="flex bg-zinc-100 rounded-full p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                periodo === p.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI
          icono={DollarSign}
          color="acento"
          label="Ingresos"
          valor={formatoUSD(stats.ingresos)}
          delta="+18% vs período anterior"
        />
        <KPI
          icono={Calendar}
          color="marca"
          label="Reservas"
          valor={stats.total}
          delta="+12% vs período anterior"
        />
        <KPI
          icono={Users}
          color="marca"
          label="Clientes únicos"
          valor={stats.clientesUnicos}
          delta="+4 nuevos"
        />
        <KPI
          icono={TrendingUp}
          color="acento"
          label="Ticket promedio"
          valor={formatoUSD(stats.ticketPromedio)}
          delta="Constante"
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        {/* Reservas por día */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-sm font-semibold text-zinc-900">Reservas por día de la semana</div>
          <div className="mt-5 flex items-end justify-between gap-2 h-44">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, i) => {
              const alto = (stats.porDia[i] / maxDia) * 100
              return (
                <div key={dia} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-[10px] font-semibold text-zinc-600">{stats.porDia[i]}</div>
                  <div
                    className="w-full bg-marca-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(alto, 4)}%` }}
                  />
                  <div className="text-[10px] text-zinc-500 font-medium">{dia}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top servicios */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-sm font-semibold text-zinc-900">Servicios más reservados</div>
          <div className="mt-4 space-y-3">
            {stats.topServicios.length === 0 && (
              <p className="text-sm text-zinc-500">Aún sin datos para este período.</p>
            )}
            {stats.topServicios.map(([nombre, cantidad], i) => {
              const max = stats.topServicios[0][1]
              const pct = (cantidad / max) * 100
              return (
                <div key={nombre}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700 font-medium truncate">
                      <span className="text-zinc-400 font-mono mr-2">#{i + 1}</span>
                      {nombre}
                    </span>
                    <span className="font-semibold text-zinc-900">{cantidad}</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-marca-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Equipo */}
      <div className="mt-5 bg-white rounded-2xl border border-zinc-100 p-5">
        <div className="text-sm font-semibold text-zinc-900">Desempeño del equipo</div>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {Object.entries(stats.porEmpleado).map(([nombre, datos]) => {
            const inicial = nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')
            return (
              <div key={nombre} className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3.5">
                <div className="w-10 h-10 rounded-full bg-marca-500 grid place-items-center text-white text-sm font-semibold">
                  {inicial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-zinc-900 truncate">{nombre}</div>
                  <div className="text-xs text-zinc-500">
                    {datos.reservas} reservas · {formatoUSD(datos.ingresos)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-xs text-zinc-700 font-medium justify-end">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.9
                  </div>
                  <div className="text-[10px] text-zinc-400">promedio</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota MVP */}
      <div className="mt-5 bg-marca-50 border border-marca-100 rounded-2xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-marca-500 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-marca-700 text-sm">Reportes en evolución</div>
          <p className="mt-1 text-xs text-marca-600">
            Pronto: análisis de retención, predicción de demanda y reporte de comisiones NearUs.
            Estos datos se calculan en tiempo real desde tu agenda.
          </p>
        </div>
      </div>
    </div>
  )
}

function KPI({ icono: Icono, color, label, valor, delta }) {
  const fondo = color === 'acento' ? 'bg-acento-500' : 'bg-marca-500'
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4">
      <div className={`w-9 h-9 rounded-xl ${fondo} text-white grid place-items-center`}>
        <Icono className="w-4 h-4" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-900">{valor}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
      <div className="text-[10px] text-acento-600 font-medium mt-2">{delta}</div>
    </div>
  )
}
