import { verificarAdmin, errorJson } from '@/lib/supabase-admin'
import { TODOS_LOS_PERMISOS } from '@/lib/permisos'

export const dynamic = 'force-dynamic'

// Sólo se aceptan permisos del catálogo: nadie inventa uno nuevo por el body.
function limpiarPermisos(lista) {
  if (!Array.isArray(lista)) return []
  return [...new Set(lista.filter((p) => TODOS_LOS_PERMISOS.includes(p)))]
}

async function buscarUsuarioPorEmail(admin, email) {
  const objetivo = (email || '').toLowerCase()
  let pagina = 1
  while (pagina < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 })
    if (error) return null
    const u = (data?.users ?? []).find((x) => (x.email || '').toLowerCase() === objetivo)
    if (u) return u
    if ((data?.users ?? []).length < 1000) return null
    pagina += 1
  }
  return null
}

// GET /api/admin/admins — el equipo, con sus permisos y su último acceso.
export async function GET(request) {
  const { error, status, admin } = await verificarAdmin(request, 'admins.gestionar')
  if (error) return errorJson(error, status)

  const { data: filas, error: errLista } = await admin
    .from('admins')
    .select('*')
    .order('creado_en', { ascending: true })

  if (errLista) return errorJson(errLista.message, 500)

  const { data: usuarios } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const porId = new Map((usuarios?.users ?? []).map((u) => [u.id, u]))

  return Response.json({
    admins: (filas ?? []).map((f) => ({
      userId: f.user_id,
      email: f.email || porId.get(f.user_id)?.email || null,
      nombre: f.nombre ?? null,
      permisos: f.permisos ?? TODOS_LOS_PERMISOS,
      creadoEn: f.creado_en,
      ultimoAcceso: porId.get(f.user_id)?.last_sign_in_at || null
    }))
  })
}

// POST /api/admin/admins — suma a alguien al equipo.
// Crea la cuenta de auth (o reutiliza una existente) y la fila en `admins`.
// Como `admins` no tiene policy de escritura, éste es el ÚNICO camino.
export async function POST(request) {
  const { error, status, admin, user: quienCrea } = await verificarAdmin(request, 'admins.gestionar')
  if (error) return errorJson(error, status)

  let body
  try {
    body = await request.json()
  } catch {
    return errorJson('Cuerpo inválido.', 400)
  }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  const nombre = (body.nombre || '').trim() || null
  const permisos = limpiarPermisos(body.permisos)

  if (!email) return errorJson('Falta el email.', 400)
  if (permisos.length === 0) return errorJson('Elegí al menos un permiso.', 400)

  let usuario = await buscarUsuarioPorEmail(admin, email)
  let cuentaCreadaAqui = false

  if (!usuario) {
    if (password.length < 6) return errorJson('La contraseña debe tener al menos 6 caracteres.', 400)
    const { data, error: errCrear } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (errCrear) return errorJson(errCrear.message, 400)
    usuario = data.user
    cuentaCreadaAqui = true
  } else if (password) {
    // Cuenta existente + contraseña nueva: se la reseteamos para poder
    // entregársela a esa persona.
    if (password.length < 6) return errorJson('La contraseña debe tener al menos 6 caracteres.', 400)
    await admin.auth.admin.updateUserById(usuario.id, { password })
  }

  const { data: fila, error: errIns } = await admin
    .from('admins')
    .upsert(
      {
        user_id: usuario.id,
        email,
        nombre,
        permisos,
        creado_por: quienCrea?.id ?? null
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (errIns) {
    if (cuentaCreadaAqui) {
      try {
        await admin.auth.admin.deleteUser(usuario.id)
      } catch {}
    }
    return errorJson(errIns.message, 400)
  }

  return Response.json({
    admin: {
      userId: fila.user_id,
      email: fila.email,
      nombre: fila.nombre,
      permisos: fila.permisos,
      creadoEn: fila.creado_en,
      ultimoAcceso: null
    },
    cuentaCreada: cuentaCreadaAqui
  })
}
