import { verificarAdmin, errorJson } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// Campos editables desde administración. Incluye los que el panel del dueño no
// deja tocar (logo, destacado, lat/lng, rating).
const CAMPOS = {
  nombre: 'nombre',
  categoria: 'categoria',
  descripcion: 'descripcion',
  direccion: 'direccion',
  barrio: 'barrio',
  telefono: 'telefono',
  lat: 'lat',
  lng: 'lng',
  horario: 'horario',
  horarioSemanal: 'horario_semanal',
  imagen: 'imagen',
  portada: 'portada',
  logo: 'logo',
  galeria: 'galeria',
  aceptaAhora: 'acepta_ahora',
  destacado: 'destacado',
  ownerUserId: 'owner_user_id'
}

// PATCH /api/admin/negocios/<id>
export async function PATCH(request, { params }) {
  const { error, status, admin } = await verificarAdmin(request, 'negocios.editar')
  if (error) return errorJson(error, status)

  let body
  try {
    body = await request.json()
  } catch {
    return errorJson('Cuerpo inválido.', 400)
  }

  const payload = {}
  Object.entries(CAMPOS).forEach(([campo, columna]) => {
    if (body[campo] !== undefined) payload[columna] = body[campo]
  })

  if (Object.keys(payload).length === 0) return errorJson('Nada para actualizar.', 400)

  const { data, error: errUpd } = await admin
    .from('negocios')
    .update(payload)
    .eq('id', params.id)
    .select()
    .single()

  if (errUpd) return errorJson(errUpd.message, 400)
  return Response.json({ negocio: data })
}

// DELETE /api/admin/negocios/<id>?cuenta=1
//
// servicios, empleados, reservas y resenas tienen FK con ON DELETE CASCADE
// contra negocios, así que se van solos. Acá los contamos antes para devolver
// al panel qué se llevó por delante.
// ?cuenta=1 además borra la cuenta de auth del dueño (sólo si no es dueño de
// otro negocio).
export async function DELETE(request, { params }) {
  const { error, status, admin } = await verificarAdmin(request, 'negocios.eliminar')
  if (error) return errorJson(error, status)

  const id = params.id
  const borrarCuenta = new URL(request.url).searchParams.get('cuenta') === '1'

  const { data: negocio, error: errGet } = await admin
    .from('negocios')
    .select('id, nombre, owner_user_id')
    .eq('id', id)
    .maybeSingle()

  if (errGet) return errorJson(errGet.message, 500)
  if (!negocio) return errorJson('Ese negocio ya no existe.', 404)

  const contar = async (tabla) => {
    const { count } = await admin
      .from(tabla)
      .select('id', { count: 'exact', head: true })
      .eq('negocio_id', id)
    return count ?? 0
  }

  const borrado = {
    servicios: await contar('servicios'),
    empleados: await contar('empleados'),
    reservas: await contar('reservas'),
    resenas: await contar('resenas').catch(() => 0)
  }

  const { error: errDel } = await admin.from('negocios').delete().eq('id', id)
  if (errDel) return errorJson(errDel.message, 400)

  let cuentaBorrada = false
  let avisoCuenta = null
  if (borrarCuenta && negocio.owner_user_id) {
    const { count } = await admin
      .from('negocios')
      .select('id', { count: 'exact', head: true })
      .eq('owner_user_id', negocio.owner_user_id)

    if ((count ?? 0) > 0) {
      avisoCuenta = 'La cuenta del dueño se mantuvo: sigue siendo dueña de otro negocio.'
    } else {
      const { error: errUser } = await admin.auth.admin.deleteUser(negocio.owner_user_id)
      if (errUser) avisoCuenta = `No se pudo borrar la cuenta: ${errUser.message}`
      else cuentaBorrada = true
    }
  }

  return Response.json({ ok: true, nombre: negocio.nombre, borrado, cuentaBorrada, avisoCuenta })
}
