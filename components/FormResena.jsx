'use client'
import { useState } from 'react'
import { Star, Send } from 'lucide-react'

// Tarjeta para calificar una cita completada. onSubmit(rating, comentario) async.
export default function FormResena({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async () => {
    if (!rating || enviando) return
    setEnviando(true)
    const { error } = (await onSubmit(rating, comentario.trim())) || {}
    if (error) setEnviando(false) // deja reintentar; si ok, el padre desmonta la tarjeta
  }

  return (
    <div className="bg-gradient-to-br from-marca-500/15 to-nocturno-500 rounded-3xl border border-marca-500/30 p-5">
      <div className="text-center">
        <h3 className="font-semibold text-white">¿Cómo estuvo tu cita?</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Tu opinión ayuda a otros clientes.</p>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${n} estrellas`}
          >
            <Star
              className={`w-8 h-8 ${
                n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntanos cómo fue tu experiencia (opcional)"
            rows={3}
            className="mt-4 w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-marca-500/50 resize-none"
          />
          <button
            disabled={enviando}
            onClick={enviar}
            className="mt-3 w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
          >
            {enviando ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-4 h-4" /> Enviar reseña</>
            )}
          </button>
        </>
      )}
    </div>
  )
}
