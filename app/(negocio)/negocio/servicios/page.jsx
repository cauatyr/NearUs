'use client'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Clock, X, Check } from 'lucide-react'
import { serviciosDeNegocio } from '@/lib/data/negocios'
import { NEGOCIO_DEMO_ID } from '@/lib/data/demo-negocio'
import { CATEGORIAS } from '@/lib/data/categorias'
import { formatoUSD, formatoDuracion } from '@/lib/utils'

export default function ServiciosPage() {
  const [servicios, setServicios] = useState(serviciosDeNegocio(NEGOCIO_DEMO_ID))
  const [editando, setEditando] = useState(null)

  const eliminar = (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    setServicios((s) => s.filter((x) => x.id !== id))
  }

  const guardar = (datos) => {
    if (datos.id) {
      setServicios((s) => s.map((x) => (x.id === datos.id ? { ...x, ...datos } : x)))
    } else {
      setServicios((s) => [...s, { ...datos, id: 'new-' + Date.now() }])
    }
    setEditando(null)
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Servicios</h1>
          <p className="text-sm text-zinc-500">{servicios.length} servicios activos en tu catálogo</p>
        </div>
        <button
          onClick={() => setEditando({})}
          className="bg-marca-500 hover:bg-marca-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo servicio
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card label="Precio promedio" valor={formatoUSD(servicios.reduce((s, x) => s + x.precio, 0) / Math.max(servicios.length, 1))} />
        <Card label="Más caro" valor={formatoUSD(Math.max(...servicios.map((s) => s.precio), 0))} />
        <Card label="Duración media" valor={formatoDuracion(Math.round(servicios.reduce((s, x) => s + x.duracion, 0) / Math.max(servicios.length, 1)))} />
      </div>

      {/* Lista */}
      <div className="mt-7 bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {servicios.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-500">
            Aún no tienes servicios.
          </div>
        ) : (
          servicios.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-4 border-b border-zinc-50 last:border-b-0 hover:bg-zinc-50/50 transition">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900">{s.nombre}</div>
                <div className="mt-1 text-xs text-zinc-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatoDuracion(s.duracion)}
                  </span>
                  <span className="capitalize">{CATEGORIAS.find((c) => c.id === s.categoria)?.nombre}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-zinc-900">{formatoUSD(s.precio)}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditando(s)}
                  className="w-9 h-9 rounded-full hover:bg-zinc-200 grid place-items-center text-zinc-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminar(s.id)}
                  className="w-9 h-9 rounded-full hover:bg-red-50 grid place-items-center text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editando !== null && (
        <ModalServicio
          servicio={editando}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function Card({ label, valor }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-900">{valor}</div>
    </div>
  )
}

function ModalServicio({ servicio, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState({
    id: servicio.id,
    nombre: servicio.nombre || '',
    duracion: servicio.duracion || 30,
    precio: servicio.precio || 10,
    categoria: servicio.categoria || 'barberia'
  })

  const valido = datos.nombre && datos.duracion > 0 && datos.precio > 0

  return (
    <div className="fixed inset-0 z-30 bg-black/40 grid place-items-center p-4" onClick={onCerrar}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-flotante" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {servicio.id ? 'Editar servicio' : 'Nuevo servicio'}
          </h3>
          <button onClick={onCerrar} className="w-8 h-8 rounded-full hover:bg-zinc-100 grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-600">Nombre del servicio</label>
            <input
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              placeholder="Ej. Corte clásico caballero"
              className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-marca-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Categoría</label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {CATEGORIAS.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDatos({ ...datos, categoria: c.id })}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition ${
                    datos.categoria === c.id
                      ? 'border-marca-500 bg-marca-50 text-marca-700'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">Duración (min)</label>
              <input
                type="number"
                value={datos.duracion}
                onChange={(e) => setDatos({ ...datos, duracion: Number(e.target.value) })}
                className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-marca-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">Precio (USD)</label>
              <input
                type="number"
                step="0.5"
                value={datos.precio}
                onChange={(e) => setDatos({ ...datos, precio: Number(e.target.value) })}
                className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-marca-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={onCerrar} className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full py-2.5 text-sm font-medium text-zinc-700">
            Cancelar
          </button>
          <button
            disabled={!valido}
            onClick={() => onGuardar(datos)}
            className="bg-marca-500 hover:bg-marca-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
