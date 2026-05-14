'use client'
import { useState } from 'react'
import {
  Crown, Sparkles, Check, X, Zap, TrendingUp, Eye, Target,
  Award, Megaphone, Star, MapPin
} from 'lucide-react'
import { formatoUSD } from '@/lib/utils'

const PLAN_ACTUAL = 'basico' // 'basico' | 'pro'

const DESTACADOS = [
  {
    id: 'top-mapa',
    titulo: 'Destacado en el mapa',
    descripcion: 'Tu negocio aparece primero al abrir la app, con corona dorada visible.',
    precio: 14.99,
    duracion: '7 días',
    icono: Target,
    impresiones: '2.500 – 4.000',
    reservasExtra: '15 – 25'
  },
  {
    id: 'flash',
    titulo: 'Promoción flash',
    descripcion: 'Notificación push a usuarios cercanos cuando tengas espacio libre.',
    precio: 4.99,
    duracion: '24 horas',
    icono: Zap,
    impresiones: '800 – 1.500',
    reservasExtra: '5 – 12'
  },
  {
    id: 'top-categoria',
    titulo: 'Top en tu categoría',
    descripcion: 'Primer lugar en los resultados de Barbería en toda Cuenca.',
    precio: 9.99,
    duracion: '7 días',
    icono: Award,
    impresiones: '1.800 – 3.000',
    reservasExtra: '10 – 18'
  },
  {
    id: 'banner-home',
    titulo: 'Banner en la portada',
    descripcion: 'Tu negocio aparece en la sección principal de descubrimiento.',
    precio: 24.99,
    duracion: '7 días',
    icono: Megaphone,
    impresiones: '5.000 – 8.000',
    reservasExtra: '25 – 40'
  }
]

export default function PromocionPage() {
  const [tab, setTab] = useState('plan')
  const [destacadoElegido, setDestacadoElegido] = useState(null)

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Promoción</h1>
          <p className="text-sm text-zinc-500">
            Haz que más clientes encuentren tu negocio
          </p>
        </div>
        <PlanActualBadge plan={PLAN_ACTUAL} />
      </div>

      {/* Tabs */}
      <div className="mt-6 bg-zinc-100 rounded-full p-1 inline-grid grid-cols-2 gap-1">
        <TabBtn activo={tab === 'plan'} onClick={() => setTab('plan')}>
          <Crown className="w-3.5 h-3.5" /> Mi plan
        </TabBtn>
        <TabBtn activo={tab === 'destacar'} onClick={() => setTab('destacar')}>
          <Sparkles className="w-3.5 h-3.5" /> Destaques puntuales
        </TabBtn>
      </div>

      {tab === 'plan' && <SeccionPlanes />}
      {tab === 'destacar' && (
        <SeccionDestacar
          destacadoElegido={destacadoElegido}
          setDestacadoElegido={setDestacadoElegido}
        />
      )}
    </div>
  )
}

function TabBtn({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition ${
        activo ? 'bg-black text-white shadow-sm' : 'text-zinc-600'
      }`}
    >
      {children}
    </button>
  )
}

function PlanActualBadge({ plan }) {
  if (plan === 'pro') {
    return (
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
        <Crown className="w-4 h-4 fill-white" /> Plan Pro activo
      </div>
    )
  }
  return (
    <div className="bg-zinc-100 text-zinc-700 px-3.5 py-1.5 rounded-full text-xs font-bold">
      Plan Básico
    </div>
  )
}

function SeccionPlanes() {
  return (
    <>
      <div className="mt-7 grid md:grid-cols-2 gap-4 items-stretch">
        {/* Plan Básico */}
        <div className="bg-white rounded-3xl border-2 border-zinc-200 p-6 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 grid place-items-center">
              <MapPin className="w-4 h-4 text-zinc-600" />
            </div>
            <h3 className="text-lg font-extrabold text-black">Plan Básico</h3>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Todo lo necesario para operar</p>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-black">Gratis</span>
            <span className="text-sm text-zinc-500">para siempre</span>
          </div>

          <ul className="mt-6 space-y-2.5 flex-1">
            <Beneficio>Perfil de tu negocio en el mapa de NearUs</Beneficio>
            <Beneficio>Agenda con reservas ilimitadas</Beneficio>
            <Beneficio>QR de check-in para clientes</Beneficio>
            <Beneficio>Reportes básicos de actividad</Beneficio>
            <Beneficio>Gestión de servicios y equipo</Beneficio>
          </ul>

          <button
            disabled
            className="mt-6 w-full bg-zinc-100 text-zinc-500 font-bold py-3 rounded-full cursor-default"
          >
            Tu plan actual
          </button>
        </div>

        {/* Plan Pro — un solo beneficio */}
        <div className="relative bg-gradient-to-br from-black via-nocturno-500 to-marca-700 text-white rounded-3xl p-6 shadow-flotante overflow-hidden flex flex-col">
          {/* Decoración */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl" />
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-marca-400/20 rounded-full blur-3xl" />

          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            Recomendado
          </div>

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 grid place-items-center shadow-lg">
                <Crown className="w-5 h-5 text-amber-950 fill-amber-950" />
              </div>
              <h3 className="text-lg font-extrabold">Plan Pro</h3>
            </div>
            <p className="text-sm text-zinc-300 mt-1">Tu negocio siempre destacado</p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{formatoUSD(19.99)}</span>
              <span className="text-sm text-zinc-300">/ mes</span>
            </div>
            <div className="mt-1 text-xs text-amber-300 font-medium">
              ⚡ MVP: {formatoUSD(9.99)} los primeros 3 meses
            </div>
          </div>

          {/* Visualización del beneficio único */}
          <div className="relative mt-6 bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 flex-1 flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
              El único beneficio
            </div>

            <div className="mt-3 flex items-center justify-center py-4">
              <PreviewMarcadorCorona />
            </div>

            <h4 className="text-center text-xl font-extrabold leading-tight">
              Tu negocio destacado en el mapa
            </h4>
            <p className="text-center text-sm text-zinc-300 mt-2 leading-relaxed">
              Aparece con <strong className="text-amber-300">corona dorada</strong> visible para
              todos los usuarios de NearUs. Posicionado primero en los resultados.
              Más visualizaciones, más reservas.
            </p>
          </div>

          <button className="relative mt-6 w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold py-3 rounded-full transition shadow-marca">
            Activar Pro
          </button>
          <p className="relative mt-2 text-center text-[10px] text-zinc-400">
            Sin permanencia · Cancela cuando quieras
          </p>
        </div>
      </div>

      {/* Aclaración */}
      <div className="mt-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-marca-500 shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-700 leading-relaxed">
          <strong className="text-black">El plan Pro tiene un único beneficio:</strong> tu negocio
          aparece <strong>destacado en el mapa con corona dorada</strong> mientras pagues la
          suscripción mensual. Todas las demás funciones (agenda, reservas, reportes, equipo,
          QR) están incluidas también en el plan Básico de forma gratuita.
        </div>
      </div>
    </>
  )
}

function PreviewMarcadorCorona() {
  return (
    <div className="relative">
      <svg width="54" height="46" viewBox="0 0 40 32" className="mx-auto mb-1 animate-pulse">
        <defs>
          <linearGradient id="oro-preview" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path
          d="M4 26 L6 10 L13 17 L20 5 L27 17 L34 10 L36 26 Z"
          fill="url(#oro-preview)"
          stroke="#92400E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="4" y="25" width="32" height="4" rx="1.5" fill="url(#oro-preview)" stroke="#92400E" strokeWidth="1.2" />
        <circle cx="6" cy="10" r="2.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <circle cx="20" cy="5" r="2.8" fill="#EF4444" stroke="#92400E" strokeWidth="1" />
        <circle cx="34" cy="10" r="2.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <circle cx="13" cy="17" r="1.6" fill="#10B981" stroke="#92400E" strokeWidth="0.8" />
        <circle cx="27" cy="17" r="1.6" fill="#3B82F6" stroke="#92400E" strokeWidth="0.8" />
      </svg>
      {/* Marcador estilo NearUs debajo */}
      <div className="mx-auto" style={{ width: 64 }}>
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-md animate-pulso" />
          <div className="relative w-16 h-16 rounded-full bg-marca-500 border-[5px] border-amber-400 grid place-items-center shadow-2xl">
            <span className="text-3xl">✂️</span>
          </div>
        </div>
        <div className="mx-auto mt-[-2px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-marca-500" />
      </div>
    </div>
  )
}

function Beneficio({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <div className="w-5 h-5 rounded-full bg-marca-500 grid place-items-center shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
      <span className="text-zinc-700">{children}</span>
    </li>
  )
}

function SeccionDestacar({ destacadoElegido, setDestacadoElegido }) {
  return (
    <>
      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 grid place-items-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-sm">
          <div className="font-bold text-amber-900">Destaques temporales — pago único</div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            ¿No querés suscripción? Comprá un destaque puntual para fechas o temporadas claves.
            También aparecés con corona dorada, pero solo durante el tiempo contratado.
          </p>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-3 gap-3">
        <Estadistica icono={Eye} valor="3.247" label="Vistas este mes" delta="+22 %" />
        <Estadistica icono={TrendingUp} valor="12" label="Conversiones a reserva" delta="0.4 % CTR" />
        <Estadistica icono={Star} valor="#3" label="Posición en categoría" delta="de 12 barberías" />
      </div>

      <h3 className="mt-7 text-sm font-bold text-black">Destaques disponibles</h3>
      <p className="text-xs text-zinc-500 mt-1">
        Sin permanencia. Pagás solo cuando lo necesitás.
      </p>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {DESTACADOS.map((d) => (
          <CardDestacado
            key={d.id}
            destacado={d}
            seleccionado={destacadoElegido?.id === d.id}
            onClick={() => setDestacadoElegido(d)}
          />
        ))}
      </div>

      {destacadoElegido && (
        <ResumenPromocion
          destacado={destacadoElegido}
          onCerrar={() => setDestacadoElegido(null)}
        />
      )}

      <div className="mt-5 bg-white border border-zinc-100 rounded-2xl p-5">
        <div className="text-sm font-bold text-black">Historial de promociones</div>
        <div className="mt-3 space-y-2 text-sm text-zinc-500">
          <div className="flex items-center justify-between py-2 border-b border-zinc-50">
            <div>
              <div className="text-black font-bold">Top en tu categoría</div>
              <div className="text-xs">15–22 de abril · 2.847 impresiones · 14 reservas</div>
            </div>
            <div className="text-acento-600 font-bold">+ {formatoUSD(196.00)}</div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-50">
            <div>
              <div className="text-black font-bold">Promoción flash</div>
              <div className="text-xs">3 de marzo · 1.124 impresiones · 9 reservas</div>
            </div>
            <div className="text-acento-600 font-bold">+ {formatoUSD(126.00)}</div>
          </div>
        </div>
      </div>
    </>
  )
}

function Estadistica({ icono: Icono, valor, label, delta }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-marca-50 text-marca-500 grid place-items-center">
          <Icono className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold text-acento-600 bg-acento-500/10 px-2 py-0.5 rounded-full">
          {delta}
        </span>
      </div>
      <div className="mt-3 text-2xl font-extrabold text-black">{valor}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  )
}

function CardDestacado({ destacado, seleccionado, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 text-left border-2 transition hover:shadow-suave ${
        seleccionado
          ? 'border-amber-500 ring-4 ring-amber-100'
          : 'border-zinc-100 hover:border-amber-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white grid place-items-center shadow-md">
          <destacado.icono className="w-5 h-5" />
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold text-black">{formatoUSD(destacado.precio)}</div>
          <div className="text-[10px] text-zinc-500">por {destacado.duracion}</div>
        </div>
      </div>
      <h4 className="mt-3 font-bold text-black">{destacado.titulo}</h4>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{destacado.descripcion}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-50 rounded-lg px-2.5 py-2">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wide font-bold">Impresiones</div>
          <div className="text-black font-bold">{destacado.impresiones}</div>
        </div>
        <div className="bg-acento-500/10 rounded-lg px-2.5 py-2">
          <div className="text-[9px] text-acento-600 uppercase tracking-wide font-bold">Reservas extra</div>
          <div className="text-acento-600 font-bold">{destacado.reservasExtra}</div>
        </div>
      </div>
    </button>
  )
}

function ResumenPromocion({ destacado, onCerrar }) {
  const [pagando, setPagando] = useState(false)
  const [exito, setExito] = useState(false)

  const contratar = () => {
    setPagando(true)
    setTimeout(() => {
      setPagando(false)
      setExito(true)
    }, 1200)
  }

  if (exito) {
    return (
      <div className="mt-5 bg-acento-500 text-white rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <Check className="w-4 h-4" /> Destacado activado
          </div>
          <button onClick={onCerrar} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="mt-3 text-2xl font-extrabold">¡{destacado.titulo} ya está corriendo!</h3>
        <p className="mt-1 text-emerald-100 text-sm">
          Tu negocio aparecerá con corona dorada durante {destacado.duracion}. Te avisaremos cuando
          termine y los resultados aparecerán en tus reportes.
        </p>
        <div className="mt-4 text-xs text-emerald-100">
          Cobrado: <strong className="text-white">{formatoUSD(destacado.precio)}</strong> a tu
          método de pago registrado
        </div>
      </div>
    )
  }

  return (
    <div className="mt-5 bg-black text-white rounded-3xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
            Listo para contratar
          </div>
          <h3 className="mt-1 text-xl font-extrabold">{destacado.titulo}</h3>
          <p className="text-sm text-zinc-400 mt-1">{destacado.descripcion}</p>
        </div>
        <button onClick={onCerrar} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-xl py-3">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Duración</div>
          <div className="text-sm font-bold mt-1">{destacado.duracion}</div>
        </div>
        <div className="bg-white/5 rounded-xl py-3">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Impresiones</div>
          <div className="text-sm font-bold mt-1">{destacado.impresiones}</div>
        </div>
        <div className="bg-white/5 rounded-xl py-3">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Total</div>
          <div className="text-sm font-bold mt-1">{formatoUSD(destacado.precio)}</div>
        </div>
      </div>

      <button
        onClick={contratar}
        disabled={pagando}
        className="mt-5 w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-300 text-amber-950 font-extrabold py-3 rounded-full transition flex items-center justify-center gap-2"
      >
        {pagando ? (
          <>
            <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Activar destacado · {formatoUSD(destacado.precio)}
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[10px] text-zinc-400">
        Se cobrará al método de pago registrado. Cancela cuando quieras.
      </p>
    </div>
  )
}
