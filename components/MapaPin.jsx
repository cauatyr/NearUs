'use client'
import { useRef, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import { CIUDAD } from '@/lib/data/negocios'
import { distanciaKm } from '@/lib/utils'

const ESTILO_MAPA = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

function PinArrastrable() {
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        background: '#2BACE2', transform: 'rotate(-45deg)',
        border: '3px solid white', boxShadow: '0 6px 14px rgba(0,0,0,0.45)',
        position: 'relative'
      }}
    >
      <div
        style={{ position: 'absolute', top: 7, left: 7, width: 18, height: 18, borderRadius: '50%', background: 'white' }}
      />
    </div>
  )
}

export default function MapaPin({ lat, lng, onCambio }) {
  const mapRef = useRef(null)
  const ultimo = useRef({ lat, lng })

  const latActual = lat ?? CIUDAD.centro.lat
  const lngActual = lng ?? CIUDAD.centro.lng

  // Sigue al pin cuando salta lejos (ej: "Usar mi ubicación" que cae en otra
  // región). Sólo en saltos grandes (>1 km) para no pelear con drags finos.
  useEffect(() => {
    if (lat == null || lng == null || !mapRef.current) return
    const d = distanciaKm(ultimo.current.lat ?? lat, ultimo.current.lng ?? lng, lat, lng)
    ultimo.current = { lat, lng }
    if (d > 1) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: Math.max(mapRef.current.getZoom?.() ?? 14, 15),
        duration: 800,
        essential: true
      })
    }
  }, [lat, lng])

  return (
    <div className="relative">
      <div className="h-64 w-full rounded-2xl overflow-hidden">
        <Map
          ref={mapRef}
          mapStyle={ESTILO_MAPA}
          initialViewState={{ longitude: lngActual, latitude: latActual, zoom: 14 }}
          style={{ width: '100%', height: '100%' }}
          attributionControl={{ compact: true }}
          onClick={(e) => onCambio(e.lngLat.lat, e.lngLat.lng)}
        >
          <Marker
            longitude={lngActual}
            latitude={latActual}
            anchor="bottom"
            draggable
            onDragEnd={(e) => onCambio(e.lngLat.lat, e.lngLat.lng)}
          >
            <PinArrastrable />
          </Marker>
        </Map>
      </div>
      <p className="mt-2 text-xs text-zinc-400 text-center">
        Toca el mapa o arrastra el pin para marcar tu ubicación
      </p>
    </div>
  )
}
