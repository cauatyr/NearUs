import { createClient } from '@supabase/supabase-js'
import { TODOS_LOS_PERMISOS, etiquetaPermiso } from '@/lib/permisos'

// Cliente Supabase con service_role — SOLO para el servidor (route handlers).
//
// La key vive en SUPABASE_SERVICE_ROLE_KEY, SIN el prefijo NEXT_PUBLIC_, así
// que Next nunca la inyecta en el bundle del navegador. El chequeo de `window`
// es un cinturón extra por si algún día alguien importa este archivo desde un
// componente 'use client'.
//
// La service_role ignora RLS: todo lo que pasa por acá tiene que validar
// primero que quien llama es admin (ver `verificarAdmin`).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL

export function supabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin() solo puede usarse en el servidor.')
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Local: .env.development.local · Producción: variables de entorno de Vercel.'
    )
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Valida que el request venga de un admin de verdad, y (si se pide) que ese
// admin tenga el permiso necesario para lo que va a hacer.
//
// El guard del front (app/admin/layout.jsx) es solo UX: cualquiera puede armar
// un fetch a mano. Ésta es la barrera real, y toda ruta /api/admin/* la usa.
//
// Devuelve { user, admin, permisos } si pasa, o { error, status } si no.
export async function verificarAdmin(request, permisoRequerido = null) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : null
  if (!token) return { error: 'Falta el token de sesión.', status: 401 }

  // Sin la service_role no hay forma de validar nada: es un error de
  // configuración del servidor, no del usuario — y se responde como tal, no con
  // un 500 pelado.
  let admin
  try {
    admin = supabaseAdmin()
  } catch (e) {
    return { error: e.message, status: 500 }
  }

  const { data: userData, error: errUser } = await admin.auth.getUser(token)
  if (errUser || !userData?.user) return { error: 'Sesión inválida o expirada.', status: 401 }

  // select('*'): ver la nota en lib/store-admin.js — nombrar `permisos` antes de
  // correr la migración devuelve error y bloquearía todas las rutas de admin.
  const { data: fila, error: errAdmin } = await admin
    .from('admins')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (errAdmin) return { error: errAdmin.message, status: 500 }
  if (!fila) return { error: 'Esta cuenta no tiene acceso de administrador.', status: 403 }

  // Si todavía no corrieron supabase/admin-permisos.sql, la columna no existe:
  // se asume acceso total, que es como funcionaba antes de los permisos.
  const permisos = fila.permisos ?? TODOS_LOS_PERMISOS

  if (permisoRequerido && !permisos.includes(permisoRequerido)) {
    return {
      error: `Tu cuenta no tiene el permiso "${etiquetaPermiso(permisoRequerido)}".`,
      status: 403
    }
  }

  return { user: userData.user, admin, permisos }
}

// Helper para responder errores con el mismo formato en todas las rutas.
export function errorJson(mensaje, status) {
  return Response.json({ error: mensaje }, { status })
}
