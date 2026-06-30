'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Zap, User } from 'lucide-react'

const ITEMS = [
  { href: '/inicio', icono: Home, label: 'Inicio' },
  { href: '/ahora', icono: Zap, label: 'Near you' },
  { href: '/explorar', icono: Map, label: 'Mapa' },
  { href: '/perfil', icono: User, label: 'Mi perfil' }
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-nocturno-500 border-t border-white/10"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="max-w-md mx-auto h-16 grid grid-cols-4">
        {ITEMS.map((it) => {
          const activo = pathname?.startsWith(it.href)
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                activo ? 'text-marca-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <it.icono
                className={`w-5 h-5 ${activo && it.href === '/ahora' ? 'fill-marca-500' : ''}`}
              />
              <span>{it.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
