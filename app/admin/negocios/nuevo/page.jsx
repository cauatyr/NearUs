'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Loader2, Store, MapPin, Clock, KeyRound, Image as ImageIcon } from 'lucide-react'
import CampoFoto from '@/components/CampoFoto'
import HorarioEditor from '@/components/HorarioEditor'
import SelectorUbicacion from '@/components/SelectorUbicacion'
import { CATEGORIAS } from '@/lib/data/categorias'
import { CIUDAD_DEFECTO } from '@/lib/data/ciudades'
import { useDatosStore } from '@/lib/store-datos'
import { fetchAdmin } from '@/lib/store-admin'
import { horarioSemanalDefault, resumenHorario } from '@/lib/utils'

export default function NuevoNegocioPage() {
  const router = useRouter()
  const absorberNegocio = useDatosStore((s) => s.absorberNegocio)

  const [datos, setDatos] = useState({
    nombre: '',
    categoria: 'barberia',
    descripcion: '',
    telefono: '',
    direccion: '',
    barrio: '',
    lat: CIUDAD_DEFECTO.centro.lat,
    lng: CIUDAD_DEFECTO.centro.lng,
    logo: null,
    horarioSemanal: horarioSemanalDefault(),
    aceptaAhora: false,
    destacado: false,
    email: '',
    password: ''
  })
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const set = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)

    if (!datos.nombre.trim()) return setError('Ponele un nombre al negocio.')
    if (!ubicacionConfirmada) return setError('Confirmá la ubicación en el mapa antes de guardar.')
    if (datos.email && !datos.password) return setError('Si ponés email del dueño, también necesitás una contraseña.')
    if (datos.password && datos.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')

    setGuardando(true)
    const { datos: respuesta, error: err } = await fetchAdmin('/api/admin/negocios', {
      method: 'POST',
      body: JSON.stringify({
        nombre: datos.nombre.trim(),
        categoria: datos.categoria,
        descripcion: datos.descripcion.trim() || null,
        telefono: datos.telefono.trim() || null,
        direccion: datos.direccion.trim() || null,
        barrio: datos.barrio.trim() || null,
        lat: datos.lat,
        lng: datos.lng,
        logo: datos.logo,
        horarioSemanal: datos.horarioSemanal,
        horario: resumenHorario(datos.horarioSemanal),
        aceptaAhora: datos.aceptaAhora,
        destacado: datos.destacado,
        email: datos.email.trim() || null,
        password: datos.password || null
      })
    })
    setGuardando(false)

    if (err) return setError(err)

    const negocio = absorberNegocio(respuesta.negocio)
    router.push(`/admin/negocios/${negocio.id}`)
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Negocios
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-white">Nuevo negocio</h1>
      <p className="text-sm text-zinc-400">
        Se crea ya publicado. Los servicios y el equipo se cargan después, desde el panel del negocio.
      </p>

      {error && (
        <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={guardar} className="mt-5 space-y-5">
        {/* Identidad */}
        <Bloque icono={Store} titulo="Identidad">
          <Campo etiqueta="Nombre del negocio" valor={datos.nombre} onChange={(v) => set('nombre', v)} placeholder="Ej. Bigotté Barbershop" />

          <div>
            <label className="text-sm font-medium text-zinc-200">Categoría</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('categoria', c.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition flex items-center gap-2 ${
                    datos.categoria === c.id
                      ? 'bg-white/15 border-white/25 text-white'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          <CampoArea
            etiqueta="Descripción"
            valor={datos.descripcion}
            onChange={(v) => set('descripcion', v)}
            placeholder="Qué hace especial a este lugar…"
          />
          <Campo etiqueta="Teléfono" valor={datos.telefono} onChange={(v) => set('telefono', v)} placeholder="+593 99 000 0000" />
        </Bloque>

        {/* Logo */}
        <Bloque icono={ImageIcon} titulo="Logo" nota="PNG con fondo transparente sale mejor. Aparece dentro del pin del mapa.">
          <CampoFoto
            valor={datos.logo}
            onChange={(v) => set('logo', v)}
            label="Logo del negocio"
            forma="circulo"
            tamano={256}
          />
        </Bloque>

        {/* Ubicación */}
        <Bloque icono={MapPin} titulo="Ubicación exacta" nota="Tocá el mapa o arrastrá el pin. El pin es lo que decide dónde aparece el negocio.">
          <Campo etiqueta="Dirección" valor={datos.direccion} onChange={(v) => set('direccion', v)} placeholder="Calle Larga 7-65 y Luis Cordero" />
          <Campo etiqueta="Barrio o sector" valor={datos.barrio} onChange={(v) => set('barrio', v)} placeholder="Centro Histórico" />
          <SelectorUbicacion
            lat={datos.lat}
            lng={datos.lng}
            onCambio={(la, ln) => setDatos((d) => ({ ...d, lat: la, lng: ln }))}
            confirmada={ubicacionConfirmada}
            onConfirmar={setUbicacionConfirmada}
          />
        </Bloque>

        {/* Horario */}
        <Bloque icono={Clock} titulo="Horario" nota="Podés marcar pausa de almuerzo por día.">
          <HorarioEditor
            valor={datos.horarioSemanal}
            onChange={(v) => set('horarioSemanal', v)}
          />
        </Bloque>

        {/* Cuenta del dueño */}
        <Bloque
          icono={KeyRound}
          titulo="Acceso del dueño"
          nota="Opcional. Con esto el dueño entra a su panel en /login. Si lo dejás vacío, el negocio queda sin dueño y sólo vos podés gestionarlo."
        >
          <Campo etiqueta="Email del dueño" tipo="email" valor={datos.email} onChange={(v) => set('email', v)} placeholder="negocio@nearus.ec" />
          <Campo etiqueta="Contraseña" tipo="text" valor={datos.password} onChange={(v) => set('password', v)} placeholder="Mínimo 6 caracteres" />
          <p className="text-xs text-zinc-500">
            Anotá la contraseña: se la tenés que pasar al dueño y no se puede ver después.
          </p>
        </Bloque>

        {/* Flags */}
        <Bloque icono={Store} titulo="Visibilidad">
          <Interruptor
            valor={datos.aceptaAhora}
            onChange={(v) => set('aceptaAhora', v)}
            titulo="Acepta clientes ahora"
            nota="Aparece en Near you para atención inmediata."
          />
          <Interruptor
            valor={datos.destacado}
            onChange={(v) => set('destacado', v)}
            titulo="Destacado (Plan Pro)"
            nota="Corona dorada y prioridad en la lista."
          />
        </Bloque>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition"
          >
            {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
            {guardando ? 'Creando…' : 'Crear negocio'}
          </button>
          <Link
            href="/admin/negocios"
            className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

function Bloque({ icono: Icono, titulo, nota, children }) {
  return (
    <section className="bg-nocturno-500 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center shrink-0">
          <Icono className="w-4 h-4 text-marca-500" />
        </div>
        <div>
          <div className="font-semibold text-white">{titulo}</div>
          {nota && <div className="text-xs text-zinc-500 mt-0.5">{nota}</div>}
        </div>
      </div>
      {children}
    </section>
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

function CampoArea({ etiqueta, valor, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-200">{etiqueta}</label>
      <textarea
        rows={3}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-marca-500 transition resize-none"
      />
    </div>
  )
}

function Interruptor({ valor, onChange, titulo, nota }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!valor)}
      className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3.5 text-left transition"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{titulo}</div>
        <div className="text-xs text-zinc-500">{nota}</div>
      </div>
      <div
        className={`w-11 h-6 rounded-full shrink-0 transition relative ${
          valor ? 'bg-marca-500' : 'bg-white/15'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
            valor ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  )
}
