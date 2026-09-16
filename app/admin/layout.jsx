'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, Users, Lock, Mail, AlertCircle, LogOut, Menu, X, Plus
} from 'lucide-react'
import { useAdmin } from '@/lib/store-admin'
import Logo from '@/components/Logo'

const SECCIONES = [
  { href: '/admin', icono: LayoutDashboard, label: 'Visión general', desc: 'Métricas de la plataforma', exacto: true },
  { href: '/admin/negocios', icono: Store, label: 'Negocios', desc: 'Ver, crear y eliminar' },
  { href: '/admin/clientes', icono: Users, label: 'Clientes', desc: 'Cuentas y reservas' }
]

export default function AdminLayout({ children }) {
  const esAdmin = useAdmin((s) => s.esAdmin)
  const verificar = useAdmin((s) => s.verificar)

  useEffect(() => {
    verificar()
  }, [verificar])

  if (esAdmin === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-nocturno-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/10 border-t-marca-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Verificando acceso…</p>
        </div>
      </div>
    )
  }

  if (!esAdmin) return <LoginAdmin />

  return (
    <div className="min-h-screen bg-nocturno-700">
      <SidebarAdmin />
      <main className="md:ml-72 min-h-screen">{children}</main>
    </div>
  )
}

function LoginAdmin() {
  const iniciarSesion = useAdmin((s) => s.iniciarSesion)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error: err } = await iniciarSesion(email.trim(), password)
    setCargando(false)
    if (err) setError(err)
  }

  return (
    <main className="min-h-screen bg-nocturno-700 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <div className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
          Administración interna
        </div>

        <form
          onSubmit={enviar}
          className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 space-y-5 shadow-suave"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-zinc-200">Email</label>
            <div className="mt-2 relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-200">Contraseña</label>
            <div className="mt-2 relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !email || !password}
            className="w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition"
          >
            {cargando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Acceso restringido al equipo de NearUs.
        </p>
      </div>
    </main>
  )
}

function SidebarAdmin() {
  const pathname = usePathname()
  const email = useAdmin((s) => s.email)
  const cerrarSesion = useAdmin((s) => s.cerrarSesion)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-nocturno-500 border-b border-white/10">
        <div className="flex items-center gap-2 px-3 h-14">
          <button
            onClick={() => setAbierto(true)}
            className="w-10 h-10 grid place-items-center rounded-xl hover:bg-white/10 text-white"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center text-sm font-bold text-white">Administración</div>
          <div className="w-10" />
        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${
          abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setAbierto(false)}
        aria-hidden={!abierto}
      />

      <aside
        className={`fixed top-0 left-0 h-full md:h-screen w-72 max-w-[85vw] z-50 bg-nocturno-500 border-r border-white/10 flex flex-col transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-2">
          <Link href="/admin" className="block">
            <Logo size="md" />
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1.5 ml-1 font-bold">
              Administración
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

        <nav className="flex-1 p-3 overflow-y-auto">
          {SECCIONES.map((s) => {
            const activo = s.exacto ? pathname === s.href : pathname?.startsWith(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition ${
                  activo ? 'bg-marca-500 text-white' : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <s.icono className={`w-5 h-5 shrink-0 ${activo ? 'text-white' : 'text-zinc-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white">{s.label}</div>
                  <div className={`text-[11px] ${activo ? 'text-white/70' : 'text-zinc-400'}`}>
                    {s.desc}
                  </div>
                </div>
              </Link>
            )
          })}

          <Link
            href="/admin/negocios/nuevo"
            className="mt-3 flex items-center gap-2 justify-center px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4 text-marca-500" /> Nuevo negocio
          </Link>
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 pb-2 text-[11px] text-zinc-500 truncate">{email}</div>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-zinc-200"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
            <div className="font-bold text-sm text-white">Cerrar sesión</div>
          </button>
        </div>
      </aside>
    </>
  )
}
