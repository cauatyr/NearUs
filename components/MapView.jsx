'use client'
import { useEffect, memo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CIUDAD } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { logoPlaceholder } from '@/lib/utils'

function categoriaInfo(catId) {
  return CATEGORIAS.find((c) => c.id === catId) || { color: '#2BACE2', nombre: '' }
}

function iconoNegocio(negocio, opciones = {}) {
  const { activo = false, destacado = false } = opciones
  const cat = categoriaInfo(negocio.categoria)

  // Destacados son más grandes y vistosos
  const baseSize = destacado ? 56 : 46
  const size = activo ? baseSize + 14 : baseSize
  const haloSize = destacado ? 10 : 6
  const haloColor = destacado
    ? activo
      ? 'rgba(245,158,11,0.55)'
      : 'rgba(245,158,11,0.35)'
    : activo
    ? 'rgba(43,172,226,0.4)'
    : 'rgba(0,0,0,0)'

  const halo = `box-shadow: 0 0 0 ${haloSize}px ${haloColor}, 0 10px 20px rgba(0,0,0,0.3);`
  const ringColor = destacado ? '#F59E0B' : 'white'
  const ringWidth = destacado ? 3 : 2

  const coronaHTML = destacado
    ? `
      <div style="
        position:absolute;
        top:-30px;
        left:50%;
        transform:translateX(-50%);
        z-index:5;
        filter:drop-shadow(0 4px 8px rgba(245,158,11,0.7)) drop-shadow(0 0 2px rgba(0,0,0,0.4));
        animation:flotar 2.4s ease-in-out infinite;
      ">
        <svg width="38" height="32" viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="oro-grad-${negocio.id}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FCD34D"/>
              <stop offset="45%" stop-color="#F59E0B"/>
              <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>
            <linearGradient id="oro-brillo-${negocio.id}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FEF3C7" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#FCD34D" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M4 26 L6 10 L13 17 L20 5 L27 17 L34 10 L36 26 Z"
                fill="url(#oro-grad-${negocio.id})"
                stroke="#92400E"
                stroke-width="1.5"
                stroke-linejoin="round"/>
          <rect x="4" y="25" width="32" height="4" rx="1.5" fill="url(#oro-grad-${negocio.id})" stroke="#92400E" stroke-width="1.2"/>
          <circle cx="6" cy="10" r="2.5" fill="#FEF3C7" stroke="#92400E" stroke-width="1"/>
          <circle cx="20" cy="5" r="2.8" fill="#EF4444" stroke="#92400E" stroke-width="1"/>
          <circle cx="34" cy="10" r="2.5" fill="#FEF3C7" stroke="#92400E" stroke-width="1"/>
          <circle cx="13" cy="17" r="1.6" fill="#10B981" stroke="#92400E" stroke-width="0.8"/>
          <circle cx="27" cy="17" r="1.6" fill="#3B82F6" stroke="#92400E" stroke-width="0.8"/>
          <path d="M5 23 L35 23" stroke="url(#oro-brillo-${negocio.id})" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    `
    : ''

  const ahoraHTML = negocio.aceptaAhora
    ? `<div style="position:absolute;top:${destacado ? '-4px' : '-2px'};left:${destacado ? '-4px' : '-2px'};width:18px;height:18px;background:#F59E0B;border:2px solid white;border-radius:50%;animation:pulso 1.8s ease-in-out infinite;z-index:4"></div>`
    : ''

  return L.divIcon({
    className: 'pin-marca',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 12 + (destacado ? 20 : 0)}px;transform:translate(-50%,-100%);">
        ${coronaHTML}
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
          <img src="${negocio.logo || logoPlaceholder(negocio.nombre, cat.color)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        ${ahoraHTML}
      </div>
    `,
    iconSize: [size, size + 12 + (destacado ? 20 : 0)],
    iconAnchor: [size / 2, size + 12 + (destacado ? 20 : 0)]
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
  mapaRef
}) {
  return (
    <MapContainer
      center={[CIUDAD.centro.lat, CIUDAD.centro.lng]}
      zoom={CIUDAD.zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapaRefCapture mapaRef={mapaRef} />

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
    prev.destacadosIds === next.destacadosIds
  )
})
