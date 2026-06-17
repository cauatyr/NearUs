'use client'
import { create } from 'zustand'
import { supabase } from './supabase'

// Sesión de cliente con Supabase Auth (email + contraseña). El nombre y el
// celular se guardan en user_metadata. Un cliente es un usuario autenticado;
// si además es dueño de un negocio, eso lo maneja store-sesion por separado.

function aCliente(user) {
  if (!user) return null
  const m = user.user_metadata || {}
  return {
    id: user.id,
    email: user.email,
    nombre: m.nombre || (user.email ? user.email.split('@')[0] : 'Cliente'),
    celular: m.celular || ''
  }
}

function traducir(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos.'
  if (m.includes('already registered') || m.includes('already exists') || m.includes('already been'))
    return 'Ya existe una cuenta con ese email. Inicia sesión.'
  if (m.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('email')) return 'Revisa el email ingresado.'
  return msg || 'Algo salió mal. Inténtalo de nuevo.'
}

export const useCliente = create((set, get) => ({
  cliente: null,
  inicializado: false,

  async inicializar() {
    if (get().inicializado) return
    set({ inicializado: true })
    const { data } = await supabase.auth.getSession()
    set({ cliente: aCliente(data.session?.user) })
    supabase.auth.onAuthStateChange((_e, session) => {
      set({ cliente: aCliente(session?.user) })
    })
  },

  async registrar({ nombre, email, celular, password }) {
    if (!nombre || !nombre.trim()) return { error: 'Ingresa tu nombre.' }
    const correo = (email || '').trim()
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password,
      options: { data: { nombre: nombre.trim(), celular: (celular || '').trim() } }
    })
    if (error) return { error: traducir(error.message) }
    // Si el proyecto exige confirmación de email no llega session — intentamos signin.
    if (!data.session) {
      const { error: e2 } = await supabase.auth.signInWithPassword({ email: correo, password })
      if (e2) return { error: 'Cuenta creada. Si pide confirmación, revisa tu email y luego inicia sesión.' }
    }
    const { data: u } = await supabase.auth.getUser()
    set({ cliente: aCliente(u.user) })
    return { error: null }
  },

  async iniciarSesion({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: (email || '').trim(),
      password
    })
    if (error) return { error: traducir(error.message) }
    set({ cliente: aCliente(data.user) })
    return { error: null }
  },

  async cerrarSesion() {
    await supabase.auth.signOut()
    set({ cliente: null })
  }
}))
