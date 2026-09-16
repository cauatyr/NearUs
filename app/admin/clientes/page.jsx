'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users, Loader2, Store, Calendar } from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { fetchAdmin } from '@/lib/store-admin'
import { formatoUSD } from '@/lib/utils'

const FILTROS = [
  { id: 'todos', label: 'Todas las cuentas' },
  { id: 'clientes', label: 'Con reservas' },
  { id: 'duenos', label: 'Dueños de negocio' },
  { id: 'inactivas', label: 'Sin reservas' }
]

export default function AdminClientesPage() {
  const negocios = useDatosStore((s) => s.negocios)
  const reservas = useDatosStore((s) => s.reservas)

  const [usuarios, setUsuarios] = useState(null)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    let vivo = true
    fetchAdmin('/api/admin/resumen').then(({ datos, error: err }) => {
      if (!vivo) return
      if (err) setError(err)
      else setUsuarios(datos.usuarios)
    })
    return () => {
      vivo = false
    }
  }, [])

  const filas = useMemo(() => {
    if (!usuarios) return []
    return usuarios
      .map((u) => {
        const suyas = reservas.filter((r) => r.clienteUserId === u.id)
        const validas = suyas.filter((r) => r.estado !== 'cancelada')
        return {
          ...u,
          negocio: negocios.find((n) => n.ownerUserId === u.id) || null,
          reservas: suyas.length,
          gastado: validas.reduce((s, r) => s + Number(r.precio || 0), 0),
          // El nombre en las reservas es el que el cliente escribió al reservar.
          nombreReserva: suyas[0]?.cliente?.nombre || null,
          celularReserva: suyas[0]?.cliente?.celular || null
        }
      })
      .filter((u) => {
        if (filtro === 'clientes' && u.reservas === 0) return false
        if (filtro === 'duenos' && !u.negocio) return false
        if (filtro === 'inactivas' && u.reservas > 0) return false
        if (busqueda) {
          const q = busqueda.toLowerCase()
          const campos = [u.email, u.nombre, u.nombreReserva, u.celular, u.celularReserva, u.negocio?.nombre]
          if (!campos.some((c) => (c || '').toLowerCase().includes(q))) return false
        }
        return true
      })
      .sort((a, b) => b.reservas - a.reservas || (b.creadoEn || '').localeCompare(a.creadoEn || ''))
  }, [usuarios, reservas, negocios, busqueda, filtro])

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Cuentas</h1>
        <p className="text-sm text-zinc-400">
          Clientes y dueños registrados en NearUs.
          {usuarios && ` ${filas.length} de ${usuarios.length}.`}
        </p>
      </div>

      {error && (
        <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        <div className="bg-nocturno-500 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por email, nombre, celular o negocio…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${
                filtro === f.id
                  ? 'bg-marca-500 border-marca-500 text-white'
                  : 'bg-nocturno-500 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!usuarios && !error && (
        <div className="mt-5 bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
          <Loader2 className="w-6 h-6 text-zinc-500 mx-auto animate-spin" />
          <p className="mt-3 text-sm text-zinc-400">Cargando cuentas…</p>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {usuarios && filas.length === 0 && (
          <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
            <Users className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="mt-3 text-sm text-zinc-400">Ninguna cuenta coincide con el filtro.</p>
          </div>
        )}

        {filas.map((u) => (
          <div key={u.id} className="bg-nocturno-500 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-sm font-semibold text-white shrink-0">
              {(u.nombre || u.nombreReserva || u.email || '?').trim().charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate">
                  {u.nombre || u.nombreReserva || u.email}
                </span>
                {u.negocio && (
                  <Link
                    href={`/admin/negocios/${u.negocio.id}`}
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-marca-300 bg-marca-500/15 px-1.5 py-0.5 rounded-full hover:bg-marca-500/25 transition"
                  >
                    <Store className="w-3 h-3" /> {u.negocio.nombre}
                  </Link>
                )}
              </div>
              <div className="text-xs text-zinc-400 truncate">{u.email}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {u.celular || u.celularReserva || 'sin celular'} · alta{' '}
                {u.creadoEn ? new Date(u.creadoEn).toLocaleDateString('es-EC') : '—'}
                {u.ultimoAcceso && ` · último acceso ${new Date(u.ultimoAcceso).toLocaleDateString('es-EC')}`}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-white tabular-nums flex items-center gap-1.5 justify-end">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {u.reservas}
              </div>
              {u.gastado > 0 && (
                <div className="text-[11px] text-zinc-500 tabular-nums">{formatoUSD(u.gastado)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
