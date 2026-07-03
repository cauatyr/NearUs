'use client'
import { useMemo, useState } from 'react'
import { Star, MessageSquare, Check, BadgeCheck } from 'lucide-react'
import { useSesion } from '@/lib/store-sesion'
import { useDatosStore } from '@/lib/store-datos'
import { tiempoRelativo } from '@/lib/utils'

export default function ResenasPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const todas = useDatosStore((s) => s.resenas)
  const responderResena = useDatosStore((s) => s.responderResena)

  const resenas = useMemo(
    () =>
      todas
        .filter((r) => r.negocioId === negocioId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [todas, negocioId]
  )

  const total = resenas.length
  const promedio = total ? (resenas.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : null
  const sinResponder = resenas.filter((r) => !r.respuesta).length

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reseñas</h1>
        <p className="text-sm text-zinc-400">
          {total} reseñas
          {promedio && <> · promedio <span className="text-amber-500 font-medium">{promedio} ★</span></>}
          {sinResponder > 0 && <> · <span className="text-marca-500">{sinResponder} sin responder</span></>}
        </p>
      </div>

      {total === 0 ? (
        <div className="mt-8 text-center py-12 bg-nocturno-500 border border-white/10 rounded-2xl">
          <div className="w-14 h-14 mx-auto bg-white/10 rounded-full grid place-items-center text-zinc-400">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="mt-4 font-semibold text-white">Todavía no hay reseñas</h3>
          <p className="mt-1 text-sm text-zinc-400">Cuando tus clientes califiquen sus citas, aparecerán acá.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {resenas.map((r) => (
            <TarjetaResena key={r.id} resena={r} onResponder={responderResena} />
          ))}
        </div>
      )}
    </div>
  )
}

function TarjetaResena({ resena, onResponder }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(resena.respuesta || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const iniciales = (resena.clienteNombre || 'C').split(' ').map((n) => n[0]).slice(0, 2).join('')

  const guardar = async () => {
    if (!texto.trim()) return
    setGuardando(true)
    setError(null)
    const { error: e } = await onResponder(resena.id, texto)
    setGuardando(false)
    if (e) { setError(e); return }
    setEditando(false)
  }

  const eliminar = async () => {
    if (!confirm('¿Quitar tu respuesta?')) return
    setGuardando(true)
    setError(null)
    const { error: e } = await onResponder(resena.id, '')
    setGuardando(false)
    if (e) { setError(e); return }
    setTexto('')
    setEditando(false)
  }

  const tieneRespuesta = !!resena.respuesta

  return (
    <div className="bg-nocturno-500 border border-white/10 rounded-2xl p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-marca-500/15 grid place-items-center text-marca-500 font-semibold text-xs shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white flex items-center gap-1 truncate">
              {resena.clienteNombre}
              {resena.reservaId && (
                <span title="Cliente verificado">
                  <BadgeCheck className="w-3.5 h-3.5 text-marca-500 shrink-0" />
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400">{tiempoRelativo(resena.createdAt)}</div>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < resena.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-600'}`} />
          ))}
        </div>
      </div>

      {resena.comentario && <p className="mt-3 text-sm text-zinc-200 leading-relaxed">{resena.comentario}</p>}

      {/* Respuesta */}
      <div className="mt-3 pt-3 border-t border-white/5">
        {tieneRespuesta && !editando ? (
          <div className="bg-marca-500/10 border border-marca-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-marca-500 uppercase tracking-wide">
              <MessageSquare className="w-3 h-3" /> Tu respuesta
              {resena.respuestaAt && <span className="text-zinc-500 normal-case font-normal">· {tiempoRelativo(resena.respuestaAt)}</span>}
            </div>
            <p className="mt-1.5 text-sm text-zinc-200 leading-relaxed">{resena.respuesta}</p>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setEditando(true)} className="text-xs text-marca-500 hover:underline">Editar</button>
              <button onClick={eliminar} disabled={guardando} className="text-xs text-red-500 hover:underline disabled:opacity-50">Quitar</button>
            </div>
          </div>
        ) : editando || !tieneRespuesta ? (
          <div>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={2}
              placeholder="Responde a este cliente con amabilidad…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 resize-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={guardar}
                disabled={!texto.trim() || guardando}
                className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> {guardando ? 'Guardando…' : tieneRespuesta ? 'Guardar' : 'Responder'}
              </button>
              {editando && (
                <button
                  onClick={() => { setEditando(false); setTexto(resena.respuesta || '') }}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-2"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : null}
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}
