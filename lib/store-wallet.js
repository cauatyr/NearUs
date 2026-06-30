'use client'
import { create } from 'zustand'
import { supabase } from './supabase'

// Billetera (wallet) del cliente. El saldo es la SUMA de un libro mayor
// inmutable en Supabase (wallet_movimientos). Ver supabase/wallet.sql.

function genId() {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function mapMov(row) {
  return {
    id: row.id,
    clienteUserId: row.cliente_user_id,
    tipo: row.tipo,
    monto: Number(row.monto),
    reservaId: row.reserva_id || null,
    metodo: row.metodo || null,
    descripcion: row.descripcion || '',
    fecha: row.created_at
  }
}

function calcularSaldo(movs) {
  return movs.reduce((s, m) => s + m.monto, 0)
}

function upsert(mov, lista) {
  const i = lista.findIndex((x) => x.id === mov.id)
  if (i === -1) return [mov, ...lista]
  const n = [...lista]
  n[i] = mov
  return n
}

export const useWallet = create((set, get) => ({
  movimientos: [],
  saldo: 0,
  cargado: false,
  cargando: false,
  userId: null,
  error: null,
  _channel: null,

  // Carga los movimientos del usuario y arma el saldo. Idempotente por usuario.
  async cargar(userId) {
    if (!userId) return
    const prev = get().userId
    if (prev === userId && (get().cargado || get().cargando)) return
    // Cambió de usuario en el mismo navegador: tiramos el canal viejo y limpiamos.
    if (prev && prev !== userId && get()._channel) {
      supabase.removeChannel(get()._channel)
      set({ _channel: null })
    }
    set({
      cargando: true,
      userId,
      error: null,
      movimientos: prev !== userId ? [] : get().movimientos,
      saldo: prev !== userId ? 0 : get().saldo,
      cargado: false
    })

    const { data, error } = await supabase
      .from('wallet_movimientos')
      .select('*')
      .eq('cliente_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      set({ cargando: false, error: error.message })
      return
    }
    const movimientos = (data ?? []).map(mapMov)
    set({ movimientos, saldo: calcularSaldo(movimientos), cargado: true, cargando: false })
    get().iniciarRealtime(userId)
  },

  // Acredita saldo. HOY es simulado (entra directo) para poder probar.
  // En producción real, esto lo hace el servidor tras confirmar el pago
  // del proveedor (PIX/tarjeta) — ver nota en supabase/wallet.sql.
  async recargar({ userId, monto, metodo = 'simulado', descripcion = 'Recarga de saldo' }) {
    const m = Number(monto)
    if (!userId) return { error: 'Inicia sesión para recargar.' }
    if (!(m > 0)) return { error: 'Ingresa un monto válido.' }

    const payload = {
      id: genId(),
      cliente_user_id: userId,
      tipo: 'recarga',
      monto: m,
      metodo,
      descripcion
    }
    const { data, error } = await supabase
      .from('wallet_movimientos')
      .insert(payload)
      .select()
      .single()
    if (error) return { error: error.message }

    const mov = mapMov(data)
    set((s) => {
      const movimientos = upsert(mov, s.movimientos)
      return { movimientos, saldo: calcularSaldo(movimientos) }
    })
    return { error: null }
  },

  // Descuenta el costo de una reserva del saldo. Exige saldo suficiente.
  async pagarReserva({ userId, reservaId, monto, descripcion = 'Pago de reserva' }) {
    const m = Number(monto)
    if (!userId) return { error: 'Inicia sesión.' }
    if (get().saldo + 1e-9 < m) return { error: 'Saldo insuficiente.' }

    const payload = {
      id: genId(),
      cliente_user_id: userId,
      tipo: 'pago',
      monto: -Math.abs(m),
      reserva_id: reservaId || null,
      metodo: 'saldo',
      descripcion
    }
    const { data, error } = await supabase
      .from('wallet_movimientos')
      .insert(payload)
      .select()
      .single()
    if (error) return { error: error.message }

    const mov = mapMov(data)
    set((s) => {
      const movimientos = upsert(mov, s.movimientos)
      return { movimientos, saldo: calcularSaldo(movimientos) }
    })
    return { error: null }
  },

  iniciarRealtime(userId) {
    if (get()._channel) return
    const channel = supabase
      .channel(`wallet-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_movimientos',
          filter: `cliente_user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') return
          const mov = mapMov(payload.new)
          set((s) => {
            const movimientos = upsert(mov, s.movimientos)
            return { movimientos, saldo: calcularSaldo(movimientos) }
          })
        }
      )
      .subscribe()
    set({ _channel: channel })
  },

  // Al cerrar sesión / cambiar de usuario.
  limpiar() {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ movimientos: [], saldo: 0, cargado: false, cargando: false, userId: null, _channel: null })
  }
}))
