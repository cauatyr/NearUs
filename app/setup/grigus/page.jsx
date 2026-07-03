'use client'
// Ruta INTERNA — sin enlaces en el app público. Acceso sólo por URL directa.
// Sirve para crear el login del negocio "grigus" (creado antes del sistema de auth).
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle, Check, Sparkles, Lock as LockIcon } from 'lucide-react'
import { useSesion } from '@/lib/store-sesion'
import { useNegocios } from '@/lib/data/negocios'
import { CATEGORIAS } from '@/lib/data/categorias'
import { logoPlaceholder } from '@/lib/utils'
import Logo from '@/components/Logo'

const EMAIL_DEFAULT = 'grigun@nearus.ec'
const PASSWORD_DEFAULT = 'grigun2026'

export default function SetupGrigusPage() {
  const router = useRouter()
  const negocios = useNegocios()
  const crearCuentaYReivindicar = useSesion((s) => s.crearCuentaYReivindicar)

  // Busca el negocio cuyo nombre empiece con "grig" (case-insensitive).
  // Cubre tanto "grigus" como "grigun" — variantes que el dueño escribió.
  const grigus = useMemo(
    () => negocios.find((n) => (n.nombre || '').toLowerCase().includes('grig')),
    [negocios]
  )

  const [email, setEmail] = useState(EMAIL_DEFAULT)
  const [password, setPassword] = useState(PASSWORD_DEFAULT)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [creado, setCreado] = useState(null)

  const enviar = async (e) => {
    e.preventDefault()
    if (!grigus) return
    setError(null)
    setCargando(true)
    const { error: err } = await crearCuentaYReivindicar(email.trim(), password, grigus.id)
    setCargando(false)
    if (err) {
      setError(err)
      return
    }
    setCreado({ email, password })
  }

  const cat = grigus && CATEGORIAS.find((c) => c.id === grigus.categoria)

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
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-700 bg-amber-500/15 px-2.5 py-1 rounded-full font-bold">
              <LockIcon className="w-3 h-3" /> Setup interno
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Crear login del negocio</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {grigus
                ? <>Esta página vincula <strong>{grigus.nombre}</strong> a una cuenta nueva.</>
                : <>Esta página crea el login del negocio que empiece con "grig".</>}
            </p>
          </div>

          {!grigus ? (
            <div className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 shadow-suave">
              <div className="bg-red-500/10 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">No encontramos un negocio con "grig" en el nombre</div>
                  <div className="text-xs mt-1">
                    Verifica que esté en la tabla <code>negocios</code>.
                  </div>
                </div>
              </div>
            </div>
          ) : grigus.ownerUserId ? (
            <div className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 shadow-suave">
              <div className="bg-marca-500/10 border border-marca-500/20 rounded-xl p-4 text-sm text-marca-700 flex items-start gap-2.5">
                <Check className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Este negocio ya tiene login</div>
                  <div className="text-xs mt-1">
                    Entrá normalmente desde la pantalla de login con el email y contraseña que ya creaste.
                  </div>
                </div>
              </div>
              <Link
                href="/login"
                className="mt-4 block text-center bg-marca-500 hover:bg-marca-600 text-white font-semibold py-3 rounded-full"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : creado ? (
            <div className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-suave">
              <div className="w-16 h-16 mx-auto bg-acento-500 rounded-full grid place-items-center">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white text-center">¡Login creado!</h2>
              <p className="text-zinc-300 mt-1 text-center text-sm">
                Ya entraste como dueño de <strong>{grigus.nombre}</strong>.
              </p>

              <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Credenciales</div>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Email</span>
                    <code className="font-mono text-white bg-nocturno-500 px-2 py-0.5 rounded border border-white/10">{creado.email}</code>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Contraseña</span>
                    <code className="font-mono text-white bg-nocturno-500 px-2 py-0.5 rounded border border-white/10">{creado.password}</code>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400">
                  Guardá estas credenciales — son la única forma de volver al panel de grigus.
                </p>
              </div>

              <button
                onClick={() => router.replace('/negocio/inicio')}
                className="mt-5 w-full bg-marca-500 hover:bg-marca-600 text-white font-semibold py-3 rounded-full"
              >
                Ir al panel de grigus
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="mt-7 bg-nocturno-500 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-suave space-y-5">
              {/* Preview del negocio */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                  style={{ backgroundColor: cat?.color || '#2BACE2' }}
                >
                  <img
                    src={grigus.logo || logoPlaceholder(grigus.nombre, cat?.color)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{grigus.nombre}</div>
                  <div className="text-xs text-zinc-400 truncate">{cat?.nombre} · {grigus.barrio}</div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">No pudimos crear la cuenta</div>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-marca-500 focus:bg-nocturno-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-200">Contraseña</label>
                <div className="mt-2 relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white font-mono focus:outline-none focus:border-marca-500 focus:bg-nocturno-400"
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-400">
                  Sugerencia: <code className="font-mono">{PASSWORD_DEFAULT}</code>. Cambiala si quieres otra.
                </p>
              </div>

              <button
                type="submit"
                disabled={cargando || !email || password.length < 6}
                className="w-full bg-marca-500 hover:bg-marca-600 disabled:bg-white/10 disabled:text-zinc-400 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
              >
                {cargando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {cargando ? 'Creando…' : 'Crear login y entrar'}
              </button>

              <p className="text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Esta página es interna — los clientes no la ven
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
