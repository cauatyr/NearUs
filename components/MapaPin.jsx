'use client'
import { useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { CIUDAD } from '@/lib/data/negocios'

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
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onCambio={onCambio} />
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
      <p className="mt-2 text-xs text-zinc-500 text-center">
        Toca el mapa o arrastra el pin para marcar tu ubicación
      </p>
    </div>
  )
}
