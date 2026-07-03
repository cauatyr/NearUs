'use client'
import { useState } from 'react'
import { X, Camera, Check } from 'lucide-react'
import { useCliente } from '@/lib/store-cliente'
import { comprimirImagen } from '@/lib/utils'

export default function ModalEditarPerfil({ onClose }) {
  const cliente = useCliente((s) => s.cliente)
  const actualizarPerfil = useCliente((s) => s.actualizarPerfil)
  const [nombre, setNombre] = useState(cliente?.nombre || '')
  const [celular, setCelular] = useState(cliente?.celular || '')
  const [foto, setFoto] = useState(cliente?.foto || null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const onFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setFoto(await comprimirImagen(file, 128, 'image/jpeg'))
    } catch (_) {}
  }

  const guardar = async () => {
    if (!nombre.trim()) {
      setError('Ingresa tu nombre.')
      return
    }
    setGuardando(true)
    setError('')
    const res = await actualizarPerfil({ nombre: nombre.trim(), celular: celular.trim(), foto })
    if (res?.error) {
      setError(res.error)
      setGuardando(false)
      return
    }
    onClose()
  }

  const iniciales = (nombre || 'C')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-[90] max-w-md mx-auto bg-nocturno-500 rounded-t-3xl border-t border-white/10 animate-slide-up">
        <div className="flex justify-center pt-2.5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <h3 className="font-semibold text-white">Editar perfil</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-6" style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
          {/* Avatar + cambiar foto */}
          <div className="flex justify-center pt-2 pb-1">
            <label className="relative cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-marca-500/15 grid place-items-center text-2xl font-bold text-marca-300 ring-2 ring-white/10">
                {foto ? (
                  <img src={foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  iniciales
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-marca-500 grid place-items-center border-2 border-nocturno-500">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={onFoto} />
            </label>
          </div>

          <Campo label="Nombre" value={nombre} onChange={setNombre} placeholder="Tu nombre" />
          <Campo label="Celular" value={celular} onChange={setCelular} placeholder="+593 9…" type="tel" />
          <p className="text-[11px] text-zinc-500 mt-2">El email ({cliente?.email}) no se puede cambiar aquí.</p>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={guardar}
            disabled={guardando}
            className="mt-5 w-full bg-marca-500 hover:bg-marca-600 active:scale-[0.98] disabled:bg-white/10 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
          >
            {guardando ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando…</>
            ) : (
              <><Check className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function Campo({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="mt-4">
      <label className="text-xs font-semibold text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-marca-500/50"
      />
    </div>
  )
}
