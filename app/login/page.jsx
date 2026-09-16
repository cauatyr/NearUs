'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react'
import { useSesion } from '@/lib/store-sesion'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const iniciarSesion = useSesion((s) => s.iniciarSesion)
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
    if (err) {
      setError(err)
      return
    }
    router.replace('/negocio/inicio')
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

        </div>
      </div>
    </main>
  )
}
