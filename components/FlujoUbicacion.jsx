'use client'
import { useEffect, useState } from 'react'
import { MapPin, Navigation, ChevronRight, Globe2, Loader2 } from 'lucide-react'
import { useUbicacion } from '@/lib/store'
import { ciudadesActivas } from '@/lib/data/ciudades'

// Bandera de sesión: ya le preguntamos por el GPS en esta visita. Evita
// repetir el cartel en cada navegación, pero al abrir el app de nuevo vuelve a
// preguntar mientras no tengamos su ubicación exacta.
const SS_PREGUNTADO = 'nearus.gps-preguntado'

function yaPreguntamosEstaSesion() {
  try {
    return sessionStorage.getItem(SS_PREGUNTADO) === '1'
  } catch {
    return false
  }
}

function marcarPreguntado() {
  try {
    sessionStorage.setItem(SS_PREGUNTADO, '1')
  } catch {}
}

// Overlay que resuelve la ubicación del usuario al entrar:
//   1) Soft-prompt amable ("¿permitir ubicación?")
//   2) Permiso real del navegador
//   3) Si lo niega / está fuera de cobertura → selector de ciudad manual
//
// La ciudad se recuerda entre visitas, pero la POSICIÓN exacta no: cada vez que
// el app abre sin GPS real, o se refresca en silencio (si el permiso ya está
// dado) o se vuelve a pedir. Sin eso, todas las distancias y el Near you salían
// medidos desde el centro de la ciudad en vez de desde la persona.
export default function FlujoUbicacion() {
  const { estado, ciudad, gpsConcedido, reabierto, pedirUbicacion, elegirCiudad } = useUbicacion()
  const [montado, setMontado] = useState(false)
  const [vista, setVista] = useState('auto') // 'auto' | 'selector'
  const [pospuesto, setPospuesto] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  // Al montar: miramos el permiso para no abrir el prompt nativo de la nada.
  //   granted → refrescamos la posición en silencio (aunque ya haya ciudad)
  //   denied  → sin ciudad, lo resolvemos a 'denegada' (sale el selector)
  //   prompt  → dejamos que se vea el soft-prompt
  useEffect(() => {
    if (!montado) return
    if (useUbicacion.getState().gpsConcedido) return

    let cancelado = false
    const permisos = typeof navigator !== 'undefined' ? navigator.permissions : null
    if (permisos && permisos.query) {
      permisos
        .query({ name: 'geolocation' })
        .then((res) => {
          if (cancelado) return
          if (res.state === 'granted') {
            pedirUbicacion(true)
          } else if (res.state === 'denied' && !useUbicacion.getState().ciudad) {
            pedirUbicacion(true)
          }
        })
        .catch(() => {})
    }
    return () => {
      cancelado = true
    }
  }, [montado, pedirUbicacion])

  if (!montado) return null

  const hayCiudad = !!ciudad
  // El usuario tocó el chip de ciudad para cambiarla: eso manda sobre todo lo
  // demás, incluso si ya tenemos su GPS.
  const cambiandoCiudad = reabierto || vista === 'selector'

  let contenido = null

  if (estado === 'pidiendo') {
    contenido = <Pidiendo />
  } else if (cambiandoCiudad) {
    contenido = (
      <SelectorCiudad
        motivo={estado}
        onElegir={(c) => {
          elegirCiudad(c)
          setVista('auto')
        }}
      />
    )
  } else if (gpsConcedido) {
    return null // ya sabemos dónde está: nada que preguntar
  } else if (!hayCiudad) {
    // Primera vez (o negó y todavía no eligió ciudad): flujo completo.
    contenido =
      estado === 'denegada' || estado === 'no-soportada' || estado === 'fuera-cobertura' ? (
        <SelectorCiudad motivo={estado} onElegir={(c) => elegirCiudad(c)} />
      ) : (
        <SoftPrompt onPermitir={() => pedirUbicacion(false)} onManual={() => setVista('selector')} />
      )
  } else {
    // Tiene ciudad pero no ubicación exacta. Preguntamos UNA vez por sesión, y
    // nunca si el navegador ya nos dijo que no. Para el resto queda el aviso
    // AvisoUbicacionExacta en las pantallas que dependen de la distancia.
    if (pospuesto || estado === 'denegada' || estado === 'no-soportada') return null
    if (yaPreguntamosEstaSesion()) return null
    contenido = (
      <SoftPrompt
        conCiudad={ciudad}
        onPermitir={() => {
          marcarPreguntado()
          pedirUbicacion(false)
        }}
        onManual={() => {
          marcarPreguntado()
          setPospuesto(true)
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-nocturno-500 rounded-3xl shadow-flotante overflow-hidden">
        {contenido}
      </div>
    </div>
  )
}

// conCiudad = ya sabe en qué ciudad está; lo que falta es el punto exacto.
function SoftPrompt({ onPermitir, onManual, conCiudad }) {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-marca-500/10 grid place-items-center text-marca-500">
        <Navigation className="w-8 h-8" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">
        {conCiudad ? '¿Dónde estás exactamente?' : '¿Dónde te mostramos?'}
      </h2>
      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
        {conCiudad ? (
          <>
            Estás explorando {conCiudad.nombre}, pero sin tu ubicación exacta las distancias
            salen medidas desde el centro de la ciudad y Near you no sabe de dónde partir.
          </>
        ) : (
          <>
            NearUs usa tu ubicación para abrir el mapa en tu ciudad y mostrarte los
            negocios cerca de ti. No la compartimos con nadie.
          </>
        )}
      </p>

      <button
        onClick={onPermitir}
        className="mt-5 w-full bg-marca-500 hover:bg-marca-600 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-marca"
      >
        <MapPin className="w-5 h-5" />
        {conCiudad ? 'Usar mi ubicación exacta' : 'Permitir mi ubicación'}
      </button>
      <button
        onClick={onManual}
        className="mt-2 w-full text-zinc-300 hover:text-white font-medium py-3 rounded-2xl transition text-sm"
      >
        {conCiudad ? 'Ahora no' : 'Elegir mi ciudad a mano'}
      </button>
    </div>
  )
}

function Pidiendo() {
  return (
    <div className="p-10 text-center">
      <Loader2 className="w-10 h-10 mx-auto text-marca-500 animate-spin" />
      <h2 className="mt-4 text-lg font-bold text-white">Buscando tu ubicación…</h2>
      <p className="mt-1 text-sm text-zinc-400">Acepta el permiso del navegador.</p>
    </div>
  )
}

function SelectorCiudad({ motivo, onElegir }) {
  const ciudades = ciudadesActivas()

  const encabezado =
    motivo === 'fuera-cobertura'
      ? {
          titulo: 'Todavía no llegamos a tu zona',
          texto:
            'NearUs aún no opera donde estás. Mientras tanto, podés explorar una de nuestras ciudades:'
        }
      : motivo === 'denegada'
      ? {
          titulo: 'Elegí tu ciudad',
          texto:
            'Sin tu ubicación no podemos detectarla automáticamente. Elegí dónde querés explorar:'
        }
      : {
          titulo: 'Elegí tu ciudad',
          texto: 'Seleccioná dónde querés ver los negocios de NearUs:'
        }

  return (
    <div className="p-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-marca-500/10 grid place-items-center text-marca-500">
        <Globe2 className="w-7 h-7" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white text-center">
        {encabezado.titulo}
      </h2>
      <p className="mt-2 text-sm text-zinc-300 text-center leading-relaxed">
        {encabezado.texto}
      </p>

      <div className="mt-5 space-y-2">
        {ciudades.map((c) => (
          <button
            key={c.id}
            onClick={() => onElegir(c)}
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-marca-500/10 border border-white/10 hover:border-marca-200 rounded-2xl p-3.5 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-nocturno-500 grid place-items-center text-marca-500 shadow-sm shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white leading-tight">{c.nombre}</div>
              <div className="text-xs text-zinc-400">{c.pais}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-marca-500 transition" />
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-400">
        Estamos sumando más ciudades pronto.
      </p>
    </div>
  )
}
