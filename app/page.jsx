import Link from 'next/link'
import { MapPin, Clock, QrCode, Zap, Star, Calendar, Smartphone, Sparkles, ArrowRight, LogIn } from 'lucide-react'
import Logo from '@/components/Logo'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/90 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/onboarding" className="hidden md:inline text-sm font-medium text-zinc-700 hover:text-marca-600">
              ¿Tienes un negocio?
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-marca-600 hover:text-marca-700 border border-marca-200 hover:bg-marca-50 rounded-full px-4 py-2 transition"
            >
              <LogIn className="w-4 h-4" /> Acceder a mi empresa
            </Link>
            <Link
              href="/explorar"
              className="bg-black hover:bg-nocturno-500 text-white text-sm font-bold px-5 py-2.5 rounded-full transition"
            >
              Abrir app
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 py-12 sm:py-20 bg-gradient-to-b from-white to-zinc-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-black text-marca-500 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> MVP en Cuenca · Ecuador
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black leading-[1.02]">
              Reserva servicios <span className="text-marca-500">cerca de ti</span>, en segundos.
            </h1>
            <p className="mt-5 text-lg text-zinc-700 leading-relaxed max-w-lg">
              Descubre salones, barberías, spas y estudios cercanos en el mapa.
              Mira la disponibilidad en vivo y reserva sin llamadas ni WhatsApp.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/explorar"
                className="inline-flex items-center justify-center gap-2 bg-black hover:bg-nocturno-500 text-white font-bold px-6 py-3.5 rounded-full transition"
              >
                Explorar servicios <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-marca-50 text-black font-bold px-6 py-3.5 rounded-full border-2 border-black transition"
              >
                Registrar mi negocio
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-zinc-600">
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> <strong className="text-black">4.8</strong> promedio</div>
              <div><strong className="text-black">20</strong> negocios activos</div>
              <div><strong className="text-black">100 %</strong> gratuito</div>
            </div>
          </div>

          {/* Hero mock screen */}
          <div className="relative">
            <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-black via-nocturno-500 to-marca-500 rounded-[2.5rem] p-3 shadow-flotante">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                <div className="h-12 bg-zinc-50 flex items-center justify-center text-xs text-zinc-500 border-b border-zinc-100">
                  9:41
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs text-zinc-500">Cerca de ti · Cuenca</div>
                  <div className="bg-zinc-100 rounded-2xl h-48 relative overflow-hidden">
                    <div className="absolute top-6 left-8 w-3 h-3 bg-marca-500 rounded-full animate-pulso" />
                    <div className="absolute top-20 right-10 w-3 h-3 bg-black rounded-full" />
                    <div className="absolute bottom-8 left-16 w-3 h-3 bg-marca-500 rounded-full" />
                    <div className="absolute bottom-12 right-6 w-3 h-3 bg-black rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-medium">
                      Centro Histórico
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { n: 'Don Carlos Barbería', c: 'Barbería · 0.4 km', r: '4.9' },
                      { n: 'Estilo Andino Salón', c: 'Cabello · 0.8 km', r: '4.8' }
                    ].map((b) => (
                      <div key={b.n} className="flex items-center gap-3 p-2 rounded-xl border border-zinc-100">
                        <div className="w-10 h-10 bg-marca-100 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-black truncate">{b.n}</div>
                          <div className="text-[10px] text-zinc-500">{b.c}</div>
                        </div>
                        <div className="text-[10px] flex items-center gap-0.5 text-zinc-700">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          {b.r}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
      <section className="py-16 px-5 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-marca-500">Modo "necesito ahora"</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-black">
              ¿Apuro? Atención inmediata.
            </h2>
            <p className="mt-4 text-zinc-700 text-lg leading-relaxed">
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
              <div key={f.t} className="bg-marca-50 border-2 border-marca-100 rounded-2xl p-5">
                <f.i className="w-6 h-6 text-marca-500" />
                <div className="mt-3 font-bold text-black">{f.t}</div>
                <div className="mt-1 text-sm text-zinc-600">{f.d}</div>
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
            Únete a los 20 primeros negocios. Plan básico gratuito durante todo el MVP.
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

      {/* Footer */}
      <footer className="py-10 px-5 border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>· Hecho en Cuenca</span>
          </div>
          <div className="flex gap-5">
            <Link href="/explorar" className="hover:text-black font-medium">App</Link>
            <Link href="/onboarding" className="hover:text-black font-medium">Negocios</Link>
            <Link href="/login" className="hover:text-black font-medium">Acceder al panel</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
