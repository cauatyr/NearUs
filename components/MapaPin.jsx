'use client'
import { useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CIUDAD } from '@/lib/data/negocios'
import { distanciaKm } from '@/lib/utils'

const iconoPin = L.divIcon({
  className: 'pin-arrastrable',
  html: `
    <div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:#2BACE2;transform:rotate(-45deg);
      border:3px solid white;box-shadow:0 6px 14px rgba(0,0,0,0.35);
      position:relative;
    ">
      <div style="
        position:absolute;top:7px;left:7px;
        width:18px;height:18px;border-radius:50%;background:white;
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 32]
})

// Click en el mapa también mueve el pin (mejor UX que sólo arrastrar)
function ClickHandler({ onCambio }) {
  useMapEvents({
    click(e) {
      onCambio(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

// Sigue al pin cuando salta lejos (ej: "Usar mi ubicación" que cae en otra
// región/país). Recentra solo en saltos grandes (>1 km) para no pelear con los
// drags/clicks finos dentro de la misma zona.
function SeguirPin({ lat, lng }) {
  const map = useMap()
  const ultimo = useRef({ lat, lng })
  useEffect(() => {
    if (lat == null || lng == null) return
    const d = distanciaKm(ultimo.current.lat, ultimo.current.lng, lat, lng)
    ultimo.current = { lat, lng }
    if (d > 1) map.setView([lat, lng], Math.max(map.getZoom(), 15))
  }, [lat, lng, map])
  return null
}

export default function MapaPin({ lat, lng, onCambio }) {
  const markerRef = useRef(null)

  return (
    <div className="relative">
      <MapContainer
        center={[lat ?? CIUDAD.centro.lat, lng ?? CIUDAD.centro.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-64 w-full rounded-2xl overflow-hidden z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onCambio={onCambio} />
        <SeguirPin lat={lat} lng={lng} />
        <Marker
          position={[lat ?? CIUDAD.centro.lat, lng ?? CIUDAD.centro.lng]}
          icon={iconoPin}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const pos = markerRef.current?.getLatLng()
              if (pos) onCambio(pos.lat, pos.lng)
            }
          }}
        />
      </MapContainer>
      <p className="mt-2 text-xs text-zinc-400 text-center">
        Toca el mapa o arrastra el pin para marcar tu ubicación
      </p>
    </div>
  )
}
