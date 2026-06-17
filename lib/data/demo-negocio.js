'use client'
// Las reservas del negocio vienen del Supabase (store-datos). Para la fase de
// pruebas (Parte 1 del MVP) además fusionamos las reservas creadas localmente
// por el cliente (store.js) para que aparezcan en la agenda/validar con su
// nombre, sin escribir todavía en Supabase. Esta fusión es temporal y se quita
// en la entrega (Parte 3), cuando las reservas del cliente vayan a Supabase.
import { useMemo } from 'react'
import { useDatosStore } from '@/lib/store-datos'
import { useReservas } from '@/lib/store'

export const NEGOCIO_DEMO_ID = 'n2'

// Mapea una reserva local (store.js) al formato que usan agenda/validar.
function mapReservaLocal(r) {
  return {
    id: r.id,
    codigo: r.codigo,
    negocioId: r.negocioId,
    servicioId: r.servicioId,
    empleadoId: r.empleadoId || null,
    cliente: r.cliente || { nombre: 'Cliente', celular: '' },
    fecha: r.fecha,
    duracion: r.duracion ?? 30,
    precio: r.precio ?? 0,
    estado: r.estado || 'confirmada',
    metodoPago: r.metodoPago || 'local'
  }
}

// Hook reactivo — reservas de Supabase + reservas locales del cliente.
export function useReservasDemo() {
  const supabase = useDatosStore((s) => s.reservas)
  const locales = useReservas((s) => s.reservas)
  return useMemo(
    () => [...supabase, ...locales.map(mapReservaLocal)],
    [supabase, locales]
  )
}

// Helpers sync — mantienen API original del mock
export function obtenerServicioDemo(id) {
  return useDatosStore.getState().servicios.find((s) => s.id === id)
}

export function obtenerEmpleadoDemo(id) {
  return useDatosStore.getState().empleados.find((e) => e.id === id)
}
