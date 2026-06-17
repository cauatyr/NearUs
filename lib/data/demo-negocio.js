'use client'
// Las reservas del negocio vienen del Supabase (store-datos). Las reservas que
// crea el cliente ahora se insertan directamente en Supabase (ver
// crearReservaPublica), por eso aquí leemos una sola fuente: el store.
import { useDatosStore } from '@/lib/store-datos'

export const NEGOCIO_DEMO_ID = 'n2'

// Hook reactivo — todas las reservas (el panel del negocio filtra por negocioId)
export function useReservasDemo() {
  return useDatosStore((s) => s.reservas)
}

// Helpers sync — mantienen API original del mock
export function obtenerServicioDemo(id) {
  return useDatosStore.getState().servicios.find((s) => s.id === id)
}

export function obtenerEmpleadoDemo(id) {
  return useDatosStore.getState().empleados.find((e) => e.id === id)
}
