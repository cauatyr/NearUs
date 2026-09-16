import { verificarAdmin, errorJson } from '@/lib/supabase-admin'
import { IMAGEN_DEFAULT } from '@/lib/data/imagenes-default'

export const dynamic = 'force-dynamic'

function generarIdNegocio() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// Busca una cuenta por email entre las existentes (el SDK no tiene getByEmail).
async function buscarUsuarioPorEmail(admin, email) {
  const objetivo = email.toLowerCase()
  let pagina = 1
  while (pagina < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 })
    if (error) return null
    const encontrado = (data?.users ?? []).find((u) => (u.email || '').toLowerCase() === objetivo)
    if (encontrado) return encontrado
    if ((data?.users ?? []).length < 1000) return null
    pagina += 1
  }
  return null
}

// POST /api/admin/negocios — crea un negocio (y, opcional, la cuenta del dueño).
//
// Se hace en el servidor a propósito: crear la cuenta desde el navegador con
// supabase.auth.signUp REEMPLAZA la sesión activa, o sea que el admin quedaría
// deslogueado y logueado como el dueño nuevo. Con service_role (createUser) la
// sesión del admin no se toca.
export async function POST(request) {
  const { error, status, admin } = await verificarAdmin(request, 'negocios.crear')
  if (error) return errorJson(error, status)

  let body
  try {
    body = await request.json()
  } catch {
    return errorJson('Cuerpo inválido.', 400)
  }

  const {
    nombre, categoria, descripcion, direccion, barrio, telefono,
    lat, lng, horario, horarioSemanal, logo, imagen, portada,
    aceptaAhora, destacado, email, password
  } = body

  if (!nombre || !categoria) return errorJson('Falta el nombre o la categoría.', 400)
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return errorJson('Falta la ubicación en el mapa.', 400)
  }

  // 1) Cuenta del dueño (opcional). Si el email ya existe, se reutiliza.
  let ownerUserId = null
  let cuentaCreadaAqui = false
  if (email && password) {
    if (String(password).length < 6) return errorJson('La contraseña debe tener al menos 6 caracteres.', 400)

    const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (errCrear) {
      const yaExiste = (errCrear.message || '').toLowerCase().includes('already')
      if (!yaExiste) return errorJson(errCrear.message, 400)
      const existente = await buscarUsuarioPorEmail(admin, email)
      if (!existente) return errorJson('Ese email ya existe pero no pudimos encontrarlo.', 400)
      ownerUserId = existente.id
    } else {
      ownerUserId = creado.user?.id ?? null
      cuentaCreadaAqui = true
    }
  }

  // 2) El negocio
  const defaults = IMAGEN_DEFAULT[categoria] || IMAGEN_DEFAULT.cabello
  const id = generarIdNegocio()

  const payload = {
    id,
    nombre,
    categoria,
    descripcion: descripcion || null,
    direccion: direccion || null,
    barrio: barrio || null,
    telefono: telefono || null,
    lat,
    lng,
    horario: horario || 'Lun–Sáb · 09:00–19:00',
    horario_semanal: horarioSemanal || null,
    imagen: imagen || defaults.imagen,
    portada: portada || defaults.portada,
    logo: logo || null,
    rating: null,
    reviews: 0,
    acepta_ahora: !!aceptaAhora,
    destacado: !!destacado,
    owner_user_id: ownerUserId
  }

  const { data, error: errInsert } = await admin.from('negocios').insert(payload).select().single()

  if (errInsert) {
    // Si el negocio no entró pero la cuenta la creamos acá, la sacamos para no
    // dejar cuentas huérfanas dando vueltas. Una cuenta que ya existía no se
    // toca: es de otra persona.
    if (ownerUserId && cuentaCreadaAqui) {
      try {
        await admin.auth.admin.deleteUser(ownerUserId)
      } catch {}
    }
    return errorJson(errInsert.message, 400)
  }

  return Response.json({ negocio: data, ownerUserId })
}
