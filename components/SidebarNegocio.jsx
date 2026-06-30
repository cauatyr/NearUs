'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar, Scissors, Users, QrCode, BarChart3, Sparkles,
  Settings, ChevronRight, Menu, X, LogOut
} from 'lucide-react'
import { useNegocios } from '@/lib/data/negocios'
import { useSesion } from '@/lib/store-sesion'
import Logo from '@/components/Logo'
import { useRouter } from 'next/navigation'

const SECCIONES = [
  { href: '/negocio/agenda', icono: Calendar, label: 'Agenda', desc: 'Reservas del día' },
  { href: '/negocio/servicios', icono: Scissors, label: 'Servicios', desc: 'Catálogo y precios' },
  { href: '/negocio/empleados', icono: Users, label: 'Equipo', desc: 'Profesionales' },
  { href: '/negocio/validar', icono: QrCode, label: 'Check-in', desc: 'Validar QR' },
  { href: '/negocio/reportes', icono: BarChart3, label: 'Reportes', desc: 'Métricas' },
  { href: '/negocio/promocion', icono: Sparkles, label: 'Promoción', desc: 'Plan Pro y destaques', destacado: true },
  { href: '/negocio/configuracion', icono: Settings, label: 'Configuración', desc: 'Foto, contacto y horario' }
]

export default function SidebarNegocio() {
  const pathname = usePathname()
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const negocioId = useSesion((s) => s.negocioId)
  const modoDemo = useSesion((s) => s.modoDemo)
  const cerrarSesion = useSesion((s) => s.cerrarSesion)
  const negocios = useNegocios()
  const negocio = negocios.find((n) => n.id === negocioId)
  const seccionActual = SECCIONES.find((s) => pathname?.startsWith(s.href))

  const salir = async () => {
    await cerrarSesion()
    router.replace('/login')
  }

  // Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  // Bloquear scroll del body cuando drawer está abierto en mobile
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <>
      {/* === TOP BAR MOBILE === */}
      <header className="md:hidden sticky top-0 z-30 bg-nocturno-500 border-b border-white/10 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 h-14">
          <button
            onClick={() => setAbierto(true)}
            className="w-10 h-10 grid place-items-center rounded-xl hover:bg-white/10 text-white shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center min-w-0">
            <div className="text-[9px] text-zinc-400 uppercase tracking-wider leading-none font-bold">
              {seccionActual?.label || 'Panel del negocio'}
            </div>
            <div className="text-sm font-bold text-white leading-tight truncate">
              {negocio?.nombre}
            </div>
          </div>
          <Link
            href="/negocio/promocion"
            className="w-10 h-10 grid place-items-center rounded-xl bg-amber-500/15 text-amber-700 hover:bg-amber-200 shrink-0"
            aria-label="Promoción"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* === BACKDROP (solo mobile) === */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setAbierto(false)}
        aria-hidden={!abierto}
      />

      {/* === SIDEBAR (drawer en mobile, fijo en desktop) === */}
      <aside
        className={`fixed top-0 left-0 h-full md:h-screen w-72 max-w-[85vw] z-50 bg-nocturno-500 border-r border-white/10 flex flex-col transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo + cerrar (solo mobile) */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-2">
          <Link href="/" className="block">
            <Logo size="md" />
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1.5 ml-1 font-bold">
              Panel del negocio
            </div>
          </Link>
          <button
            onClick={() => setAbierto(false)}
            className="md:hidden w-8 h-8 grid place-items-center rounded-xl hover:bg-white/10 text-zinc-400"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Negocio actual */}
        <div className="p-4 border-b border-white/10">
          <div className="bg-black text-white rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] uppercase tracking-wider text-marca-500 font-bold">
                Negocio
              </div>
              {modoDemo && (
                <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </div>
            <div className="mt-0.5 font-bold text-sm">{negocio?.nombre}</div>
            <div className="mt-1 text-xs text-zinc-300">{negocio?.barrio} · Cuenca</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {SECCIONES.map((s) => {
            const activo = pathname?.startsWith(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition ${
                  activo
                    ? 'bg-marca-500 text-white'
                    : s.destacado
                    ? 'text-zinc-200 hover:bg-amber-500/10 bg-gradient-to-r from-amber-50/50 to-transparent'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <s.icono
                  className={`w-5 h-5 shrink-0 ${
                    activo
                      ? 'text-marca-500'
                      : s.destacado
                      ? 'text-amber-500'
                      : 'text-zinc-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm flex items-center gap-1.5 ${activo ? '' : 'text-white'}`}>
                    {s.label}
                    {s.destacado && !activo && (
                      <span className="bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] ${activo ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {s.desc}
                  </div>
                </div>
                {activo && <ChevronRight className="w-4 h-4 text-marca-500 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={salir}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-zinc-200"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
            <div className="flex-1 min-w-0 text-left">
              <div className="font-bold text-sm text-white">
                {modoDemo ? 'Salir del demo' : 'Cerrar sesión'}
              </div>
              <div className="text-[11px] text-zinc-400">
                {modoDemo ? 'Cambiar de negocio o entrar real' : 'Volver al login'}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
