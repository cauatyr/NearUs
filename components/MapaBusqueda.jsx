'use client'
import { useEffect, useRef, useState } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre'
import { Zap, Footprints } from 'lucide-react'

const ESTILO = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// Mapa de la experiencia on-demand de /ahora:
//  - fase "buscar" (destino=null): muestra los negocios disponibles pulsando + el usuario.
//  - fase "viaje" (destino set): dibuja la ruta y anima un "viajero" caminando del
//    usuario al establecimiento; al llegar dispara onLlegada.
export default function MapaBusqueda({ usuario, negocios = [], destino, onLlegada }) {
  const mapRef = useRef(null)
  const rafRef = useRef(null)
  const onLlegadaRef = useRef(onLlegada)
  const [viajero, setViajero] = useState(usuario)

  useEffect(() => {
    onLlegadaRef.current = onLlegada
  })

  const centro = usuario || (negocios[0] ?? { lat: -2.9001, lng: -79.0059 })

  // Animación de viaje cuando aparece un destino.
  useEffect(() => {
    if (!destino || !usuario) return
    const map = mapRef.current

    // Encuadra usuario + destino (con padding inferior para el bottom sheet).
    if (map) {
      const lngs = [usuario.lng, destino.lng]
      const lats = [usuario.lat, destino.lat]
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: { top: 140, bottom: 320, left: 70, right: 70 }, duration: 900, maxZoom: 15.5 }
      )
    }

    const dur = 2200
    let t0 = null
    let avisado = false
    const step = (ts) => {
      if (t0 == null) t0 = ts
      const p = Math.min((ts - t0) / dur, 1)
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2 // easeInOut
      setViajero({
        lat: usuario.lat + (destino.lat - usuario.lat) * e,
        lng: usuario.lng + (destino.lng - usuario.lng) * e
      })
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else if (!avisado) {
        avisado = true
        onLlegadaRef.current?.()
      }
    }
    // Pequeño delay para que el fitBounds arranque antes que el viajero.
    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step)
    }, 600)
    return () => {
      clearTimeout(t)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino?.id])

  const rutaData =
    destino && usuario
      ? {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [usuario.lng, usuario.lat],
              [destino.lng, destino.lat]
            ]
          }
        }
      : null

  return (
    <Map
      ref={mapRef}
      mapStyle={ESTILO}
      initialViewState={{ longitude: centro.lng, latitude: centro.lat, zoom: 14, pitch: 42 }}
      style={{ width: '100%', height: '100%' }}
      attributionControl={{ compact: true }}
      dragPan={false}
      dragRotate={false}
      scrollZoom={false}
      doubleClickZoom={false}
      touchZoomRotate={false}
      keyboard={false}
    >
      {rutaData && (
        <Source id="ruta" type="geojson" data={rutaData}>
          <Layer
            id="ruta-linea"
            type="line"
            paint={{ 'line-color': '#2BACE2', 'line-width': 4, 'line-opacity': 0.9, 'line-dasharray': [1.4, 1.1] }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
        </Source>
      )}

      {/* Negocios disponibles (solo mientras busca) */}
      {!destino &&
        negocios.map((n) => (
          <Marker key={n.id} longitude={n.lng} latitude={n.lat} anchor="center">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-white" />
            </span>
          </Marker>
        ))}

      {/* Destino */}
      {destino && (
        <Marker longitude={destino.lng} latitude={destino.lat} anchor="bottom">
          <div
            className="w-9 h-9 rounded-full bg-marca-500 border-2 border-white grid place-items-center shadow-lg"
            style={{ transform: 'translateY(4px)' }}
          >
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
        </Marker>
      )}

      {/* Usuario / viajero (se mueve durante el viaje) */}
      {usuario && (
        <Marker
          longitude={destino ? viajero.lng : usuario.lng}
          latitude={destino ? viajero.lat : usuario.lat}
          anchor="center"
        >
          <div className="relative w-9 h-9 grid place-items-center">
            <span className="absolute inset-0 rounded-full bg-marca-500/30 animate-ping" />
            <div className="relative w-8 h-8 rounded-full bg-white grid place-items-center shadow-lg">
              <Footprints className="w-4 h-4 text-marca-600" />
            </div>
          </div>
        </Marker>
      )}
    </Map>
  )
}
