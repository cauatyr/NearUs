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

      reagendarReserva: (id, fecha, hora) => {
        set((s) => ({
          reservas: s.reservas.map((r) =>
            r.id === id ? { ...r, fecha, hora } : r
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
      precision: null,        // metros de error que reporta el GPS
      actualizadoEn: null,    // cuándo fue la última lectura real

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
              const { latitude: lat, longitude: lng, accuracy } = pos.coords
              const ciudad = detectarCiudad(lat, lng)
              if (ciudad) {
                set({
                  posicion: { lat, lng },
                  ciudad,
                  estado: 'concedida',
                  gpsConcedido: true,
                  yaResuelto: true,
                  reabierto: false,
                  precision: accuracy != null ? Math.round(accuracy) : null,
                  actualizadoEn: Date.now()
                })
                resolve({ ok: true, ciudad })
              } else if (get().ciudad) {
                // Tiene GPS pero está lejos de la ciudad que eligió (ej: probando
                // desde otro país). NO usamos esa posición para las distancias:
                // "a 4.200 km" no le sirve a nadie. Se queda explorando la ciudad
                // elegida, desde su centro.
                set({ estado: 'concedida', gpsConcedido: false })
                resolve({ ok: false, motivo: 'fuera-cobertura' })
              } else {
                // Tenemos GPS pero está lejos de toda ciudad activa.
                set({ estado: 'fuera-cobertura', gpsConcedido: false })
                resolve({ ok: false, motivo: 'fuera-cobertura' })
              }
            },
            (err) => {
              // code 1 = permiso denegado · 2/3 = no disponible / timeout
              const motivo = err && err.code === 1 ? 'denegada' : 'no-soportada'
              // Si ya venía explorando una ciudad, no lo tiramos a la pantalla de
              // error: sigue navegando y el aviso lo invita a activar el GPS.
              set(get().ciudad ? { estado: 'concedida', gpsConcedido: false } : { estado: motivo })
              resolve({ ok: false, motivo })
            },
            // Alta precisión: es la ubicación real de la persona lo que decide
            // qué es "cerca de ti" y de dónde sale el viaje en Near you.
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60 * 1000 }
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
          yaResuelto: true,
          reabierto: false,
          precision: null,
          actualizadoEn: null
        })
      },

      // Vuelve a abrir el flujo (ej: el usuario toca el chip de ciudad para
      // cambiar). `reabierto` manda sobre todo: el selector se muestra aunque ya
      // tengamos su GPS, porque fue él quien lo pidió.
      reabierto: false,
      reabrirFlujo: () => set({ estado: 'idle', yaResuelto: false, reabierto: true }),

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
          // Arrancamos centrados en la ciudad guardada, pero `gpsConcedido`
          // queda en false (viene de `current`): la ciudad se recuerda, la
          // POSICIÓN no. En el boot, FlujoUbicacion vuelve a pedir el GPS y
          // reemplaza este centro por dónde está la persona de verdad.
          // Antes esto se daba por resuelto para siempre y todas las distancias
          // salían medidas desde el centro de la ciudad.
          posicion: ciudad
            ? { lat: ciudad.centro.lat, lng: ciudad.centro.lng }
            : current.posicion,
          estado: ciudad ? 'concedida' : 'idle'
        }
      }
    }
  )
)
