'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarCodigoReserva } from './utils'
import { CIUDAD_DEFECTO, detectarCiudad, obtenerCiudad } from './data/ciudades'

export const useReservas = create(
  persist(
    (set, get) => ({
      reservas: [],
      favoritos: [],

      crearReserva: ({ negocioId, servicioId, empleadoId, fecha, hora, duracion, precio, metodoPago, cliente, modo = 'agendada' }) => {
        const codigo = generarCodigoReserva()
        const nueva = {
          id: codigo,
          codigo,
          negocioId,
          servicioId,
          empleadoId: empleadoId && empleadoId !== 'cualquiera' ? empleadoId : null,
          fecha,
          hora,
          duracion,
          precio,
          metodoPago,
          cliente, // { nombre, celular }
          modo,
          estado: 'confirmada',
          creadaEn: new Date().toISOString()
        }
        set((s) => ({ reservas: [nueva, ...s.reservas] }))
        return nueva
      },

      cancelarReserva: (id) => {
        set((s) => ({
          reservas: s.reservas.map((r) =>
            r.id === id ? { ...r, estado: 'cancelada' } : r
          )
        }))
      },

      marcarUsada: (id) => {
        set((s) => ({
          reservas: s.reservas.map((r) =>
            r.id === id ? { ...r, estado: 'completada' } : r
          )
        }))
      },

      toggleFavorito: (negocioId) => {
        set((s) => ({
          favoritos: s.favoritos.includes(negocioId)
            ? s.favoritos.filter((id) => id !== negocioId)
            : [...s.favoritos, negocioId]
        }))
      },

      esFavorito: (negocioId) => get().favoritos.includes(negocioId)
    }),
    { name: 'nearus-reservas' }
  )
)

// Ubicación del usuario + ciudad activa.
//
// estado: 'idle'           → todavía no preguntamos
//         'pidiendo'       → esperando respuesta del GPS
//         'concedida'      → tenemos ciudad (por GPS o elegida a mano)
//         'denegada'       → el usuario negó el permiso
//         'fuera-cobertura'→ dio permiso pero está lejos de toda ciudad activa
//         'no-soportada'   → el navegador no tiene geolocalización / falló
//
// posicion = punto de referencia para ordenar por distancia y dibujar el mapa.
//   - con GPS real     → la posición real del usuario
//   - con ciudad a mano → el centro de esa ciudad
// gpsConcedido = true solo cuando tenemos la posición REAL (para mostrar el
//   pin "tú estás aquí"; con ciudad manual no lo mostramos).
export const useUbicacion = create(
  persist(
    (set, get) => ({
      posicion: { lat: CIUDAD_DEFECTO.centro.lat, lng: CIUDAD_DEFECTO.centro.lng },
      ciudad: null,           // objeto ciudad activa (detectada o elegida)
      estado: 'idle',
      gpsConcedido: false,
      yaResuelto: false,      // ya pasó por el flujo → no volver a molestar

      // Pide la ubicación real al navegador. Si cae en una ciudad servida, la usa;
      // si está fuera de cobertura o falla, deja un estado que el flujo traduce a
      // "elige tu ciudad". `silencioso` evita marcar 'pidiendo' (refresco en bg).
      pedirUbicacion: (silencioso = false) =>
        new Promise((resolve) => {
          if (typeof navigator === 'undefined' || !navigator.geolocation) {
            set({ estado: 'no-soportada' })
            resolve({ ok: false, motivo: 'no-soportada' })
            return
          }
          if (!silencioso) set({ estado: 'pidiendo' })

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords
              const ciudad = detectarCiudad(lat, lng)
              if (ciudad) {
                set({
                  posicion: { lat, lng },
                  ciudad,
                  estado: 'concedida',
                  gpsConcedido: true,
                  yaResuelto: true
                })
                resolve({ ok: true, ciudad })
              } else {
                // Tenemos GPS pero está lejos de toda ciudad activa.
                set({ estado: 'fuera-cobertura', gpsConcedido: true })
                resolve({ ok: false, motivo: 'fuera-cobertura' })
              }
            },
            (err) => {
              // code 1 = permiso denegado · 2/3 = no disponible / timeout
              set({ estado: err && err.code === 1 ? 'denegada' : 'no-soportada' })
              resolve({ ok: false, motivo: err && err.code === 1 ? 'denegada' : 'no-soportada' })
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
          )
        }),

      // El usuario eligió una ciudad a mano (negó el GPS o está fuera de cobertura).
      elegirCiudad: (ciudad) => {
        if (!ciudad) return
        set({
          posicion: { lat: ciudad.centro.lat, lng: ciudad.centro.lng },
          ciudad,
          estado: 'concedida',
          gpsConcedido: false,
          yaResuelto: true
        })
      },

      // Vuelve a abrir el flujo (ej: el usuario toca el chip de ciudad para cambiar).
      reabrirFlujo: () => set({ estado: 'idle', yaResuelto: false }),

      // Compat con la API vieja (nadie la llama hoy, pero la dejamos por las dudas).
      permitida: false,
      setPosicion: (p) => set({ posicion: p, permitida: true, gpsConcedido: true })
    }),
    {
      name: 'nearus-ubicacion',
      // Persistimos solo lo necesario; rehidratamos `ciudad` desde su id.
      partialize: (s) => ({ ciudadId: s.ciudad?.id || null, yaResuelto: s.yaResuelto }),
      merge: (persisted, current) => {
        const ciudad = persisted?.ciudadId ? obtenerCiudad(persisted.ciudadId) : null
        return {
          ...current,
          ciudad,
          yaResuelto: !!persisted?.yaResuelto && !!ciudad,
          // si ya teníamos una ciudad guardada, arrancamos el mapa centrado en ella
          posicion: ciudad
            ? { lat: ciudad.centro.lat, lng: ciudad.centro.lng }
            : current.posicion,
          estado: ciudad ? 'concedida' : 'idle'
        }
      }
    }
  )
)
