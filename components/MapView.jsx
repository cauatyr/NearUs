'use client'
import { useEffect, useRef, memo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CIUDAD } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { logoPlaceholder } from '@/lib/utils'

function categoriaInfo(catId) {
  return CATEGORIAS.find((c) => c.id === catId) || { color: '#2BACE2', nombre: '' }
}

function iconoNegocio(negocio, opciones = {}) {
  const { activo = false } = opciones
  const cat = categoriaInfo(negocio.categoria)

  // El destaque YA NO se muestra en el mapa: los pines de negocios destacados
  // se ven iguales a los demás. El destaque aparece sólo al hacer clic (banner
  // "Negocio destacado" en el panel).
  const baseSize = 46
  const size = activo ? baseSize + 14 : baseSize
  const haloSize = 6
  const haloColor = activo ? 'rgba(43,172,226,0.4)' : 'rgba(0,0,0,0)'

  const halo = `box-shadow: 0 0 0 ${haloSize}px ${haloColor}, 0 10px 20px rgba(0,0,0,0.3);`
  const ringColor = 'white'
  const ringWidth = 2

  const ahoraHTML = negocio.aceptaAhora
    ? `<div style="position:absolute;top:-2px;left:-2px;width:18px;height:18px;background:#F59E0B;border:2px solid white;border-radius:50%;animation:pulso 1.8s ease-in-out infinite;z-index:4"></div>`
    : ''

  return L.divIcon({
    className: 'pin-marca',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 12}px;transform:translate(-50%,-100%);">
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${cat.color}"></div>
        <div style="
          position:absolute;
          bottom:10px;
          left:50%;
          transform:translateX(-50%) ${activo ? 'scale(1.05)' : ''};
          width:${size}px;height:${size}px;border-radius:50%;
          background:${cat.color};
          border:${ringWidth}px solid ${ringColor};
          ${halo}
          overflow:hidden;
          transition:all 0.2s;
        ">
          <img src="${negocio.logo || negocio.imagen || logoPlaceholder(negocio.nombre, cat.color)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='${logoPlaceholder(negocio.nombre, cat.color)}'" />
        </div>
        ${ahoraHTML}
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12]
  })
}

const iconoUsuario = L.divIcon({
  className: 'pin-usuario',
  html: `
    <div style="position:relative;width:30px;height:30px;transform:translate(-50%,-50%)">
      <div style="position:absolute;inset:0;background:rgba(43,172,226,0.3);border-radius:50%;animation:pulso 2s ease-in-out infinite"></div>
      <div style="position:absolute;inset:7px;background:#2BACE2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

function VolarA({ pos, zoom = 16 }) {
  const map = useMap()
  useEffect(() => {
    if (pos) map.flyTo([pos.lat, pos.lng], zoom, { duration: 0.6 })
  }, [pos, zoom, map])
  return null
}

// Recentra el mapa cuando cambia la ciudad activa (cambio instantáneo, no fly).
// Guarda la última ciudad aplicada para no pelear con la selección de negocios.
function CentrarEnCiudad({ centro, zoom }) {
  const map = useMap()
  const ultimo = useRef(null)
  useEffect(() => {
    if (!centro) return
    const clave = `${centro.lat},${centro.lng}`
    if (ultimo.current === clave) return
    ultimo.current = clave
    map.setView([centro.lat, centro.lng], zoom ?? map.getZoom())
  }, [centro, zoom, map])
  return null
}

function MapaRefCapture({ mapaRef }) {
  const map = useMap()
  useEffect(() => {
    if (mapaRef) mapaRef.current = map
    return () => {
      if (mapaRef) mapaRef.current = null
    }
  }, [map, mapaRef])
  return null
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
  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapaRefCapture mapaRef={mapaRef} />
      <CentrarEnCiudad centro={centro} zoom={zoom} />

      {usuario && <Marker position={[usuario.lat, usuario.lng]} icon={iconoUsuario} />}

      {negocios.map((n) => (
        <Marker
          key={n.id}
          position={[n.lat, n.lng]}
          icon={iconoNegocio(n, {
            activo: seleccionado === n.id,
            destacado: destacadosIds.includes(n.id)
          })}
          eventHandlers={{ click: () => onSeleccionar?.(n.id) }}
          zIndexOffset={
            seleccionado === n.id
              ? 2000
              : destacadosIds.includes(n.id)
              ? 1000
              : 0
          }
        />
      ))}

      {seleccionado && (
        <VolarA pos={negocios.find((n) => n.id === seleccionado)} zoom={16} />
      )}
    </MapContainer>
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
