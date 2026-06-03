'use client'
// Las reservas demo del negocio n2 vienen ahora del Supabase
import { useDatosStore } from '@/lib/store-datos'

export const NEGOCIO_DEMO_ID = 'n2'

// Hook reactivo — todas las reservas (el panel del negocio filtra por NEGOCIO_DEMO_ID)
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
