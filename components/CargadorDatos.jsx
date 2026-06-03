'use client'

import { useEffect } from 'react'
import { useDatosStore } from '@/lib/store-datos'
import { useSesion } from '@/lib/store-sesion'

export default function CargadorDatos({ children }) {
  const cargado = useDatosStore((s) => s.cargado)
  const cargando = useDatosStore((s) => s.cargando)
  const error = useDatosStore((s) => s.error)
  const cargar = useDatosStore((s) => s.cargar)

  useEffect(() => {
    cargar()
    // Inicializar sesión en paralelo (no bloquea la carga de datos)
    useSesion.getState().inicializar()
  }, [cargar])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-nocturno-950 text-white">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold">No se pudo cargar NearUs</h1>
          <p className="text-sm text-white/70">{error}</p>
          <button
            onClick={() => cargar()}
            className="mt-3 px-4 py-2 bg-marca-500 rounded-lg text-white font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!cargado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nocturno-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-marca-500 rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando NearUs…</p>
        </div>
      </div>
    )
  }

  return children
}
