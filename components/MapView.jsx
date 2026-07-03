'use client'
import { useEffect, useRef, memo, useCallback } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import { CIUDAD } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { logoPlaceholder } from '@/lib/utils'

// Estilo vectorial CARTO "Dark Matter" — GRATIS, sin API key. Da la estética
// minimalista/nocturna tipo Uber y combina con el tema oscuro del app.
const ESTILO_MAPA = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

function categoriaInfo(catId) {
  return CATEGORIAS.find((c) => c.id === catId) || { color: '#2BACE2', nombre: '' }
}

// Extrusión de edificios 3D. Defensivo: si el source/source-layer no existe en
// el estilo, el try/catch lo ignora y el mapa sigue perfecto (sólo sin 3D).
function agregarEdificios3D(map) {
  try {
    if (map.getLayer('edificios-3d')) return
    const style = map.getStyle()
    const sources = style?.sources || {}
    const vectorId = Object.keys(sources).find((id) => sources[id].type === 'vector')
    if (!vectorId) return
    const primerSymbol = (style.layers || []).find(
      (l) => l.type === 'symbol' && l.layout && l.layout['text-field']
    )?.id
    map.addLayer(
      {
        id: 'edificios-3d',
        type: 'fill-extrusion',
        source: vectorId,
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#20242F',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            15.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 8]
          ],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.85
        }
      },
      primerSymbol
    )
  } catch (_) {
    /* estilo sin capa de edificios — no pasa nada */
  }
}

// Pin del negocio: círculo con logo, color de categoría, puntero, y punto
// pulsante ámbar si acepta "ahora". Crece + anillo azul cuando está activo.
function PinNegocio({ negocio, activo }) {
  const cat = categoriaInfo(negocio.categoria)
  const size = activo ? 58 : 46
  return (
    <div
      style={{ position: 'relative', width: size, height: size + 12, transition: 'all 0.2s ease' }}
    >
      {/* Puntero */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: `12px solid ${cat.color}`
        }}
      />
      {/* Círculo con logo */}
      <div
        style={{
          position: 'absolute', bottom: 10, left: '50%',
          transform: `translateX(-50%) ${activo ? 'scale(1.03)' : ''}`,
          width: size, height: size, borderRadius: '50%',
          background: cat.color,
          border: '2px solid white',
          boxShadow: activo
            ? '0 0 0 6px rgba(43,172,226,0.35), 0 12px 24px rgba(0,0,0,0.5)'
            : '0 8px 18px rgba(0,0,0,0.45)',
          overflow: 'hidden', transition: 'all 0.2s ease'
        }}
      >
        <img
          src={negocio.logo || negocio.imagen || logoPlaceholder(negocio.nombre, cat.color)}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = logoPlaceholder(negocio.nombre, cat.color)
          }}
        />
      </div>
      {/* Punto "disponible ahora" */}
      {negocio.aceptaAhora && (
        <div
          className="animate-pulso"
          style={{
            position: 'absolute', top: -2, left: -2, width: 18, height: 18,
            background: '#F59E0B', border: '2px solid white', borderRadius: '50%', zIndex: 4
          }}
        />
      )}
    </div>
  )
}

function MapViewInner({
  negocios,
  seleccionado,
  onSeleccionar,
  usuario,
  destacadosIds = [],
  mapaRef,
  centro = CIUDAD.centro,
  zoom = CIUDAD.zoom
}) {
  const mapRef = useRef(null)
  const ultimaCiudad = useRef(null)

  const onLoad = useCallback(
    (e) => {
      const map = e.target
      // El padre (botón "centrar en mí") usa este ref con la API de MapLibre.
      if (mapaRef) mapaRef.current = map
      agregarEdificios3D(map)
    },
    [mapaRef]
  )

  // Vuela hacia el negocio seleccionado, con padding inferior para que el pin
  // quede por encima del bottom sheet.
  useEffect(() => {
    if (!seleccionado || !mapRef.current) return
    const n = negocios.find((x) => x.id === seleccionado)
    if (!n) return
    mapRef.current.flyTo({
      center: [n.lng, n.lat],
      zoom: Math.max(16, mapRef.current.getZoom?.() ?? 16),
      duration: 800,
      padding: { top: 0, left: 0, right: 0, bottom: 320 },
      essential: true
    })
  }, [seleccionado, negocios])

  // Recentra al cambiar la ciudad activa (no en el primer render: initialViewState
  // ya centra). Vuela suave a la nueva región.
  useEffect(() => {
    if (!centro || !mapRef.current) return
    const clave = `${centro.lat},${centro.lng}`
    if (ultimaCiudad.current === null) {
      ultimaCiudad.current = clave
      return
    }
    if (ultimaCiudad.current === clave) return
    ultimaCiudad.current = clave
    mapRef.current.flyTo({ center: [centro.lng, centro.lat], zoom, duration: 1200, essential: true })
  }, [centro, zoom])

  return (
    <Map
      ref={mapRef}
      onLoad={onLoad}
      mapStyle={ESTILO_MAPA}
      initialViewState={{
        longitude: centro.lng,
        latitude: centro.lat,
        zoom,
        pitch: 45,
        bearing: -12
      }}
      style={{ width: '100%', height: '100%' }}
      attributionControl={{ compact: true }}
      maxPitch={60}
      dragRotate
      touchZoomRotate
      reuseMaps
    >
      {usuario && (
        <Marker longitude={usuario.lng} latitude={usuario.lat} anchor="center">
          <div style={{ position: 'relative', width: 30, height: 30 }}>
            <div
              className="animate-pulso"
              style={{ position: 'absolute', inset: 0, background: 'rgba(43,172,226,0.3)', borderRadius: '50%' }}
            />
            <div
              style={{
                position: 'absolute', inset: 7, background: '#2BACE2',
                border: '3px solid white', borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </Marker>
      )}

      {negocios.map((n) => {
        const activo = seleccionado === n.id
        return (
          <Marker
            key={n.id}
            longitude={n.lng}
            latitude={n.lat}
            anchor="bottom"
            style={{ zIndex: activo ? 3 : destacadosIds.includes(n.id) ? 2 : 1, cursor: 'pointer' }}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              onSeleccionar?.(n.id)
            }}
          >
            <PinNegocio negocio={n} activo={activo} />
          </Marker>
        )
      })}
    </Map>
  )
}

export default memo(MapViewInner, (prev, next) => {
  return (
    prev.seleccionado === next.seleccionado &&
    prev.negocios === next.negocios &&
    prev.usuario === next.usuario &&
    prev.destacadosIds === next.destacadosIds &&
    prev.centro === next.centro &&
    prev.zoom === next.zoom
  )
})
