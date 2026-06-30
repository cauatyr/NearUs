'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle, Sparkles, Search, X, ChevronRight } from 'lucide-react'
import { useSesion } from '@/lib/store-sesion'
import { useNegocios } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { logoPlaceholder } from '@/lib/utils'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const iniciarSesion = useSesion((s) => s.iniciarSesion)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [modoDemoAbierto, setModoDemoAbierto] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error: err } = await iniciarSesion(email.trim(), password)
    setCargando(false)
    if (err) {
      setError(err)
      return
    }
    router.replace('/negocio/agenda')
  }

  return (
    <main className="min-h-screen bg-white/5 flex flex-col">
      <header className="sticky top-0 z-20 bg-nocturno-500 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Volver</span>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-white text-center">Acceder al panel</h1>
          <p className="text-sm text-zinc-400 text-center mt-1">
            Entra al panel del negocio del cual eres dueño.
          </p>

          <form onSubmit={enviar} className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-suave space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">No pudimos iniciar sesión</div>
                  <div className="text-xs mt-0.5">{error}</div>
                </div>
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
                  placeholder="tunegocio@ejemplo.ec"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 transition"
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-nocturno-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !email || !password}
              className="w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
            >
              {cargando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {cargando ? 'Entrando…' : 'Iniciar sesión'}
            </button>

            <div className="text-center text-xs text-zinc-400">
              ¿Aún no tienes negocio en NearUs?{' '}
              <Link href="/onboarding" className="text-marca-600 hover:underline font-medium">
                Regístralo ahora
              </Link>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => setModoDemoAbierto(true)}
            className="w-full bg-amber-500/15 hover:bg-amber-200 text-amber-800 border border-amber-200 rounded-2xl py-3.5 px-4 font-semibold flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 fill-amber-500" />
            Entrar en modo demo
          </button>
          <p className="text-center text-xs text-zinc-400 mt-2">
            Elige cualquier negocio para ver el panel sin necesidad de cuenta.
          </p>
        </div>
      </div>

      {modoDemoAbierto && <SelectorDemo onCerrar={() => setModoDemoAbierto(false)} />}
    </main>
  )
}

function SelectorDemo({ onCerrar }) {
  const router = useRouter()
  const negocios = useNegocios()
  const setModoDemo = useSesion((s) => s.setModoDemo)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    if (!busqueda) return negocios
    const q = busqueda.toLowerCase()
    return negocios.filter(
      (n) => n.nombre.toLowerCase().includes(q) || (n.barrio || '').toLowerCase().includes(q)
    )
  }, [busqueda, negocios])

  const elegir = (id) => {
    setModoDemo(id)
    router.replace('/negocio/agenda')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onCerrar}>
      <div
        className="bg-nocturno-500 w-full max-w-md rounded-3xl shadow-flotante overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-600 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 fill-amber-500" /> Modo demo
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">Elige el negocio</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Entrarás al panel como si fueras el dueño de ese negocio.
            </p>
          </div>
          <button onClick={onCerrar} className="w-8 h-8 grid place-items-center rounded-xl hover:bg-white/10 text-zinc-400 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-white/10">
          <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o barrio…"
              className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtrados.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-10">Ningún negocio coincide.</p>
          )}
          {filtrados.map((n) => {
            const cat = CATEGORIAS.find((c) => c.id === n.categoria)
            return (
              <button
                key={n.id}
                onClick={() => elegir(n.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition"
              >
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                  style={{ backgroundColor: cat?.color || '#2BACE2' }}
                >
                  <img
                    src={n.logo || logoPlaceholder(n.nombre, cat?.color)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{n.nombre}</div>
                  <div className="text-xs text-zinc-400 truncate">
                    {cat?.nombre} · {n.barrio}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
