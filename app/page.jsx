import Link from 'next/link'
import { MapPin, Clock, QrCode, Zap, Star, Calendar, Smartphone, Sparkles, ArrowRight, LogIn } from 'lucide-react'
import Logo from '@/components/Logo'
import TelefonoMock from '@/components/TelefonoMock'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-nocturno-500">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-nocturno-700/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/onboarding" className="hidden md:inline text-sm font-medium text-zinc-300 hover:text-white transition">
              ¿Tienes un negocio?
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full px-3 sm:px-4 py-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Acceder a mi empresa</span>
              <span className="sm:hidden">Empresa</span>
            </Link>
            <Link
              href="/inicio"
              className="bg-marca-500 hover:bg-marca-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition shadow-marca"
            >
              Abrir app
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-14 sm:py-24 bg-gradient-to-b from-nocturno-700 via-nocturno-600 to-nocturno-500">
        {/* Glows decorativos */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-24 w-[34rem] h-[34rem] bg-marca-500/20 rounded-full blur-[130px]" />
          <div className="absolute top-32 -left-40 w-[28rem] h-[28rem] bg-marca-700/25 rounded-full blur-[130px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marca-500/40 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/5 ring-1 ring-white/10 text-marca-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" /> Cuenca · Ecuador
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.03]">
              Reserva servicios{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-r from-marca-400 to-marca-500 bg-clip-text text-transparent">cerca de ti</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-marca-500/20 -rotate-1 rounded-full" />
              </span>
              , en segundos.
            </h1>
            <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-lg">
              Descubre salones, barberías, spas y estudios cercanos en el mapa.
              Mira la disponibilidad en vivo y reserva sin llamadas ni WhatsApp.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                href="/explorar"
                className="group inline-flex items-center justify-center gap-2 bg-marca-500 hover:bg-marca-600 text-white font-bold px-6 py-3.5 rounded-full transition shadow-marca hover:scale-[1.02] active:scale-100"
              >
                Explorar servicios <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-full border border-white/15 hover:border-white/30 backdrop-blur transition"
              >
                Registrar mi negocio
              </Link>
            </div>
            <div className="mt-9 flex items-center gap-6 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> <strong className="text-white">4.8</strong> promedio</div>
              <div className="h-4 w-px bg-white/10" />
              <div><strong className="text-white">20</strong> negocios activos</div>
              <div className="h-4 w-px bg-white/10" />
              <div><strong className="text-white">100 %</strong> gratuito</div>
            </div>
          </div>

          {/* Hero mock — celular realista */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 -z-10 grid place-items-center">
              <div className="w-72 h-72 bg-marca-500/30 blur-[90px] rounded-full" />
            </div>
            <TelefonoMock />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-black text-white py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-marca-500">Cómo funciona</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            Tres pasos, sin fricción
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Abre el mapa', d: 'Encuentra todos los servicios cercanos en tiempo real.', i: MapPin },
              { n: '02', t: 'Reserva en segundos', d: 'Escoge horario disponible y confirma. Sin llamadas.', i: Calendar },
              { n: '03', t: 'Llega y muestra el QR', d: 'Tu reserva confirmada con código QR para check-in.', i: QrCode }
            ].map((p) => (
              <div key={p.n} className="bg-nocturno-500 rounded-2xl p-6 border border-nocturno-400">
                <div className="text-xs text-marca-500 font-bold">{p.n}</div>
                <p.i className="w-7 h-7 text-marca-500 mt-3" />
                <h3 className="mt-3 font-bold text-lg text-white">{p.t}</h3>
                <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 bg-nocturno-500">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-marca-500">Modo "necesito ahora"</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              ¿Apuro? Atención inmediata.
            </h2>
            <p className="mt-4 text-zinc-200 text-lg leading-relaxed">
              Activa el modo on-demand y conéctate al instante con el negocio más cercano que pueda atenderte ahora mismo.
              Como pedir un Uber, pero para servicios.
            </p>
            <Link
              href="/ahora"
              className="mt-6 inline-flex items-center gap-2 bg-marca-500 hover:bg-marca-600 text-white font-bold px-5 py-2.5 rounded-full transition"
            >
              Probar modo ahora <Zap className="w-4 h-4 fill-white" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { i: Clock, t: 'Disponibilidad real', d: 'Agenda al vivo, siempre actualizada.' },
              { i: Zap, t: 'On-demand', d: 'Servicio inmediato con un toque.' },
              { i: QrCode, t: 'QR de check-in', d: 'Sin recibos ni boletos en papel.' },
              { i: Star, t: 'Reseñas reales', d: 'Solo de clientes que reservaron.' }
            ].map((f) => (
              <div key={f.t} className="bg-marca-500/10 border-2 border-marca-500/20 rounded-2xl p-5">
                <f.i className="w-6 h-6 text-marca-500" />
                <div className="mt-3 font-bold text-white">{f.t}</div>
                <div className="mt-1 text-sm text-zinc-300">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA negocios */}
      <section className="bg-gradient-to-br from-black via-nocturno-500 to-marca-700 text-white py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto bg-marca-500 rounded-2xl grid place-items-center shadow-marca">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold">
            ¿Tienes un negocio en Cuenca?
          </h2>
          <p className="mt-4 text-zinc-300 text-lg max-w-2xl mx-auto">
            Suma tu negocio a NearUs. Plan básico gratuito.
            Sin compromiso, sin tarjeta.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-marca-500 hover:bg-marca-400 text-white font-bold px-7 py-3.5 rounded-full transition shadow-marca"
            >
              Registrar mi negocio gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-7 py-3.5 rounded-full transition backdrop-blur"
            >
              <LogIn className="w-4 h-4" /> Ya tengo cuenta · Acceder
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            ¿Ya registraste tu negocio? Entra al panel con tu email y contraseña.
          </p>
        </div>
      </section>

      {/* Footer (nota: TelefonoMock definido abajo) */}
      <footer className="py-10 px-5 border-t border-white/10 bg-nocturno-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>· Hecho en Cuenca</span>
          </div>
          <div className="flex gap-5">
            <Link href="/inicio" className="hover:text-white font-medium">App</Link>
            <Link href="/onboarding" className="hover:text-white font-medium">Negocios</Link>
            <Link href="/login" className="hover:text-white font-medium">Acceder al panel</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
