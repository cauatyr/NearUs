'use client'
import { create } from 'zustand'
import { supabase } from './supabase'
import { puede, TODOS_LOS_PERMISOS } from './permisos'

// Sesión de ADMIN interno (equipo NearUs).
//
// No hay pantalla de registro ni link en el app: la cuenta se crea a mano y el
// permiso vive en la tabla `admins`, que tiene RLS sin ninguna policy de
// escritura (ver supabase/admin.sql). Por eso nadie puede auto-promoverse.
//
// Este store es sólo la capa de UX. La barrera real está en el servidor:
// cada ruta /api/admin/* revalida el token contra `admins` con la service_role.
export const useAdmin = create((set, get) => ({
  esAdmin: null, // null = todavía no sabemos · true/false = resuelto
  email: null,
  nombre: null,
  permisos: [],
  verificando: false,

  // Atajo para la UI. El servidor revalida igual en cada ruta /api/admin/*.
  puede(permiso) {
    return puede(get().permisos, permiso)
  },

  // Pregunta "¿la sesión actual es admin?". La policy de select sólo devuelve
  // la fila propia, así que esto no filtra la lista de admins a nadie.
  async verificar() {
    if (get().verificando) return get().esAdmin
    set({ verificando: true })

    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user) {
      set({ esAdmin: false, email: null, nombre: null, permisos: [], verificando: false })
      return false
    }

    // select('*') a propósito: si todavía no corrieron admin-permisos.sql, pedir
    // la columna `permisos` por nombre devuelve ERROR y dejaría al admin
    // afuera de su propio panel. Con '*' simplemente no viene ese campo.
    const { data: fila } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const ok = !!fila
    set({
      esAdmin: ok,
      email: ok ? user.email : null,
      nombre: ok ? fila.nombre : null,
      // Si la migración de permisos todavía no corrió, `permisos` viene
      // undefined: se asume acceso total para no dejar al admin afuera de su
      // propio panel.
      permisos: ok ? fila.permisos ?? TODOS_LOS_PERMISOS : [],
      verificando: false
    })
    return ok
  },

  async iniciarSesion(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const ok = await get().verificar()
    if (!ok) {
      // Cuenta válida pero sin permiso de admin (ej: dueño de un negocio).
      await supabase.auth.signOut()
      set({ esAdmin: false, email: null, nombre: null, permisos: [] })
      return { error: 'Esta cuenta no tiene acceso de administrador.' }
    }
    return { error: null }
  },

  async cerrarSesion() {
    await supabase.auth.signOut()
    set({ esAdmin: false, email: null, nombre: null, permisos: [] })
  }
}))

// fetch a /api/admin/* con el token de la sesión en el header.
// Devuelve { datos, error } — nunca tira.
export async function fetchAdmin(url, opciones = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { datos: null, error: 'Sesión expirada. Volvé a entrar.' }

  try {
    const res = await fetch(url, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opciones.headers || {})
      }
    })
    const cuerpo = await res.json().catch(() => ({}))
    if (!res.ok) return { datos: null, error: cuerpo.error || `Error ${res.status}` }
    return { datos: cuerpo, error: null }
  } catch (e) {
    return { datos: null, error: e.message ?? String(e) }
  }
}
