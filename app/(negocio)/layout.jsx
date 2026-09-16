'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import SidebarNegocio from '@/components/SidebarNegocio'
import AvisoReservasNegocio from '@/components/AvisoReservasNegocio'
import { useSesion } from '@/lib/store-sesion'
import { useNegocios } from '@/lib/data/negocios'

export default function NegocioLayout({ children }) {
  const router = useRouter()
  const inicializado = useSesion((s) => s.inicializado)
  const negocioId = useSesion((s) => s.negocioId)
  const gestionAdmin = useSesion((s) => s.gestionAdmin)
  const saliendo = useSesion((s) => s.saliendo)

  useEffect(() => {
    // `saliendo` = un admin está soltando el negocio para volver a /admin. Sin
    // esa guarda, el negocioId en null lo mandaría a /login en el camino.
    if (inicializado && !negocioId && !saliendo) {
      router.replace('/login')
    }
  }, [inicializado, negocioId, saliendo, router])

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
      <main className="md:ml-72 min-h-screen">
        {gestionAdmin && <BarraGestionAdmin negocioId={negocioId} />}
        {children}
      </main>
      <AvisoReservasNegocio />
    </div>
  )
}

// Aparece cuando un admin de NearUs entró a gestionar un negocio ajeno.
// Deja siempre visible de quién es el panel y cómo volver a /admin.
function BarraGestionAdmin({ negocioId }) {
  const router = useRouter()
  const salirDeGestion = useSesion((s) => s.salirDeGestion)
  const negocios = useNegocios()
  const negocio = negocios.find((n) => n.id === negocioId)

  const volver = async () => {
    await salirDeGestion()
    router.replace('/admin/negocios')
  }

  return (
    <div className="sticky top-0 z-20 bg-marca-600 text-white px-4 py-2.5 flex items-center gap-3">
      <ShieldCheck className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0 text-sm">
        Estás gestionando <strong className="font-semibold">{negocio?.nombre || negocioId}</strong> como administrador.
      </div>
      <button
        onClick={volver}
        className="shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 text-xs font-semibold transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a administración
      </button>
    </div>
  )
}
