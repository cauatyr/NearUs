'use client'
import { Wallet } from 'lucide-react'
import { useCliente } from '@/lib/store-cliente'
import { formatoUSD } from '@/lib/utils'

// Billetera (wallet) por usuario — POR AHORA SOLO DECORATIVA.
// Muestra el saldo (todavía $0) sin recarga ni pago con saldo. La lógica real
// (recargar, verificar pago, pagar reservas) vive en lib/store-wallet.js y
// supabase/wallet.sql, listas para activarse cuando se decida el proveedor.
export default function Billetera() {
  const cliente = useCliente((s) => s.cliente)
  if (!cliente) return null

  return (
    <div className="px-5 mt-5">
      <div className="relative bg-gradient-to-br from-black via-nocturno-500 to-marca-700 text-white rounded-3xl p-5 shadow-flotante overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-marca-400/20 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-marca-200 text-xs font-medium">
              <Wallet className="w-4 h-4" /> Mi saldo NearUs
            </div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatoUSD(0)}
            </div>
          </div>
          <span className="bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Próximamente
          </span>
        </div>
        <p className="relative mt-3 text-[11px] text-zinc-300 leading-relaxed">
          Pronto vas a poder cargar saldo y pagar tus reservas en cualquier negocio de NearUs.
        </p>
      </div>
    </div>
  )
}
