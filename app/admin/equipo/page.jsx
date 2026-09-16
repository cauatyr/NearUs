'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  Users, Plus, Loader2, AlertCircle, ShieldCheck, Trash2, Pencil, X, Check, KeyRound
} from 'lucide-react'
import { useAdmin, fetchAdmin } from '@/lib/store-admin'
import { PERMISOS, PRESETS, TODOS_LOS_PERMISOS, presetDe, etiquetaPermiso } from '@/lib/permisos'

export default function AdminEquipoPage() {
  const email = useAdmin((s) => s.email)
  const puedeGestionar = useAdmin((s) => s.puede('admins.gestionar'))

  const [admins, setAdmins] = useState(null)
  const [error, setError] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState(null)

  const cargar = async () => {
    const { datos, error: err } = await fetchAdmin('/api/admin/admins')
    if (err) setError(err)
    else {
      setAdmins(datos.admins)
      setError(null)
    }
  }

  useEffect(() => {
    if (puedeGestionar) cargar()
  }, [puedeGestionar])

  if (!puedeGestionar) {
    return (
      <div className="p-5 md:p-8 max-w-3xl">
        <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="mt-3 text-sm text-zinc-400">
            Tu cuenta no tiene permiso para administrar el equipo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipo</h1>
          <p className="text-sm text-zinc-400">
            Quién entra a la administración y qué puede hacer cada uno.
          </p>
        </div>
        <button
          onClick={() => {
            setEditando(null)
            setFormAbierto(true)
          }}
          className="bg-marca-500 hover:bg-marca-600 text-white font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Sumar admin
        </button>
      </div>

      {error && (
        <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {!admins && !error && (
        <div className="mt-5 bg-nocturno-500 border border-white/10 rounded-2xl p-10 text-center">
          <Loader2 className="w-6 h-6 text-zinc-500 mx-auto animate-spin" />
          <p className="mt-3 text-sm text-zinc-400">Cargando equipo…</p>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {(admins ?? []).map((a) => (
          <FilaAdmin
            key={a.userId}
            admin={a}
            esYo={a.email === email}
            onEditar={() => {
              setEditando(a)
              setFormAbierto(true)
            }}
            onCambio={cargar}
            onError={setError}
          />
        ))}
      </div>

      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-xs font-semibold text-zinc-200">Sobre estos permisos</div>
        <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
          Crear, editar y eliminar negocios se valida en el servidor: aunque alguien arme el pedido
          a mano, sin el permiso no pasa. En cambio, ocultar facturación y clientes es sólo de la
          interfaz — la tabla de reservas hoy se lee con la clave pública porque el app del cliente
          la necesita así. Para que esos dos sean una barrera de verdad hay que cerrar las
          políticas de lectura en Supabase.
        </p>
      </div>

      {formAbierto && (
        <ModalAdmin
          admin={editando}
          onCerrar={() => {
            setFormAbierto(false)
            setEditando(null)
          }}
          onGuardado={() => {
            setFormAbierto(false)
            setEditando(null)
            cargar()
          }}
        />
      )}
    </div>
  )
}

function FilaAdmin({ admin, esYo, onEditar, onCambio, onError }) {
  const [borrando, setBorrando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const preset = presetDe(admin.permisos)

  const quitar = async () => {
    setBorrando(true)
    const { error } = await fetchAdmin(`/api/admin/admins/${admin.userId}`, { method: 'DELETE' })
    setBorrando(false)
    setConfirmando(false)
    if (error) return onError(error)
    onCambio()
  }

  return (
    <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-marca-500/15 grid place-items-center text-marca-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">{admin.nombre || admin.email}</span>
            {esYo && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded-full">
                Vos
              </span>
            )}
            {preset && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-marca-300 bg-marca-500/15 px-1.5 py-0.5 rounded-full">
                {preset.nombre}
              </span>
            )}
          </div>
          {admin.nombre && <div className="text-xs text-zinc-400 truncate">{admin.email}</div>}
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {admin.ultimoAcceso
              ? `Último acceso ${new Date(admin.ultimoAcceso).toLocaleDateString('es-EC')}`
              : 'Todavía no entró'}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {admin.permisos.length === TODOS_LOS_PERMISOS.length ? (
              <Chip>Todos los permisos</Chip>
            ) : (
              admin.permisos.map((p) => <Chip key={p}>{etiquetaPermiso(p)}</Chip>)
            )}
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={onEditar}
            className="w-9 h-9 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition"
            title="Editar permisos"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!esYo && (
            <button
              onClick={() => setConfirmando(true)}
              className="w-9 h-9 grid place-items-center rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 transition"
              title="Sacar del equipo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {confirmando && (
        <div className="mt-3 bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-center gap-3">
          <span className="flex-1 text-xs text-red-200">
            ¿Sacar a {admin.nombre || admin.email} de la administración? La cuenta de acceso se
            mantiene, pero deja de entrar al panel.
          </span>
          <button
            onClick={() => setConfirmando(false)}
            className="text-xs font-semibold text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={quitar}
            disabled={borrando}
            className="text-xs font-semibold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            {borrando && <Loader2 className="w-3 h-3 animate-spin" />}
            Sacar
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ children }) {
  return (
    <span className="text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
      {children}
    </span>
  )
}

function ModalAdmin({ admin, onCerrar, onGuardado }) {
  const esNuevo = !admin
  const [nombre, setNombre] = useState(admin?.nombre || '')
  const [email, setEmail] = useState(admin?.email || '')
  const [password, setPassword] = useState('')
  const [permisos, setPermisos] = useState(admin?.permisos || PRESETS[3].permisos)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const presetActivo = useMemo(() => presetDe(permisos), [permisos])

  const alternar = (id) =>
    setPermisos((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const guardar = async () => {
    setError(null)
    if (permisos.length === 0) return setError('Elegí al menos un permiso.')
    setGuardando(true)

    const { error: err } = esNuevo
      ? await fetchAdmin('/api/admin/admins', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password, nombre, permisos })
        })
      : await fetchAdmin(`/api/admin/admins/${admin.userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ nombre, permisos, password: password || undefined })
        })

    setGuardando(false)
    if (err) return setError(err)
    onGuardado()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3" onClick={onCerrar}>
      <div
        className="bg-nocturno-500 w-full max-w-lg rounded-3xl border border-white/10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {esNuevo ? 'Sumar al equipo' : admin.nombre || admin.email}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {esNuevo
                ? 'Se crea la cuenta y vos le pasás los datos de acceso.'
                : 'Cambiá qué puede hacer esta persona.'}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 grid place-items-center rounded-xl hover:bg-white/10 text-zinc-400 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <Campo etiqueta="Nombre" valor={nombre} onChange={setNombre} placeholder="Cómo lo identificás" />

          {esNuevo && (
            <Campo etiqueta="Email" valor={email} onChange={setEmail} placeholder="persona@nearus.ec" tipo="email" />
          )}

          <div>
            <Campo
              etiqueta={esNuevo ? 'Contraseña' : 'Nueva contraseña (opcional)'}
              valor={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
            />
            <p className="mt-1.5 text-[11px] text-zinc-500 flex items-start gap-1.5">
              <KeyRound className="w-3 h-3 shrink-0 mt-0.5" />
              Anotala: no se puede volver a ver después.
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-200">Atajos</div>
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPermisos(p.permisos)}
                  className={`text-left rounded-xl p-3 border transition ${
                    presetActivo?.id === p.id
                      ? 'bg-marca-500/15 border-marca-500/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {presetActivo?.id === p.id && <Check className="w-3.5 h-3.5 text-marca-400" />}
                    {p.nombre}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-200">
              Permisos {presetActivo ? '' : '(a medida)'}
            </div>
            <div className="mt-2 space-y-4">
              {PERMISOS.map((g) => (
                <div key={g.grupo}>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    {g.grupo}
                  </div>
                  <div className="mt-1.5 space-y-1.5">
                    {g.items.map((i) => (
                      <label
                        key={i.id}
                        className="flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={permisos.includes(i.id)}
                          onChange={() => alternar(i.id)}
                          className="mt-0.5 w-4 h-4 accent-marca-500 shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm text-white">{i.label}</span>
                          <span className="block text-[11px] text-zinc-500 leading-snug">{i.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-white/10 flex gap-2 shrink-0">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex-1 py-3 rounded-full bg-marca-500 hover:bg-marca-600 disabled:opacity-70 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
            {esNuevo ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ etiqueta, valor, onChange, placeholder, tipo = 'text' }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-200">{etiqueta}</label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-marca-500 transition"
      />
    </div>
  )
}
