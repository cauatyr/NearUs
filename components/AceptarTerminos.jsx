'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Loader2 } from 'lucide-react'
import TextoLegal from '@/components/TextoLegal'
import { TERMINOS_CLIENTE, TERMINOS_VERSION } from '@/lib/legal/terminos'
import { useCliente } from '@/lib/store-cliente'

const LS_KEY = 'nearus.terminos'

// Rutas donde NO se muestra: el panel del negocio y administración tienen su
// propio acuerdo (el contrato del onboarding), y las páginas legales y de acceso
// se tienen que poder leer sin aceptar nada primero.
const EXENTAS = ['/negocio', '/admin', '/login', '/onboarding', '/setup', '/terminos', '/privacidad']

function leerLocal() {
  try {
    return localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}

function guardarLocal(version) {
  try {
    localStorage.setItem(LS_KEY, version)
  } catch {}
}

// Aceptación bloqueante de los términos, la primera vez que se abre el app.
// Versionada: si TERMINOS_VERSION sube, se vuelve a pedir.
//
// Queda registrada en el navegador (sirve para quien todavía no tiene cuenta) y,
// si hay sesión de cliente, también en su user_metadata — así vale en cualquier
// dispositivo donde entre con esa cuenta.
export default function AceptarTerminos() {
  const pathname = usePathname()
  const cliente = useCliente((s) => s.cliente)
  const aceptarEnCuenta = useCliente((s) => s.aceptarTerminos)

  const [montado, setMontado] = useState(false)
  const [aceptadoLocal, setAceptadoLocal] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setAceptadoLocal(leerLocal())
    setMontado(true)
  }, [])

  // Si la cuenta ya aceptó esta versión en otro dispositivo, no volvemos a
  // molestar acá: alcanza con dejar la marca local.
  useEffect(() => {
    if (!montado) return
    if (cliente?.terminosVersion === TERMINOS_VERSION && aceptadoLocal !== TERMINOS_VERSION) {
      guardarLocal(TERMINOS_VERSION)
      setAceptadoLocal(TERMINOS_VERSION)
    }
  }, [montado, cliente, aceptadoLocal])

  if (!montado) return null
  if (aceptadoLocal === TERMINOS_VERSION) return null
  if (EXENTAS.some((r) => pathname === r || pathname?.startsWith(r + '/'))) return null

  const aceptar = async () => {
    setGuardando(true)
    guardarLocal(TERMINOS_VERSION)
    // Si hay sesión, queda también en la cuenta. Si falla (sin red), la marca
    // local ya alcanza para dejarlo usar el app.
    await aceptarEnCuenta(TERMINOS_VERSION)
    setGuardando(false)
    setAceptadoLocal(TERMINOS_VERSION)
  }

  const esActualizacion = !!aceptadoLocal && aceptadoLocal !== TERMINOS_VERSION

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-md bg-nocturno-500 rounded-3xl shadow-flotante border border-white/10 flex flex-col max-h-[88vh]">
        <div className="p-6 pb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-marca-500/10 grid place-items-center text-marca-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">
            {esActualizacion ? 'Actualizamos los términos' : 'Antes de empezar'}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            {esActualizacion
              ? 'Cambiaron los términos de servicio de NearUs. Leelos y aceptalos para seguir usando el app.'
              : 'Para usar NearUs necesitamos que aceptes los términos de servicio y la política de privacidad.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <TextoLegal doc={TERMINOS_CLIENTE} compacto />
        </div>

        <div className="p-6 pt-4 border-t border-white/10 shrink-0">
          <button
            onClick={aceptar}
            disabled={guardando}
            className="w-full bg-marca-500 hover:bg-marca-600 disabled:opacity-70 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-marca"
          >
            {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
            Acepto los términos
          </button>
          <p className="mt-3 text-center text-[11px] text-zinc-500">
            Podés leerlos completos en{' '}
            <Link href="/terminos" className="text-marca-400 hover:underline">
              términos de servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-marca-400 hover:underline">
              privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
