import Link from 'next/link'
import { MapPinOff, Home, Map } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-white/5">
      <div className="max-w-md w-full bg-nocturno-500 rounded-3xl border border-white/10 p-8 text-center shadow-suave">
        <div className="w-16 h-16 mx-auto bg-marca-500/10 rounded-full grid place-items-center text-marca-500">
          <MapPinOff className="w-8 h-8" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-white">No encontramos esa página</h1>
        <p className="mt-2 text-sm text-zinc-400">
          El enlace puede estar roto o el negocio ya no está disponible en NearUs.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            href="/explorar"
            className="bg-marca-500 hover:bg-marca-600 text-white font-medium px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
          >
            <Map className="w-4 h-4" /> Explorar
          </Link>
          <Link
            href="/"
            className="bg-nocturno-500 border border-white/10 hover:bg-white/5 text-zinc-200 font-medium px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
