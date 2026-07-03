'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Check, Store, MapPin, Phone, User, Mail, Lock, Sparkles, AlertCircle, ImagePlus, X, Navigation, Loader2, Clock } from 'lucide-react'
import { CATEGORIAS } from '@/lib/data/categorias'
import { useDatosStore } from '@/lib/store-datos'
import { CIUDAD } from '@/lib/data/negocios'
import { CIUDADES, ciudadesActivas } from '@/lib/data/ciudades'
import { comprimirImagen, horarioSemanalDefault, resumenHorario } from '@/lib/utils'
import Logo from '@/components/Logo'
import HorarioEditor from '@/components/HorarioEditor'

const MapaPin = dynamic(() => import('@/components/MapaPin'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-white/10 grid place-items-center text-zinc-400 text-sm">
      Cargando mapa…
    </div>
  )
})

const PASOS = ['Tu negocio', 'Ubicación', 'Horario', 'Contacto', 'Listo']

export default function OnboardingPage() {
  const agregarNegocio = useDatosStore((s) => s.agregarNegocio)
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    logo: null,
    direccion: '',
    barrio: '',
    lat: CIUDAD.centro.lat,
    lng: CIUDAD.centro.lng,
    horarioSemanal: horarioSemanalDefault(),
    telefono: '',
    email: '',
    password: '',
    responsable: ''
  })
  const [estado, setEstado] = useState('idle') // 'idle' | 'creando' | 'creado' | 'error'
  const [errorMsg, setErrorMsg] = useState(null)
  const [idCreado, setIdCreado] = useState(null)
  const [ubicacionTocada, setUbicacionTocada] = useState(false)

  const actualizar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))
  const actualizarUbicacion = (lat, lng) => {
    setDatos((d) => ({ ...d, lat, lng }))
    setUbicacionTocada(true)
  }

  const puedeAvanzar = () => {
    if (paso === 0) return datos.nombre && datos.categoria && datos.descripcion && datos.logo
    if (paso === 1) return datos.direccion && datos.barrio && ubicacionTocada
    if (paso === 2) {
      const abiertos = datos.horarioSemanal.filter((d) => d.abierto)
      return abiertos.length > 0 && abiertos.every((d) => d.apertura < d.cierre)
    }
    if (paso === 3) return datos.telefono && datos.email && datos.responsable && datos.password && datos.password.length >= 6
    return false
  }

  const siguiente = async () => {
    // Al salir del paso Contacto (3) disparamos el insert
    if (paso === 3) {
      setPaso(4)
      await crearNegocio()
      return
    }
    if (paso < PASOS.length - 1) setPaso(paso + 1)
  }

  const crearNegocio = async () => {
    setEstado('creando')
    setErrorMsg(null)
    const { id, error } = await agregarNegocio({
      nombre: datos.nombre,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      direccion: datos.direccion,
      barrio: datos.barrio,
      telefono: datos.telefono,
      lat: datos.lat,
      lng: datos.lng,
      horario: resumenHorario(datos.horarioSemanal),
      horarioSemanal: datos.horarioSemanal,
      logo: datos.logo,
      email: datos.email,
      password: datos.password
    })
    if (error) {
      setEstado('error')
      setErrorMsg(error)
    } else {
      setEstado('creado')
      setIdCreado(id)
    }
  }

  return (
    <main className="min-h-screen bg-white/5">
      <header className="sticky top-0 z-20 bg-nocturno-500 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="hidden sm:inline text-xs text-zinc-400 font-medium border-l border-white/10 pl-2 ml-1">
              Negocios
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {PASOS.map((nombre, i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i <= paso ? 'bg-marca-500' : 'bg-white/10'
                }`}
              />
              <div className={`mt-2 text-xs ${i === paso ? 'text-marca-600 font-medium' : 'text-zinc-400'}`}>
                {nombre}
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-nocturno-500 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-suave">
          {paso === 0 && <PasoNegocio datos={datos} actualizar={actualizar} />}
          {paso === 1 && (
            <PasoUbicacion
              datos={datos}
              actualizar={actualizar}
              actualizarUbicacion={actualizarUbicacion}
              ubicacionTocada={ubicacionTocada}
            />
          )}
          {paso === 2 && <PasoHorario datos={datos} actualizar={actualizar} />}
          {paso === 3 && <PasoContacto datos={datos} actualizar={actualizar} />}
          {paso === 4 && (
            <PasoListo
              datos={datos}
              estado={estado}
              errorMsg={errorMsg}
              idCreado={idCreado}
              reintentar={crearNegocio}
            />
          )}

          {paso < PASOS.length - 1 && (
            <div className="mt-8 flex items-center justify-between">
              {paso > 0 ? (
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="text-sm text-zinc-300 hover:text-white px-4 py-2"
                >
                  Atrás
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={siguiente}
                disabled={!puedeAvanzar()}
                className="bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-full transition"
              >
                {paso === 3 ? 'Crear negocio' : 'Continuar'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Plan básico gratuito · Sin compromisos
        </p>
      </div>
    </main>
  )
}

function PasoNegocio({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <Store className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 1 de 4</span>
      </div>
      <h2 className="text-2xl font-semibold text-white">Cuéntanos de tu negocio</h2>
      <p className="text-zinc-300 mt-1">Información básica que verán tus futuros clientes.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Nombre del negocio"
          placeholder="Ej. Don Carlos Barbería Clásica"
          valor={datos.nombre}
          onChange={(v) => actualizar('nombre', v)}
        />
        <div>
          <label className="text-sm font-medium text-zinc-200">Categoría</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => actualizar('categoria', c.id)}
                className={`p-3 rounded-xl text-sm font-medium border-2 transition ${
                  datos.categoria === c.id
                    ? 'border-marca-500 bg-marca-500/10 text-marca-600'
                    : 'border-white/10 hover:border-white/20 text-zinc-200'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
        <Campo
          etiqueta="Descripción corta"
          placeholder="Ej. Barbería tradicional con afeitado clásico y servicios premium."
          valor={datos.descripcion}
          onChange={(v) => actualizar('descripcion', v)}
          textarea
        />
        <CampoLogo valor={datos.logo} onChange={(v) => actualizar('logo', v)} />
      </div>
    </div>
  )
}

function CampoLogo({ valor, onChange }) {
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const handleArchivo = async (file) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (jpg, png, webp).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 5 MB.')
      return
    }
    setProcesando(true)
    try {
      const dataUrl = await comprimirImagen(file, 256)
      onChange(dataUrl)
    } catch (e) {
      setError('No se pudo procesar la imagen.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-zinc-200">
        Logo del negocio <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-zinc-400 mt-0.5">
        Esta imagen aparecerá como el pin de tu negocio en el mapa.
      </p>

      {valor ? (
        <div className="mt-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3">
          <img
            src={valor}
            alt="Logo del negocio"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Logo listo</div>
            <div className="text-xs text-zinc-400 mt-0.5">256 × 256 px · jpeg comprimido</div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Quitar y subir otro
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`mt-2 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-8 px-4 cursor-pointer transition ${
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
              <span className="text-sm font-medium text-zinc-200">Sube el logo</span>
              <span className="text-xs text-zinc-400">JPG, PNG o WEBP · máx. 5 MB</span>
            </>
          )}
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function PasoUbicacion({ datos, actualizar, actualizarUbicacion, ubicacionTocada }) {
  const [buscandoGps, setBuscandoGps] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  const usarMiUbicacion = () => {
    setGpsError(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Tu navegador no permite geolocalización. Marca el pin a mano.')
      return
    }
    setBuscandoGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        actualizarUbicacion(pos.coords.latitude, pos.coords.longitude)
        setBuscandoGps(false)
      },
      (err) => {
        setBuscandoGps(false)
        setGpsError(
          err && err.code === 1
            ? 'Permiso de ubicación denegado. Marca el pin a mano en el mapa.'
            : 'No pudimos obtener tu ubicación. Marca el pin a mano.'
        )
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  const activas = ciudadesActivas()
  const proximas = CIUDADES.filter((c) => !c.activa)

  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <MapPin className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 2 de 4</span>
      </div>
      <h2 className="text-2xl font-semibold text-white">¿Dónde están ubicados?</h2>
      <p className="text-zinc-300 mt-1">Para que aparezcan en el mapa de NearUs.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Dirección completa"
          placeholder="Ej. Calle Larga 7-65 y Luis Cordero"
          valor={datos.direccion}
          onChange={(v) => actualizar('direccion', v)}
        />
        <Campo
          etiqueta="Barrio o sector"
          placeholder="Ej. Centro Histórico, El Vergel, Yanuncay..."
          valor={datos.barrio}
          onChange={(v) => actualizar('barrio', v)}
        />

        <div>
          <label className="text-sm font-medium text-zinc-200">Marca tu ubicación exacta</label>

          <button
            type="button"
            onClick={usarMiUbicacion}
            disabled={buscandoGps}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-marca-500/10 hover:bg-marca-500/15 disabled:opacity-60 text-marca-700 font-medium py-3 rounded-2xl border border-marca-500/20 transition"
          >
            {buscandoGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Buscando tu ubicación…
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" /> Usar mi ubicación actual
              </>
            )}
          </button>
          <p className="mt-1 text-xs text-zinc-400">
            Te dejamos el pin donde estás; luego podés ajustarlo a la dirección exacta del local.
          </p>
          {gpsError && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              {gpsError}
            </p>
          )}

          <div className="mt-3">
            <MapaPin lat={datos.lat} lng={datos.lng} onCambio={actualizarUbicacion} />
          </div>
          {!ubicacionTocada && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Confirma la ubicación tocando el mapa o arrastrando el pin.
            </p>
          )}
          {ubicacionTocada && (
            <p className="mt-2 text-xs text-acento-600 bg-acento-500/10 border border-acento-500/20 rounded-lg px-3 py-2">
              Ubicación lista: {datos.lat.toFixed(5)}, {datos.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div className="bg-marca-500/10 border border-marca-500/20 rounded-2xl p-4 text-sm text-marca-700">
          <p className="font-medium">
            {activas.map((c) => c.nombre).join(' · ')} · {activas[0]?.pais}
          </p>
          {proximas.length > 0 && (
            <p className="text-marca-600 mt-1 text-xs">
              Por ahora operamos en {activas.map((c) => c.nombre).join(', ')}.
              Próximamente {proximas.map((c) => c.nombre).join(', ')}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function PasoHorario({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 3 de 4</span>
      </div>
      <h2 className="text-2xl font-semibold text-white">¿Cuál es tu horario?</h2>
      <p className="text-zinc-300 mt-1">Marca los días que abres y a qué hora. Tus clientes solo podrán reservar en estos horarios.</p>

      <div className="mt-6">
        <HorarioEditor
          valor={datos.horarioSemanal}
          onChange={(v) => actualizar('horarioSemanal', v)}
        />
      </div>
    </div>
  )
}

function PasoContacto({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <Phone className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 4 de 4</span>
      </div>
      <h2 className="text-2xl font-semibold text-white">Datos de contacto</h2>
      <p className="text-zinc-300 mt-1">Te enviaremos el acceso al panel del negocio.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Nombre del responsable"
          placeholder="Ej. Carlos Ortega"
          valor={datos.responsable}
          onChange={(v) => actualizar('responsable', v)}
          icono={User}
        />
        <Campo
          etiqueta="Celular"
          placeholder="+593 99 123 4567"
          valor={datos.telefono}
          onChange={(v) => actualizar('telefono', v)}
          icono={Phone}
          type="tel"
        />
        <Campo
          etiqueta="Correo electrónico"
          placeholder="contacto@tunegocio.ec"
          valor={datos.email}
          onChange={(v) => actualizar('email', v)}
          icono={Mail}
          type="email"
        />
        <Campo
          etiqueta="Contraseña para acceder al panel"
          placeholder="Mínimo 6 caracteres"
          valor={datos.password}
          onChange={(v) => actualizar('password', v)}
          icono={Lock}
          type="password"
        />
        <p className="text-xs text-zinc-400 -mt-2">
          Con este email y contraseña vas a entrar al panel de tu negocio en NearUs.
        </p>
      </div>
    </div>
  )
}

function PasoListo({ datos, estado, errorMsg, idCreado, reintentar }) {
  if (estado === 'creando') {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto border-4 border-white/10 border-t-marca-500 rounded-full animate-spin" />
        <h2 className="mt-6 text-xl font-semibold text-white">Creando tu negocio…</h2>
        <p className="text-zinc-400 mt-2 text-sm">Estamos publicando <strong>{datos.nombre}</strong> en el mapa.</p>
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto bg-red-500/15 rounded-full grid place-items-center">
          <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-white">No pudimos crear el negocio</h2>
        <p className="text-zinc-300 mt-2 max-w-md mx-auto text-sm">{errorMsg}</p>
        <button
          onClick={reintentar}
          className="mt-5 bg-marca-500 hover:bg-marca-600 text-white font-semibold px-6 py-3 rounded-full"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // estado === 'creado'
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto bg-acento-500 rounded-full grid place-items-center">
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-white">¡Bienvenido a NearUs!</h2>
      <p className="text-zinc-300 mt-2 max-w-md mx-auto">
        <strong>{datos.nombre}</strong> ya está publicado en el mapa de Cuenca. Tus futuros clientes
        ya pueden encontrarte.
      </p>

      <div className="mt-6 bg-marca-500/10 border border-marca-500/20 rounded-2xl p-5 text-left max-w-md mx-auto">
        <div className="flex items-center gap-2 text-marca-700 font-medium text-sm">
          <Sparkles className="w-4 h-4" />
          Próximos pasos
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/explorar?focus=${idCreado}`}
            className="bg-marca-500 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-marca-600 text-center"
          >
            Ver en el mapa
          </Link>
          <Link
            href={`/explorar/${idCreado}`}
            className="bg-nocturno-500 border border-marca-500/20 rounded-xl px-4 py-3 text-sm font-medium text-marca-600 hover:bg-marca-500/10 text-center"
          >
            Ver mi negocio
          </Link>
        </div>
        <Link
          href="/negocio/inicio"
          className="mt-2 block bg-nocturno-500 border border-marca-500/20 rounded-xl px-4 py-3 text-sm font-medium text-marca-600 hover:bg-marca-500/10 text-center"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

function Campo({ etiqueta, placeholder, valor, onChange, type = 'text', textarea, icono: Icono }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-200">{etiqueta}</label>
      <div className="mt-2 relative">
        {Icono && <Icono className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />}
        {textarea ? (
          <textarea
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 transition resize-none"
          />
        ) : (
          <input
            type={type}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 transition ${
              Icono ? 'pl-11 pr-4' : 'px-4'
            }`}
          />
        )}
      </div>
    </div>
  )
}
