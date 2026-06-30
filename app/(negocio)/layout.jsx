'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SidebarNegocio from '@/components/SidebarNegocio'
import { useSesion } from '@/lib/store-sesion'

export default function NegocioLayout({ children }) {
  const router = useRouter()
  const inicializado = useSesion((s) => s.inicializado)
  const negocioId = useSesion((s) => s.negocioId)

  useEffect(() => {
    if (inicializado && !negocioId) {
      router.replace('/login')
    }
  }, [inicializado, negocioId, router])

  if (!inicializado) {
    return (
      <div className="min-h-screen grid place-items-center bg-nocturno-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/10 border-t-marca-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Cargando panel…</p>
        </div>
      </div>
    )
  }

  if (!negocioId) {
    // useEffect ya disparó el redirect — mientras tanto, vacío
    return null
  }

  return (
    <div className="min-h-screen bg-nocturno-700">
      <SidebarNegocio />
      <main className="md:ml-72 min-h-screen">{children}</main>
    </div>
  )
}
