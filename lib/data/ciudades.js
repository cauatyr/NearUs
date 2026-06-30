'use client'
// Ciudades donde opera NearUs + lógica de detección por cercanía.
//
// IDEA CLAVE: no usamos ninguna API externa para "saber en qué ciudad está"
// el usuario. El celular nos da coordenadas (lat/lng) y nosotros buscamos cuál
// de NUESTRAS ciudades es la más cercana. Expandir = agregar una ciudad acá
// (y poner `activa: true` cuando ya haya negocios) y desplegar.
//
// `centro`  → dónde se abre el mapa (plaza central de la ciudad)
// `zoom`    → qué tan cerca arranca el mapa
// `radioKm` → hasta qué distancia del centro consideramos "estás en esta ciudad".
//             Si el usuario está más lejos que esto de TODAS las ciudades activas,
//             mostramos "todavía no llegamos a tu zona".
// `activa`  → true = ya tiene negocios y se puede usar. false = "próximamente".

import { distanciaKm } from '@/lib/utils'

export const CIUDADES = [
  {
    id: 'cuenca',
    nombre: 'Cuenca',
    pais: 'Ecuador',
    centro: { lat: -2.9001, lng: -79.0059 },
    zoom: 14,
    radioKm: 25,
    activa: true
  },
  {
    id: 'barretos',
    nombre: 'Barretos',
    pais: 'Brasil',
    centro: { lat: -20.5573, lng: -48.567 },
    zoom: 13,
    radioKm: 30,
    activa: true
  },
  {
    id: 'quito',
    nombre: 'Quito',
    pais: 'Ecuador',
    centro: { lat: -0.1807, lng: -78.4678 },
    zoom: 12,
    radioKm: 35,
    activa: false
  },
  {
    id: 'guayaquil',
    nombre: 'Guayaquil',
    pais: 'Ecuador',
    centro: { lat: -2.1709, lng: -79.9224 },
    zoom: 12,
    radioKm: 35,
    activa: false
  },
  {
    id: 'bogota',
    nombre: 'Bogotá',
    pais: 'Colombia',
    centro: { lat: 4.711, lng: -74.0721 },
    zoom: 11,
    radioKm: 40,
    activa: false
  }
]

// Ciudad por defecto (la primera activa). Sirve de fallback en todo el app.
export const CIUDAD_DEFECTO =
  CIUDADES.find((c) => c.activa) || CIUDADES[0]

// Compat: muchos componentes históricos importan `CIUDAD` (era una constante
// única = Cuenca). La mantenemos apuntando a la ciudad por defecto.
export const CIUDAD = CIUDAD_DEFECTO

// Solo las ciudades que el usuario puede elegir hoy (las que tienen negocios).
export function ciudadesActivas() {
  return CIUDADES.filter((c) => c.activa)
}

export function obtenerCiudad(id) {
  return CIUDADES.find((c) => c.id === id) || null
}

// Ciudad ACTIVA más cercana a unas coordenadas + la distancia a su centro.
// Devuelve { ciudad, km }. Si no hubiera ninguna activa, cae en CIUDAD_DEFECTO.
export function ciudadMasCercana(lat, lng) {
  const candidatas = ciudadesActivas()
  let mejor = null
  let mejorKm = Infinity
  for (const c of candidatas) {
    const km = distanciaKm(lat, lng, c.centro.lat, c.centro.lng)
    if (km < mejorKm) {
      mejorKm = km
      mejor = c
    }
  }
  return { ciudad: mejor || CIUDAD_DEFECTO, km: mejorKm }
}

// "¿En qué ciudad servida está este usuario?"
// Devuelve la ciudad activa más cercana SOLO si está dentro de su radio de
// cobertura. Si está demasiado lejos (otra región/país), devuelve null →
// el flujo muestra "todavía no llegamos a tu zona" + selector manual.
export function detectarCiudad(lat, lng) {
  const { ciudad, km } = ciudadMasCercana(lat, lng)
  if (ciudad && km <= ciudad.radioKm) return ciudad
  return null
}

// "¿A qué ciudad pertenece este negocio?" — la activa más cercana a su pin,
// SIN exigir radio (un negocio siempre cae en su ciudad más próxima). Sirve para
// filtrar los negocios que se muestran según la ciudad elegida por el usuario.
export function ciudadDeNegocio(negocio) {
  return ciudadMasCercana(negocio.lat, negocio.lng).ciudad
}
