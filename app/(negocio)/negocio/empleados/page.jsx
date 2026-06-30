'use client'
import { useState, useMemo } from 'react'
import { Plus, Edit3, Trash2, Phone, Briefcase, X, Check } from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { useSesion } from '@/lib/store-sesion'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function EmpleadosPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const todos = useDatosStore((s) => s.empleados)
  const equipo = useMemo(
    () =>
      todos
        .filter((e) => e.negocioId === negocioId)
        .map((e) => ({
          ...e,
          celular: e.celular || '+593 99 000 0000',
          diasTrabajo: e.diasTrabajo || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        })),
    [todos, negocioId]
  )
  const agregarEmpleado = useDatosStore((s) => s.agregarEmpleado)
  const actualizarEmpleado = useDatosStore((s) => s.actualizarEmpleado)
  const eliminarEmpleado = useDatosStore((s) => s.eliminarEmpleado)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState(null)

  const guardar = async (datos) => {
    const avatar = (datos.nombre || '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    const { error: err } = datos.id
      ? await actualizarEmpleado(datos.id, {
          nombre: datos.nombre,
          cargo: datos.cargo,
          avatar,
          celular: datos.celular,
          diasTrabajo: datos.diasTrabajo
        })
      : await agregarEmpleado({
          negocioId,
          nombre: datos.nombre,
          cargo: datos.cargo,
          avatar,
          celular: datos.celular,
          diasTrabajo: datos.diasTrabajo
        })
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setEditando(null)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar a este miembro del equipo?')) return
    const { error: err } = await eliminarEmpleado(id)
    if (err) setError(err)
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipo</h1>
          <p className="text-sm text-zinc-400">{equipo.length} profesionales en tu negocio</p>
        </div>
        <button
          onClick={() => setEditando({})}
          className="bg-marca-500 hover:bg-marca-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          No se pudo guardar: {error}
        </div>
      )}

      {/* Grid de empleados */}
      <div className="mt-7 grid sm:grid-cols-2 gap-3">
        {equipo.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-zinc-400">
            Aún no hay miembros del equipo.
          </div>
        )}
        {equipo.map((e) => (
          <div key={e.id} className="bg-nocturno-500 rounded-2xl border border-white/10 p-5 hover:border-marca-200 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-marca-500/15 grid place-items-center text-marca-600 font-semibold">
                  {e.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{e.nombre}</div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3" /> {e.cargo}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditando(e)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center text-zinc-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => eliminar(e.id)}
                  className="w-8 h-8 rounded-full hover:bg-red-500/10 grid place-items-center text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-50">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Días de trabajo</div>
              <div className="mt-2 flex gap-1">
                {DIAS.map((d) => {
                  const trabaja = e.diasTrabajo.includes(d)
                  return (
                    <div
                      key={d}
                      className={`w-8 h-8 rounded-lg text-[10px] font-semibold grid place-items-center ${
                        trabaja ? 'bg-marca-500 text-white' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {d}
                    </div>
                  )
                })}
              </div>
            </div>

            <a href={`tel:${e.celular}`} className="mt-3 text-xs text-marca-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {e.celular}
            </a>
          </div>
        ))}
      </div>

      {editando !== null && (
        <ModalEmpleado empleado={editando} onGuardar={guardar} onCerrar={() => setEditando(null)} />
      )}
    </div>
  )
}

function ModalEmpleado({ empleado, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState({
    id: empleado.id,
    nombre: empleado.nombre || '',
    cargo: empleado.cargo || '',
    celular: empleado.celular || '+593 ',
    diasTrabajo: empleado.diasTrabajo || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  })

  const toggleDia = (d) => {
    setDatos((p) => ({
      ...p,
      diasTrabajo: p.diasTrabajo.includes(d)
        ? p.diasTrabajo.filter((x) => x !== d)
        : [...p.diasTrabajo, d]
    }))
  }

  const valido = datos.nombre && datos.cargo

  return (
    <div className="fixed inset-0 z-30 bg-black/40 grid place-items-center p-4" onClick={onCerrar}>
      <div className="bg-nocturno-500 rounded-3xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {empleado.id ? 'Editar miembro' : 'Agregar al equipo'}
          </h3>
          <button onClick={onCerrar} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Campo
            label="Nombre completo"
            valor={datos.nombre}
            onChange={(v) => setDatos({ ...datos, nombre: v })}
            placeholder="Ej. Carlos Ortega"
          />
          <Campo
            label="Cargo o especialidad"
            valor={datos.cargo}
            onChange={(v) => setDatos({ ...datos, cargo: v })}
            placeholder="Ej. Maestro barbero"
          />
          <Campo
            label="Celular"
            valor={datos.celular}
            onChange={(v) => setDatos({ ...datos, celular: v })}
            placeholder="+593 99 123 4567"
          />

          <div>
            <label className="text-xs font-medium text-zinc-300">Días de trabajo</label>
            <div className="mt-1.5 flex gap-1.5">
              {DIAS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDia(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                    datos.diasTrabajo.includes(d)
                      ? 'border-marca-500 bg-marca-500 text-white'
                      : 'border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={onCerrar} className="bg-nocturno-500 border border-white/10 hover:bg-white/5 rounded-full py-2.5 text-sm font-medium text-zinc-200">
            Cancelar
          </button>
          <button
            disabled={!valido}
            onClick={() => onGuardar(datos)}
            className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, valor, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-300">{label}</label>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-marca-500 focus:bg-nocturno-400"
      />
    </div>
  )
}
