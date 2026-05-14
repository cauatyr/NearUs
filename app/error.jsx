'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error de NearUs:', error)
  }, [error])

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-100 p-8 text-center shadow-suave">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full grid place-items-center text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-zinc-900">Algo salió mal</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Hubo un error inesperado al cargar esta página. Puedes intentar nuevamente o volver al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="mt-5 text-left text-[11px] bg-zinc-900 text-red-300 rounded-xl p-3 overflow-auto max-h-40">
            {error.message}
            {error.stack && `\n\n${error.stack.split('\n').slice(0, 5).join('\n')}`}
          </pre>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => reset()}
            className="bg-marca-500 hover:bg-marca-600 text-white font-medium px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
          <Link
            href="/"
            className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
