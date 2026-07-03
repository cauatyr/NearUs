'use client'
import { useCallback } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import { CIUDAD } from '@/lib/data/negocios'
import { Star } from 'lucide-react'

// Mismo estilo que el mapa real del app (CARTO Dark Matter, sin API key).
const ESTILO_MAPA = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// Pins de muestra alrededor del centro. NO representan un país concreto: el mapa
// va SIN etiquetas (ver onLoad), así sirve para cualquier ciudad al expandir.
const c = CIUDAD.centro
const PINS = [
  { lng: c.lng - 0.0026, lat: c.lat + 0.0021, color: '#0F6E56', label: 'Don Carlos' },
  { lng: c.lng + 0.0030, lat: c.lat + 0.0007, color: '#534AB7' },
  { lng: c.lng - 0.0009, lat: c.lat - 0.0026, color: '#BA7517' }
]
const USUARIO = { lng: c.lng + 0.0007, lat: c.lat - 0.0013 }

export default function HeroMapa() {
  const onLoad = useCallback((e) => {
    const map = e.target
    // Ocultar TODAS las etiquetas (ciudad/país/calles) → mapa genérico, sin identidad.
    try {
      const layers = map.getStyle()?.layers || []
      layers.forEach((l) => {
        if (l.type === 'symbol') map.setLayoutProperty(l.id, 'visibility', 'none')
      })
    } catch (_) {}
    // Edificios 3D (estética premium tipo Uber). Defensivo: si el estilo no los
    // trae, el try/catch lo ignora.
    try {
      const style = map.getStyle()
      const sources = style?.sources || {}
      const vectorId = Object.keys(sources).find((id) => sources[id].type === 'vector')
      if (vectorId && !map.getLayer('edificios-3d')) {
        map.addLayer({
          id: 'edificios-3d',
          type: 'fill-extrusion',
          source: vectorId,
          'source-layer': 'building',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': '#20242F',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              13, 0,
              15.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 8]
            ],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.85
          }
        })
      }
    } catch (_) {}
  }, [])

  return (
    <Map
      onLoad={onLoad}
      mapStyle={ESTILO_MAPA}
      initialViewState={{ longitude: c.lng, latitude: c.lat, zoom: 14.6, pitch: 45, bearing: -14 }}
      style={{ width: '100%', height: '100%' }}
      interactive={false}
      attributionControl={false}
    >
      {/* Ubicación del usuario */}
      <Marker longitude={USUARIO.lng} latitude={USUARIO.lat} anchor="center">
        <div style={{ position: 'relative', width: 26, height: 26 }}>
          <div className="animate-pulso" style={{ position: 'absolute', inset: 0, background: 'rgba(43,172,226,0.3)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 6, background: '#2BACE2', border: '3px solid white', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
        </div>
      </Marker>

      {/* Pins de negocios */}
      {PINS.map((p, i) => (
        <Marker key={i} longitude={p.lng} latitude={p.lat} anchor="bottom">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {p.label && (
              <div
                style={{
                  background: '#0B0E14', color: 'white', fontSize: 9, fontWeight: 700,
                  padding: '2px 5px', borderRadius: 6, marginBottom: 2, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 10px rgba(0,0,0,.5)'
                }}
              >
                <Star style={{ width: 8, height: 8, fill: '#F59E0B', color: '#F59E0B' }} /> {p.label}
              </div>
            )}
            <PinMini color={p.color} />
          </div>
        </Marker>
      ))}
    </Map>
  )
}

function PinMini({ color }) {
  return (
    <div style={{ position: 'relative', width: 20, height: 26 }}>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color}` }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, borderRadius: '50%', background: color, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,.5)' }} />
    </div>
  )
}
