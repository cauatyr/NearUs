'use client'
import { useState, useEffect } from 'react'
import { ImagePlus, X, Phone, Check, AlertCircle, Lock } from 'lucide-react'
import { useDatosStore } from '@/lib/store-datos'
import { useNegocios } from '@/lib/data/negocios'
import { useSesion } from '@/lib/store-sesion'
import { comprimirImagen, logoPlaceholder, horarioSemanalDefault, resumenHorario } from '@/lib/utils'
import { CATEGORIAS } from '@/lib/data/categorias'
import HorarioEditor from '@/components/HorarioEditor'

export default function ConfiguracionPage() {
  const negocioId = useSesion((s) => s.negocioId)
  const negocios = useNegocios()
  const negocio = negocios.find((n) => n.id === negocioId)
  const actualizarNegocio = useDatosStore((s) => s.actualizarNegocio)

  const [imagen, setImagen] = useState('')
  const [telefono, setTelefono] = useState('')
  const [horarioSemanal, setHorarioSemanal] = useState(null)
  const [estado, setEstado] = useState('idle') // 'idle' | 'guardando' | 'guardado' | 'error'
  const [error, setError] = useState(null)

  // Hidrata estado local quando el negocio cargue del store
  useEffect(() => {
    if (negocio) {
      setImagen(negocio.imagen || '')
      setTelefono(negocio.telefono || '')
      setHorarioSemanal(negocio.horarioSemanal || horarioSemanalDefault())
    }
  }, [negocio])

  if (!negocio) {
    return (
      <div className="p-5 md:p-8">
        <p className="text-zinc-400">Cargando negocio…</p>
      </div>
    )
  }

  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)
  const sinCambios =
    imagen === (negocio.imagen || '') &&
    telefono === (negocio.telefono || '') &&
    JSON.stringify(horarioSemanal) === JSON.stringify(negocio.horarioSemanal || horarioSemanalDefault())

  const guardar = async () => {
    setEstado('guardando')
    setError(null)
    const { error: e } = await actualizarNegocio(negocio.id, {
      imagen,
      telefono,
      horario: resumenHorario(horarioSemanal),
      horarioSemanal
    })
    if (e) {
      setEstado('error')
      setError(e)
    } else {
      setEstado('guardado')
      setTimeout(() => setEstado('idle'), 2500)
    }
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Configuración</h1>
          <p className="text-sm text-zinc-400">Editá la foto principal, el contacto y el horario de tu negocio.</p>
        </div>
        <button
          onClick={guardar}
          disabled={sinCambios || estado === 'guardando'}
          className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-full flex items-center gap-2"
        >
          {estado === 'guardando' && (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {estado === 'guardado' && <Check className="w-4 h-4" strokeWidth={3} />}
          {estado === 'guardando' ? 'Guardando…' : estado === 'guardado' ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">No pudimos guardar los cambios</div>
            <div className="text-xs mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Logo (readonly) */}
      <Seccion titulo="Logo del negocio" descripcion="La identidad visual de tu marca en el mapa. No se edita aquí.">
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 grid place-items-center border-2 border-white shadow"
            style={{ backgroundColor: categoria?.color || '#2BACE2' }}
          >
            <img
              src={negocio.logo || logoPlaceholder(negocio.nombre, categoria?.color)}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate">{negocio.nombre}</div>
            <div className="mt-0.5 text-xs text-zinc-400">{categoria?.nombre} · {negocio.barrio}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-nocturno-500 border border-white/10 rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" /> Solo se cambia desde soporte
            </div>
          </div>
        </div>
      </Seccion>

      {/* Foto principal */}
      <Seccion
        titulo="Foto principal del negocio"
        descripcion="Esta foto aparece en la tarjeta del negocio y en el detalle. Es distinta de la logo del pin."
      >
        <CampoFoto valor={imagen} onChange={setImagen} />
      </Seccion>

      {/* Contacto */}
      <Seccion titulo="Contacto" descripcion="Cómo te van a contactar tus clientes.">
        <CampoInput
          icono={Phone}
          etiqueta="Teléfono"
          placeholder="+593 99 123 4567"
          valor={telefono}
          onChange={setTelefono}
        />
      </Seccion>

      {/* Horario */}
      <Seccion
        titulo="Horario de atención"
        descripcion="Marca los días y las horas que abrís. Los clientes solo podrán reservar dentro de este horario."
      >
        <HorarioEditor
          valor={horarioSemanal || horarioSemanalDefault()}
          onChange={setHorarioSemanal}
        />
      </Seccion>
    </div>
  )
}

function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="mb-6 bg-nocturno-500 rounded-2xl border border-white/10 p-5">
      <h2 className="text-base font-semibold text-white">{titulo}</h2>
      <p className="text-xs text-zinc-400 mt-0.5">{descripcion}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function CampoFoto({ valor, onChange }) {
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const handleArchivo = async (file) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 8 MB.')
      return
    }
    setProcesando(true)
    try {
      // Foto grande: 1200px y JPEG para mantener peso bajo
      const dataUrl = await comprimirImagen(file, 1200, 'image/jpeg')
      onChange(dataUrl)
    } catch (e) {
      setError('No se pudo procesar la imagen.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      {valor ? (
        <div className="space-y-3">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-white/10 border border-white/10">
            <img src={valor} alt="Foto del negocio" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-nocturno-500 border border-white/10 hover:bg-white/5 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={procesando}
                onChange={(e) => handleArchivo(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 px-3 py-2"
            >
              <X className="w-4 h-4" /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-10 px-4 cursor-pointer transition ${
            procesando
              ? 'border-marca-300 bg-marca-500/10'
              : 'border-white/20 hover:border-marca-500 hover:bg-marca-500/10'
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
              <div className="w-8 h-8 border-2 border-marca-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-marca-700 font-medium">Procesando imagen…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Sube una foto del negocio</span>
              <span className="text-xs text-zinc-400">Se recomienda formato horizontal · máx. 8 MB</span>
            </>
          )}
        </label>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function CampoInput({ icono: Icono, etiqueta, placeholder, valor, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-200">{etiqueta}</label>
      <div className="mt-2 relative">
        {Icono && <Icono className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />}
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 transition"
        />
      </div>
    </div>
  )
}
