'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarCodigoReserva } from './utils'

export const useReservas = create(
  persist(
    (set, get) => ({
      reservas: [],
      favoritos: [],

      crearReserva: ({ negocioId, servicioId, empleadoId, fecha, hora, modo = 'agendada' }) => {
        const codigo = generarCodigoReserva()
        const nueva = {
          id: codigo,
          codigo,
          negocioId,
          servicioId,
          empleadoId,
          fecha,
          hora,
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

export const useUbicacion = create((set) => ({
  posicion: { lat: -2.9001, lng: -79.0059 },
  permitida: false,
  setPosicion: (p) => set({ posicion: p, permitida: true })
}))
