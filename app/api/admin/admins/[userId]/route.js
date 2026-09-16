import { verificarAdmin, errorJson } from '@/lib/supabase-admin'
import { TODOS_LOS_PERMISOS } from '@/lib/permisos'

export const dynamic = 'force-dynamic'

function limpiarPermisos(lista) {
  if (!Array.isArray(lista)) return []
  return [...new Set(lista.filter((p) => TODOS_LOS_PERMISOS.includes(p)))]
}

// ¿Quedaría alguien más que pueda administrar el equipo?
// Sin esto, sacarse a uno mismo 'admins.gestionar' (o borrarse) deja el panel
// sin nadie que pueda dar permisos, y la única salida sería el SQL editor.
async function quedaOtroGestor(admin, userIdExcluido) {
  const { data } = await admin.from('admins').select('user_id, permisos')
  return (data ?? []).some(
    (f) => f.user_id !== userIdExcluido && (f.permisos ?? TODOS_LOS_PERMISOS).includes('admins.gestionar')
  )
}

// PATCH /api/admin/admins/<userId> — cambia nombre, permisos o contraseña.
export async function PATCH(request, { params }) {
  const { error, status, admin } = await verificarAdmin(request, 'admins.gestionar')
  if (error) return errorJson(error, status)

  let body
  try {
    body = await request.json()
  } catch {
    return errorJson('Cuerpo inválido.', 400)
  }

  const payload = {}
  if (body.nombre !== undefined) payload.nombre = (body.nombre || '').trim() || null

  if (body.permisos !== undefined) {
    const permisos = limpiarPermisos(body.permisos)
    if (permisos.length === 0) return errorJson('Tiene que quedar al menos un permiso.', 400)

    if (!permisos.includes('admins.gestionar') && !(await quedaOtroGestor(admin, params.userId))) {
      return errorJson(
        'No podés quitar ese permiso: quedaría nadie capaz de administrar el equipo.',
        400
      )
    }
    payload.permisos = permisos
  }

  if (body.password) {
    if (String(body.password).length < 6) {
      return errorJson('La contraseña debe tener al menos 6 caracteres.', 400)
    }
    const { error: errPass } = await admin.auth.admin.updateUserById(params.userId, {
      password: body.password
    })
    if (errPass) return errorJson(errPass.message, 400)
  }

  if (Object.keys(payload).length === 0) {
    return Response.json({ ok: true })
  }

  const { data, error: errUpd } = await admin
    .from('admins')
    .update(payload)
    .eq('user_id', params.userId)
    .select()
    .single()

  if (errUpd) return errorJson(errUpd.message, 400)

  return Response.json({
    admin: {
      userId: data.user_id,
      email: data.email,
      nombre: data.nombre,
      permisos: data.permisos ?? TODOS_LOS_PERMISOS,
      creadoEn: data.creado_en
    }
  })
}

// DELETE /api/admin/admins/<userId>?cuenta=1
// Saca a alguien del equipo. Con ?cuenta=1 borra también su cuenta de acceso.
export async function DELETE(request, { params }) {
  const { error, status, admin, user } = await verificarAdmin(request, 'admins.gestionar')
  if (error) return errorJson(error, status)

  if (user.id === params.userId) {
    return errorJson('No podés sacarte a vos mismo del equipo.', 400)
  }
  if (!(await quedaOtroGestor(admin, params.userId))) {
    return errorJson('No se puede: quedaría nadie capaz de administrar el equipo.', 400)
  }

  const borrarCuenta = new URL(request.url).searchParams.get('cuenta') === '1'

  const { error: errDel } = await admin.from('admins').delete().eq('user_id', params.userId)
  if (errDel) return errorJson(errDel.message, 400)

  let cuentaBorrada = false
  let avisoCuenta = null
  if (borrarCuenta) {
    // Si esa persona además es dueña de un negocio, la cuenta se queda: borrarla
    // dejaría el negocio sin acceso.
    const { count } = await admin
      .from('negocios')
      .select('id', { count: 'exact', head: true })
      .eq('owner_user_id', params.userId)

    if ((count ?? 0) > 0) {
      avisoCuenta = 'La cuenta se mantuvo: también es dueña de un negocio.'
    } else {
      const { error: errUser } = await admin.auth.admin.deleteUser(params.userId)
      if (errUser) avisoCuenta = `No se pudo borrar la cuenta: ${errUser.message}`
      else cuentaBorrada = true
    }
  }

  return Response.json({ ok: true, cuentaBorrada, avisoCuenta })
}
