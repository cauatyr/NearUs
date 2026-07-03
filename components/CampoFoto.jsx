'use client'
import { useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { comprimirImagen } from '@/lib/utils'

// Campo genérico de subida de foto → devuelve un dataURL (jpeg comprimido).
// Reutilizado en servicios (cuadrado) y profesionales (redondo).
// props:
//   valor    dataURL actual o null
//   onChange (dataURL|null) => void
//   label    texto de la etiqueta
//   forma    'circulo' | 'cuadrado' (default 'cuadrado')
//   tamano   px máximos de la imagen comprimida (default 512)
export default function CampoFoto({ valor, onChange, label = 'Foto', forma = 'cuadrado', tamano = 512 }) {
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const redondo = forma === 'circulo'

  const handleArchivo = async (file) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (jpg, png, webp).')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 8 MB.')
      return
    }
    setProcesando(true)
    try {
      const dataUrl = await comprimirImagen(file, tamano, 'image/jpeg')
      onChange(dataUrl)
    } catch (e) {
      setError('No se pudo procesar la imagen.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-zinc-300">{label}</label>
      <div className="mt-1.5 flex items-center gap-3">
        {valor ? (
          <img
            src={valor}
            alt={label}
            className={`w-16 h-16 object-cover border border-white/10 ${redondo ? 'rounded-full' : 'rounded-xl'}`}
          />
        ) : (
          <div
            className={`w-16 h-16 grid place-items-center bg-white/5 border border-dashed border-white/15 text-zinc-500 ${
              redondo ? 'rounded-full' : 'rounded-xl'
            }`}
          >
            <ImagePlus className="w-5 h-5" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition ${
              procesando
                ? 'bg-marca-500/10 text-marca-600'
                : 'bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={procesando}
              onChange={(e) => handleArchivo(e.target.files?.[0])}
            />
            {procesando ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando…
              </>
            ) : (
              <>
                <ImagePlus className="w-3.5 h-3.5" /> {valor ? 'Cambiar foto' : 'Subir foto'}
              </>
            )}
          </label>
          {valor && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-400"
            >
              <X className="w-3 h-3" /> Quitar
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}
