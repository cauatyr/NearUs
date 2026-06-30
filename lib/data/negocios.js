'use client'
// Datos vienen ahora del Supabase via lib/store-datos.js
// Esta capa mantiene la API original (CIUDAD, helpers sync) + agrega hooks reactivos
import { useDatosStore } from '@/lib/store-datos'

// CIUDAD vive ahora en lib/data/ciudades.js (fuente única de ciudades).
// La re-exportamos acá para no romper imports históricos.
export { CIUDAD } from '@/lib/data/ciudades'

// Hooks reactivos (usar dentro de componentes que necesiten re-render al cambiar datos)
export function useNegocios() {
  return useDatosStore((s) => s.negocios)
}

export function useServicios() {
  return useDatosStore((s) => s.servicios)
}

export function useEmpleados() {
  return useDatosStore((s) => s.empleados)
}

// Helpers sync — leen del store via getState(). Sirven igual que el mock original.
// Sólo funcionan después de que <CargadorDatos> haya cargado.
export function obtenerNegocio(id) {
  return useDatosStore.getState().negocios.find((n) => n.id === id)
}

export function serviciosDeNegocio(negocioId) {
  return useDatosStore.getState().servicios.filter((s) => s.negocioId === negocioId)
}

export function empleadosDeNegocio(negocioId) {
  return useDatosStore.getState().empleados.filter((e) => e.negocioId === negocioId)
}

export function obtenerServicio(id) {
  return useDatosStore.getState().servicios.find((s) => s.id === id)
}
