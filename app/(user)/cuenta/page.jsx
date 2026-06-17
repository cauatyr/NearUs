'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react'
import { useCliente } from '@/lib/store-cliente'

export default function CuentaPage() {
  return (
    <Suspense fallback={null}>
      <CuentaInner />
    </Suspense>
  )
}

function CuentaInner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/perfil'

  const registrar = useCliente((s) => s.registrar)
  const iniciarSesion = useCliente((s) => s.iniciarSesion)

  const [modo, setModo] = useState('registro') // 'registro' | 'login'
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const enviar = (e) => {
    e.preventDefault()
    setError(null)
    const { error: err } =
      modo === 'registro'
        ? registrar({ nombre, email, celular, password })
        : iniciarSesion({ email, password })
    if (err) {
      setError(err)
      return
    }
    router.replace(next)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-100">
        <div className="h-14 px-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-zinc-100"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-900" />
          </button>
          <div className="text-sm font-medium text-zinc-900">
            {modo === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {modo === 'registro' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {modo === 'registro'
              ? 'Necesitas una cuenta para reservar. Tu nombre aparecerá en la reserva del negocio.'
              : 'Entra para ver y gestionar tus reservas.'}
          </p>

          {/* Toggle */}
          <div className="mt-6 bg-zinc-100 rounded-full p-1 grid grid-cols-2 gap-1">
            <button
              onClick={() => { setModo('registro'); setError(null) }}
              className={`py-2 rounded-full text-sm font-medium transition ${
                modo === 'registro' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Crear cuenta
            </button>
            <button
              onClick={() => { setModo('login'); setError(null) }}
              className={`py-2 rounded-full text-sm font-medium transition ${
                modo === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Iniciar sesión
            </button>
          </div>

          <form onSubmit={enviar} className="mt-6 bg-white rounded-3xl border border-zinc-100 p-6 shadow-suave space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">{error}</div>
              </div>
            )}

            {modo === 'registro' && (
              <Campo icono={User} label="Nombre completo">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition"
                />
              </Campo>
            )}

            {modo === 'registro' && (
              <Campo icono={Phone} label="Celular">
                <input
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="+593 99 123 4567"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition"
                />
              </Campo>
            )}

            <Campo icono={Mail} label="Email">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition"
              />
            </Campo>

            <Campo icono={Lock} label="Contraseña">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition"
              />
            </Campo>

            <button
              type="submit"
              className="w-full bg-marca-500 hover:bg-marca-600 text-white font-semibold py-3 rounded-full transition"
            >
              {modo === 'registro' ? 'Crear cuenta y continuar' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-400 mt-5">
            ¿Eres un negocio?{' '}
            <Link href="/login" className="text-marca-600 hover:underline font-medium">
              Accede al panel
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Campo({ icono: Icono, label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div className="mt-2 relative">
        <Icono className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
        {children}
      </div>
    </div>
  )
}
