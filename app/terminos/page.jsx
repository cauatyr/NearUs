import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'
import TextoLegal from '@/components/TextoLegal'
import { TERMINOS_CLIENTE, CONTRATO_NEGOCIO } from '@/lib/legal/terminos'

export const metadata = {
  title: 'Términos de servicio — NearUs',
  description: 'Términos de servicio de NearUs para clientes y contrato para negocios.'
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-nocturno-700">
      <header className="sticky top-0 z-20 bg-nocturno-500 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Volver</span>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold text-white">{TERMINOS_CLIENTE.titulo}</h1>
        <p className="mt-1 text-sm text-zinc-400">{TERMINOS_CLIENTE.subtitulo}</p>

        <div className="mt-7">
          <TextoLegal doc={TERMINOS_CLIENTE} />
        </div>

        <div className="mt-12 pt-10 border-t border-white/10">
          <h1 className="text-3xl font-semibold text-white">{CONTRATO_NEGOCIO.titulo}</h1>
          <p className="mt-1 text-sm text-zinc-400">{CONTRATO_NEGOCIO.subtitulo}</p>
          <div className="mt-7">
            <TextoLegal doc={CONTRATO_NEGOCIO} />
          </div>
        </div>

        <div className="mt-10 text-sm">
          <Link href="/privacidad" className="text-marca-400 hover:text-marca-300 transition">
            Ver también la política de privacidad →
          </Link>
        </div>
      </div>
    </main>
  )
}
