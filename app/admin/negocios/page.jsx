'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Store, ExternalLink, Settings2, Crown, Zap, UserX } from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { useSesion } from '@/lib/store-sesion'
import { useAdmin } from '@/lib/store-admin'
import { CATEGORIAS } from '@/lib/data/categorias'
import { detectarCiudad } from '@/lib/data/ciudades'
import { logoPlaceholder } from '@/lib/utils'

const FILTROS_ESTADO = [
  { id: 'todos', label: 'Todos' },
  { id: 'sin-dueno', label: 'Sin dueño' },
  { id: 'sin-servicios', label: 'Sin servicios' },
  { id: 'ahora', label: 'Aceptan ahora' },
  { id: 'prueba', label: 'Demo / prueba' }
]

export default function AdminNegociosPage() {
  const router = useRouter()
  const negocios = useDatosStore((s) => s.negocios)
  const servicios = useDatosStore((s) => s.servicios)
  const empleados = useDatosStore((s) => s.empleados)
  const reservas = useDatosStore((s) => s.reservas)
  const entrarComoNegocio = useSesion((s) => s.entrarComoNegocio)
  const puedeCrear = useAdmin((s) => s.puede('negocios.crear'))
  const puedeGestionar = useAdmin((s) => s.puede('negocios.gestionar'))

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [estado, setEstado] = useState('todos')

  const filas = useMemo(() => {
    return negocios
      .map((n) => {
        const ciudad = detectarCiudad(n.lat, n.lng)
        return {
          ...n,
          ciudad,
          servicios: servicios.filter((s) => s.negocioId === n.id).length,
          empleados: empleados.filter((e) => e.negocioId === n.id).length,
          reservas: reservas.filter((r) => r.negocioId === n.id).length,
          esPrueba: n.id.startsWith('demo-') || n.id.startsWith('n-test-')
        }
      })
      .filter((n) => {
        if (categoria !== 'todas' && n.categoria !== categoria) return false
        if (estado === 'sin-dueno' && n.ownerUserId) return false
        if (estado === 'sin-servicios' && n.servicios > 0) return false
        if (estado === 'ahora' && !n.aceptaAhora) return false
        if (estado === 'prueba' && !n.esPrueba) return false
        if (busqueda) {
          const q = busqueda.toLowerCase()
          const campos = [n.nombre, n.barrio, n.direccion, n.id, n.telefono]
          if (!campos.some((c) => (c || '').toLowerCase().includes(q))) return false
        }
        return true
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [negocios, servicios, empleados, reservas, busqueda, categoria, estado])

  const gestionar = (id) => {
    entrarComoNegocio(id)
    router.push('/negocio/inicio')
  }

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Negocios</h1>
          <p className="text-sm text-zinc-400">
            {filas.length} de {negocios.length} negocios
          </p>
        </div>
        {puedeCrear && (
          <Link
            href="/admin/negocios/nuevo"
            className="bg-marca-500 hover:bg-marca-600 text-white font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Nuevo negocio
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="mt-5 space-y-3">
        <div className="bg-nocturno-500 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, barrio, dirección, teléfono o id…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.id}
              onClick={() => setEstado(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${
                estado === f.id
                  ? 'bg-marca-500 border-marca-500 text-white'
                  : 'bg-nocturno-500 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoria('todas')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${
              categoria === 'todas'
                ? 'bg-white/15 border-white/20 text-white'
                : 'bg-nocturno-500 border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
          >
            Todas las categorías
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition border flex items-center gap-1.5 ${
                categoria === c.id
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-nocturno-500 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="mt-5 space-y-2">
        {filas.length === 0 && (
          <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
            <Store className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="mt-3 text-sm text-zinc-400">Ningún negocio coincide con el filtro.</p>
          </div>
        )}

        {filas.map((n) => {
          const cat = CATEGORIAS.find((c) => c.id === n.categoria)
          return (
            <div
              key={n.id}
              className="bg-nocturno-500 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3.5"
            >
              <div
                className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: cat?.color || '#2BACE2' }}
              >
                <img
                  src={n.logo || logoPlaceholder(n.nombre, cat?.color)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/negocios/${n.id}`}
                    className="font-semibold text-white hover:text-marca-400 truncate transition"
                  >
                    {n.nombre}
                  </Link>
                  {n.destacado && <Crown className="w-3.5 h-3.5 text-amber-400" title="Plan Pro" />}
                  {n.aceptaAhora && <Zap className="w-3.5 h-3.5 text-amber-400" title="Acepta ahora" />}
                  {!n.ownerUserId && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                      <UserX className="w-3 h-3" /> Sin dueño
                    </span>
                  )}
                  {n.esPrueba && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded-full">
                      Prueba
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 truncate">
                  {cat?.nombre} · {n.barrio || 'sin barrio'} ·{' '}
                  {n.ciudad ? n.ciudad.nombre : <span className="text-amber-300">fuera de cobertura</span>}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                  {n.servicios} servicios · {n.empleados} del equipo · {n.reservas} reservas ·{' '}
                  {n.rating ? `${n.rating}★ (${n.reviews})` : 'sin reseñas'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {puedeGestionar && (
                  <button
                    onClick={() => gestionar(n.id)}
                    className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Abrir el panel de este negocio"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Gestionar
                  </button>
                )}
                <Link
                  href={`/admin/negocios/${n.id}`}
                  className="w-9 h-9 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                  title="Ver ficha completa"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
