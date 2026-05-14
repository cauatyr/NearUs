'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Zap, Heart, User } from 'lucide-react'

const ITEMS = [
  { href: '/explorar', icono: Map, label: 'Explorar' },
  { href: '/ahora', icono: Zap, label: 'Ahora' },
  { href: '/perfil', icono: User, label: 'Mi perfil' }
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-zinc-100"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="max-w-md mx-auto h-16 grid grid-cols-3">
        {ITEMS.map((it) => {
          const activo = pathname?.startsWith(it.href)
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                activo ? 'text-marca-500' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <it.icono
                className={`w-5 h-5 ${activo && it.label === 'Ahora' ? 'fill-marca-500' : ''}`}
              />
              <span>{it.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
