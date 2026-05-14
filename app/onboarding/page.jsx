'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Store, MapPin, Phone, User, Mail, Sparkles } from 'lucide-react'
import { CATEGORIAS } from '@/lib/data/categorias'
import Logo from '@/components/Logo'

const PASOS = ['Tu negocio', 'Ubicación', 'Contacto', 'Listo']

export default function OnboardingPage() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    direccion: '',
    barrio: '',
    telefono: '',
    email: '',
    responsable: ''
  })

  const actualizar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const puedeAvanzar = () => {
    if (paso === 0) return datos.nombre && datos.categoria && datos.descripcion
    if (paso === 1) return datos.direccion && datos.barrio
    if (paso === 2) return datos.telefono && datos.email && datos.responsable
    return false
  }

  const siguiente = () => {
    if (paso < PASOS.length - 1) setPaso(paso + 1)
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-black">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="hidden sm:inline text-xs text-zinc-500 font-medium border-l border-zinc-200 pl-2 ml-1">
              Negocios
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {PASOS.map((nombre, i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i <= paso ? 'bg-marca-500' : 'bg-zinc-200'
                }`}
              />
              <div className={`mt-2 text-xs ${i === paso ? 'text-marca-600 font-medium' : 'text-zinc-500'}`}>
                {nombre}
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 sm:p-10 shadow-suave">
          {paso === 0 && (
            <PasoNegocio datos={datos} actualizar={actualizar} />
          )}
          {paso === 1 && <PasoUbicacion datos={datos} actualizar={actualizar} />}
          {paso === 2 && <PasoContacto datos={datos} actualizar={actualizar} />}
          {paso === 3 && <PasoListo datos={datos} />}

          {paso < PASOS.length - 1 && (
            <div className="mt-8 flex items-center justify-between">
              {paso > 0 ? (
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 px-4 py-2"
                >
                  Atrás
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={siguiente}
                disabled={!puedeAvanzar()}
                className="bg-marca-500 hover:bg-marca-600 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-full transition"
              >
                Continuar
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Plan básico gratuito durante el MVP · Sin compromisos
        </p>
      </div>
    </main>
  )
}

function PasoNegocio({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <Store className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 1 de 3</span>
      </div>
      <h2 className="text-2xl font-semibold text-zinc-900">Cuéntanos de tu negocio</h2>
      <p className="text-zinc-600 mt-1">Información básica que verán tus futuros clientes.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Nombre del negocio"
          placeholder="Ej. Don Carlos Barbería Clásica"
          valor={datos.nombre}
          onChange={(v) => actualizar('nombre', v)}
        />
        <div>
          <label className="text-sm font-medium text-zinc-700">Categoría</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => actualizar('categoria', c.id)}
                className={`p-3 rounded-xl text-sm font-medium border-2 transition ${
                  datos.categoria === c.id
                    ? 'border-marca-500 bg-marca-50 text-marca-600'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
        <Campo
          etiqueta="Descripción corta"
          placeholder="Ej. Barbería tradicional con afeitado clásico y servicios premium."
          valor={datos.descripcion}
          onChange={(v) => actualizar('descripcion', v)}
          textarea
        />
      </div>
    </div>
  )
}

function PasoUbicacion({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <MapPin className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 2 de 3</span>
      </div>
      <h2 className="text-2xl font-semibold text-zinc-900">¿Dónde están ubicados?</h2>
      <p className="text-zinc-600 mt-1">Para que aparezcan en el mapa de NearUs.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Dirección completa"
          placeholder="Ej. Calle Larga 7-65 y Luis Cordero"
          valor={datos.direccion}
          onChange={(v) => actualizar('direccion', v)}
        />
        <Campo
          etiqueta="Barrio o sector"
          placeholder="Ej. Centro Histórico, El Vergel, Yanuncay..."
          valor={datos.barrio}
          onChange={(v) => actualizar('barrio', v)}
        />
        <div className="bg-marca-50 border border-marca-100 rounded-2xl p-4 text-sm text-marca-700">
          <p className="font-medium">Cuenca · Ecuador</p>
          <p className="text-marca-600 mt-1 text-xs">
            En esta fase del MVP solo aceptamos negocios en Cuenca. Próximamente Quito, Guayaquil y Bogotá.
          </p>
        </div>
      </div>
    </div>
  )
}

function PasoContacto({ datos, actualizar }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-marca-500 mb-2">
        <Phone className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Paso 3 de 3</span>
      </div>
      <h2 className="text-2xl font-semibold text-zinc-900">Datos de contacto</h2>
      <p className="text-zinc-600 mt-1">Te enviaremos el acceso al panel del negocio.</p>

      <div className="mt-6 space-y-5">
        <Campo
          etiqueta="Nombre del responsable"
          placeholder="Ej. Carlos Ortega"
          valor={datos.responsable}
          onChange={(v) => actualizar('responsable', v)}
          icono={User}
        />
        <Campo
          etiqueta="Celular"
          placeholder="+593 99 123 4567"
          valor={datos.telefono}
          onChange={(v) => actualizar('telefono', v)}
          icono={Phone}
          type="tel"
        />
        <Campo
          etiqueta="Correo electrónico"
          placeholder="contacto@tunegocio.ec"
          valor={datos.email}
          onChange={(v) => actualizar('email', v)}
          icono={Mail}
          type="email"
        />
      </div>
    </div>
  )
}

function PasoListo({ datos }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto bg-acento-500 rounded-full grid place-items-center">
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-zinc-900">¡Bienvenido a NearUs!</h2>
      <p className="text-zinc-600 mt-2 max-w-md mx-auto">
        Hemos recibido el registro de <strong>{datos.nombre}</strong>. Te llamaremos en máximo 24 horas
        al <strong>{datos.telefono}</strong> para activar tu panel.
      </p>

      <div className="mt-6 bg-marca-50 border border-marca-100 rounded-2xl p-5 text-left max-w-md mx-auto">
        <div className="flex items-center gap-2 text-marca-700 font-medium text-sm">
          <Sparkles className="w-4 h-4" />
          Mientras tanto, puedes explorar
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/negocio/agenda"
            className="bg-white border border-marca-100 rounded-xl px-4 py-3 text-sm font-medium text-marca-600 hover:bg-marca-50 text-center"
          >
            Ver panel demo
          </Link>
          <Link
            href="/explorar"
            className="bg-white border border-marca-100 rounded-xl px-4 py-3 text-sm font-medium text-marca-600 hover:bg-marca-50 text-center"
          >
            App del usuario
          </Link>
        </div>
      </div>
    </div>
  )
}

function Campo({ etiqueta, placeholder, valor, onChange, type = 'text', textarea, icono: Icono }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700">{etiqueta}</label>
      <div className="mt-2 relative">
        {Icono && <Icono className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />}
        {textarea ? (
          <textarea
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition resize-none"
          />
        ) : (
          <input
            type={type}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-marca-500 focus:bg-white transition ${
              Icono ? 'pl-11 pr-4' : 'px-4'
            }`}
          />
        )}
      </div>
    </div>
  )
}
