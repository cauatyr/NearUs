import { verificarAdmin, errorJson } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/resumen
// Lo que la anon key NO puede ver: las cuentas de auth (emails, alta, último
// acceso). El panel lo cruza con negocios (dueños) y reservas (clientes).
export async function GET(request) {
  const { error, status, admin } = await verificarAdmin(request)
  if (error) return errorJson(error, status)

  const usuarios = []
  const porPagina = 1000
  let pagina = 1

  // listUsers pagina; con el volumen actual una vuelta alcanza, pero dejamos el
  // loop para cuando crezca.
  while (pagina < 20) {
    const { data, error: errLista } = await admin.auth.admin.listUsers({ page: pagina, perPage: porPagina })
    if (errLista) return errorJson(errLista.message, 500)
    const lote = data?.users ?? []
    lote.forEach((u) => {
      usuarios.push({
        id: u.id,
        email: u.email,
        creadoEn: u.created_at,
        ultimoAcceso: u.last_sign_in_at,
        nombre: u.user_metadata?.nombre || null,
        celular: u.user_metadata?.celular || null
      })
    })
    if (lote.length < porPagina) break
    pagina += 1
  }

  return Response.json({ usuarios })
}
