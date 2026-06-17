'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// SIMULADO (local) — Parte 1 del MVP. Guarda cuentas y sesión del cliente en
// localStorage para poder probar el flujo sin backend. En la entrega (Parte 3)
// se reemplaza por Supabase Auth. La contraseña se guarda en claro a propósito:
// es solo un mock local de pruebas, no un sistema de credenciales real.
export const useCliente = create(
  persist(
    (set, get) => ({
      cliente: null, // { nombre, email, celular }
      cuentas: {}, // email -> { nombre, email, celular, password }

      registrar({ nombre, email, celular, password }) {
        const correo = (email || '').trim().toLowerCase()
        if (!nombre || !nombre.trim()) return { error: 'Ingresa tu nombre.' }
        if (!correo) return { error: 'Ingresa tu email.' }
        if ((password || '').length < 6)
          return { error: 'La contraseña debe tener al menos 6 caracteres.' }
        if (get().cuentas[correo])
          return { error: 'Ya existe una cuenta con ese email. Inicia sesión.' }

        const cuenta = {
          nombre: nombre.trim(),
          email: correo,
          celular: (celular || '').trim(),
          password
        }
        set((s) => ({
          cuentas: { ...s.cuentas, [correo]: cuenta },
          cliente: { nombre: cuenta.nombre, email: cuenta.email, celular: cuenta.celular }
        }))
        return { error: null }
      },

      iniciarSesion({ email, password }) {
        const correo = (email || '').trim().toLowerCase()
        const cuenta = get().cuentas[correo]
        if (!cuenta || cuenta.password !== password)
          return { error: 'Email o contraseña incorrectos.' }
        set({ cliente: { nombre: cuenta.nombre, email: cuenta.email, celular: cuenta.celular } })
        return { error: null }
      },

      cerrarSesion() {
        set({ cliente: null })
      }
    }),
    { name: 'nearus-cliente' }
  )
)
