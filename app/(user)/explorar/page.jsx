'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import {
  Search, MapPin, X, Map as MapIcon, List, Locate, Star, Zap,
  ChevronRight, Sparkles, Heart, Calendar, Crown
} from 'lucide-react'
import { useNegocios } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { CIUDAD_DEFECTO, detectarCiudad, ciudadMasCercana } from '@/lib/data/ciudades'
import { useUbicacion, useReservas } from '@/lib/store'
import { distanciaKm, formatoDistancia } from '@/lib/utils'
import FlujoUbicacion from '@/components/FlujoUbicacion'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-100 grid place-items-center">
      <div className="text-zinc-400 text-sm flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-marca-500 border-t-transparent rounded-full animate-spin" />
        Cargando mapa...
      </div>
    </div>
  )
})

// IDs de negocios con destaque pago (simulado — vienen del módulo Promoción)
const DESTACADOS_IDS = ['n2', 'n13', 'n9']

export default function ExplorarPage() {
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [vista, setVista] = useState('mapa')
  const [focusAplicado, setFocusAplicado] = useState(false)
  const mapaRef = useRef(null)
  const { posicion, ciudad, gpsConcedido, reabrirFlujo, elegirCiudad } = useUbicacion()
  const NEGOCIOS = useNegocios()

  const ciudadActiva = ciudad || CIUDAD_DEFECTO

  // Solo los negocios que están DENTRO del radio de la ciudad activa. Un negocio
  // lejos (otra región/país) no aparece acá — se queda en su propia zona.
  const negociosCiudad = useMemo(
    () =>
      NEGOCIOS.filter(
        (n) =>
          distanciaKm(n.lat, n.lng, ciudadActiva.centro.lat, ciudadActiva.centro.lng) <=
          ciudadActiva.radioKm
      ),
    [NEGOCIOS, ciudadActiva]
  )

  const negociosFiltrados = useMemo(() => {
    let list = negociosCiudad
    if (categoria) list = list.filter((n) => n.categoria === categoria)
    if (busqueda) {
      const q = busqueda.toLowerCase()
      list = list.filter(
        (n) =>
          n.nombre.toLowerCase().includes(q) ||
          n.barrio.toLowerCase().includes(q) ||
          n.descripcion.toLowerCase().includes(q)
      )
    }
    return list
      .map((n) => ({
        ...n,
        _dist: distanciaKm(posicion.lat, posicion.lng, n.lat, n.lng),
        _destacado: DESTACADOS_IDS.includes(n.id)
      }))
      .sort((a, b) => {
        if (a._destacado !== b._destacado) return b._destacado - a._destacado
        return a._dist - b._dist
      })
  }, [negociosCiudad, busqueda, categoria, posicion])

  const negocioSel = seleccionado
    ? negociosFiltrados.find((n) => n.id === seleccionado)
    : null

  const centrarEnMi = () => {
    if (mapaRef.current) {
      mapaRef.current.flyTo([posicion.lat, posicion.lng], 15, { duration: 0.6 })
    }
  }

  useEffect(() => {
    if (vista === 'lista' && seleccionado) setSeleccionado(null)
  }, [vista, seleccionado])

  // ?focus=<id> viene del onboarding cuando recién se crea un negocio.
  // Limpia filtros, asegura vista mapa y selecciona — VolarA dispara el flyTo.
  useEffect(() => {
    if (!focusId || focusAplicado) return
    const existe = NEGOCIOS.find((n) => n.id === focusId)
    if (!existe) return
    // Nos paramos en la ciudad real del negocio recién creado para que se vea
    // (la que lo contiene por radio; si no, la más cercana).
    const ciudadNegocio =
      detectarCiudad(existe.lat, existe.lng) ||
      ciudadMasCercana(existe.lat, existe.lng).ciudad
    elegirCiudad(ciudadNegocio)
    setCategoria(null)
    setBusqueda('')
    setVista('mapa')
    setSeleccionado(focusId)
    setFocusAplicado(true)
  }, [focusId, focusAplicado, NEGOCIOS, elegirCiudad])

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-100">
      {/* Flujo de ubicación: soft-prompt → permiso → selector de ciudad */}
      <FlujoUbicacion />

      {/* === HEADER === */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 space-y-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={reabrirFlujo}
            className="flex-1 bg-white rounded-2xl shadow-flotante p-2.5 flex items-center gap-2 border border-zinc-100 text-left hover:border-marca-200 transition"
            aria-label="Cambiar de ciudad"
          >
            <MapPin className="w-4 h-4 text-marca-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-zinc-500 uppercase tracking-wide leading-tight">
                {gpsConcedido ? 'Estás en' : 'Explorando'}
              </div>
              <div className="text-sm font-bold text-black leading-tight truncate">
                {ciudadActiva.nombre}, {ciudadActiva.pais}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
          </button>

          <div className="bg-white rounded-2xl shadow-flotante p-1 flex items-center border border-zinc-100">
            <ToggleBtn activo={vista === 'mapa'} onClick={() => setVista('mapa')}>
              <MapIcon className="w-4 h-4" />
            </ToggleBtn>
            <ToggleBtn activo={vista === 'lista'} onClick={() => setVista('lista')}>
              <List className="w-4 h-4" />
            </ToggleBtn>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-flotante p-2 flex items-center gap-2 pointer-events-auto border border-zinc-100">
          <Search className="w-4 h-4 text-zinc-400 ml-2" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar salón, barbería, spa..."
            className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none py-1.5"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="text-zinc-400 hover:text-zinc-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 pointer-events-auto">
          <Pildora activo={!categoria} onClick={() => setCategoria(null)}>
            Todos · {negociosFiltrados.length}
          </Pildora>
          {CATEGORIAS.map((c) => {
            const count = negociosCiudad.filter((n) => n.categoria === c.id).length
            return (
              <Pildora
                key={c.id}
                activo={categoria === c.id}
                color={c.color}
                onClick={() => setCategoria(categoria === c.id ? null : c.id)}
              >
                {c.nombre} · {count}
              </Pildora>
            )
          })}
        </div>
      </div>

      {/* === MAPA (siempre montado) === */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-200 ${
          vista === 'mapa' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={vista !== 'mapa'}
      >
        <MapView
          negocios={negociosFiltrados}
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          usuario={gpsConcedido ? posicion : null}
          destacadosIds={DESTACADOS_IDS}
          mapaRef={mapaRef}
          centro={ciudadActiva.centro}
          zoom={ciudadActiva.zoom}
        />
      </div>

      {/* === BOTÓN LOCATE === */}
      {vista === 'mapa' && (
        <button
          onClick={centrarEnMi}
          className={`absolute right-3 z-20 w-12 h-12 bg-black rounded-2xl shadow-flotante grid place-items-center text-marca-500 hover:bg-nocturno-500 transition-all ${
            negocioSel ? 'bottom-[24rem]' : 'bottom-32'
          }`}
          aria-label="Centrar en mi ubicación"
        >
          <Locate className="w-5 h-5" />
        </button>
      )}

      {/* === CONTADOR FLOTANTE === */}
      {vista === 'mapa' && !negocioSel && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 bg-black text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-flotante flex items-center gap-2"
          style={{ bottom: 'calc(5rem + var(--safe-bottom))' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-marca-500" />
          <strong>{negociosFiltrados.length}</strong> servicios cerca de ti
        </div>
      )}

      {/* === PANEL DEL NEGOCIO (Portal a body — DOM aislado) === */}
      <PanelPortal
        negocio={negocioSel}
        visible={vista === 'mapa' && !!negocioSel}
        onCerrar={() => setSeleccionado(null)}
      />

      {/* === VISTA LISTA === */}
      {vista === 'lista' && (
        <div
          className="absolute inset-0 z-10 bg-zinc-50 overflow-y-auto pt-44"
          style={{ paddingBottom: 'calc(5rem + var(--safe-bottom))' }}
        >
          <ListaCompleta negocios={negociosFiltrados} />
        </div>
      )}
    </div>
  )
}

function ToggleBtn({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-xl grid place-items-center transition ${
        activo ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100'
      }`}
    >
      {children}
    </button>
  )
}

function Pildora({ children, activo, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap shadow-sm ${
        activo
          ? 'bg-black border-black text-white'
          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
      }`}
    >
      {!activo && color && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  )
}

/**
 * PanelPortal — renderiza el panel del negocio EN UN PORTAL a document.body.
 * Esto aísla el DOM del panel del árbol del MapContainer, evitando que React
 * intente reconciliar nodos que Leaflet ya mutó (causa del error insertBefore).
 */
function PanelPortal({ negocio, visible, onCerrar }) {
  const [montado, setMontado] = useState(false)
  const [negocioRender, setNegocioRender] = useState(negocio)

  useEffect(() => {
    setMontado(true)
  }, [])

  useEffect(() => {
    if (negocio) setNegocioRender(negocio)
  }, [negocio])

  if (!montado || typeof document === 'undefined') return null

  return createPortal(
    <PanelNegocio negocio={negocioRender} visible={visible} onCerrar={onCerrar} />,
    document.body
  )
}

function PanelNegocio({ negocio, visible, onCerrar }) {
  const { favoritos, toggleFavorito } = useReservas()
  if (!negocio) return null

  const esFav = favoritos.includes(negocio.id)
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCerrar}
        aria-hidden={!visible}
      />

      {/* Panel */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[70] w-full max-w-md px-3 transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-[120%] pointer-events-none'
        }`}
        style={{ bottom: 'calc(5rem + var(--safe-bottom))' }}
        aria-hidden={!visible}
      >
        <div className="bg-white rounded-3xl overflow-hidden shadow-flotante border-2 border-black/10">
          {/* Banner destacado */}
          {negocio._destacado && (
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-white" />
              Negocio destacado
            </div>
          )}

          {/* Foto */}
          <div className="relative h-44 bg-zinc-100">
            <Image
              src={negocio.imagen}
              alt={negocio.nombre}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <button
              onClick={onCerrar}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur grid place-items-center text-black shadow-md hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleFavorito(negocio.id)}
              className="absolute top-3 right-14 w-9 h-9 rounded-full bg-white/95 backdrop-blur grid place-items-center shadow-md hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${esFav ? 'fill-red-500 text-red-500' : 'text-black'}`} />
            </button>

            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md"
                style={{ backgroundColor: categoria?.color }}
              >
                {categoria?.nombre}
              </span>
              {negocio.aceptaAhora && (
                <span className="bg-marca-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Zap className="w-3 h-3 fill-white" /> Disponible ahora
                </span>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h3 className="font-bold text-lg text-black leading-tight">
              {negocio.nombre}
            </h3>

            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-zinc-800">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <strong>{negocio.rating}</strong>
                <span className="text-zinc-400 text-xs">({negocio.reviews})</span>
              </span>
              <span className="text-zinc-300">·</span>
              <span className="flex items-center gap-1 text-zinc-800">
                <MapPin className="w-3.5 h-3.5 text-marca-500" />
                <strong>{formatoDistancia(negocio._dist || 0)}</strong>
                <span className="text-zinc-400 text-xs">de ti</span>
              </span>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              {negocio.barrio} · {(negocio.horario || '').split('·')[0].trim()}
            </div>

            <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
              <Link
                href={`/explorar/${negocio.id}`}
                className="bg-white border-2 border-black hover:bg-zinc-50 text-black text-center text-sm font-bold py-2.5 rounded-full transition"
              >
                Ver detalles
              </Link>
              <Link
                href={`/explorar/${negocio.id}`}
                className="bg-marca-500 hover:bg-marca-600 text-white text-center text-sm font-bold py-2.5 rounded-full transition flex items-center justify-center gap-1.5 shadow-marca"
              >
                <Calendar className="w-4 h-4" /> Reservar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ListaCompleta({ negocios }) {
  return (
    <div className="px-3 space-y-3">
      {negocios.some((n) => n._destacado) && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 px-1">
          <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          <span className="uppercase tracking-wide">Destacados</span>
        </div>
      )}

      {negocios.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full grid place-items-center text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="mt-4 font-bold text-black">Sin resultados</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Prueba con otra categoría o término de búsqueda.
          </p>
        </div>
      ) : (
        negocios.map((n) => <FilaNegocio key={n.id} negocio={n} />)
      )}
    </div>
  )
}

function FilaNegocio({ negocio }) {
  const categoria = CATEGORIAS.find((c) => c.id === negocio.categoria)
  return (
    <Link
      href={`/explorar/${negocio.id}`}
      className={`flex gap-3 bg-white rounded-2xl p-3 border transition ${
        negocio._destacado
          ? 'border-amber-400 ring-2 ring-amber-200'
          : 'border-zinc-100 hover:border-marca-300'
      }`}
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
        <Image
          src={negocio.imagen}
          alt={negocio.nombre}
          fill
          className="object-cover"
          sizes="80px"
        />
        {negocio._destacado && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-br from-amber-400 to-amber-600 text-white p-1 rounded-lg shadow-md">
            <Crown className="w-3 h-3 fill-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: categoria?.color }}
          >
            {categoria?.nombre}
          </span>
          {negocio.aceptaAhora && (
            <span className="bg-marca-100 text-marca-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-marca-600" /> AHORA
            </span>
          )}
        </div>
        <h3 className="mt-0.5 font-bold text-sm text-black leading-tight truncate">
          {negocio.nombre}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <strong className="text-zinc-700">{negocio.rating}</strong>
          </span>
          <span>·</span>
          <span>{negocio.barrio}</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500 truncate">{negocio.descripcion}</div>
      </div>

      <div className="text-right shrink-0 flex flex-col items-end justify-between">
        <div className="text-xs font-bold text-marca-600">{formatoDistancia(negocio._dist)}</div>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
      </div>
    </Link>
  )
}
