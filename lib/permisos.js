// Catálogo de permisos del panel de administración.
//
// La lista de permisos de cada admin vive en `admins.permisos` (text[]) y se
// edita desde /admin/equipo. El servidor la revalida en cada ruta
// /api/admin/* — el ocultar botones en la UI es comodidad, no seguridad.
//
// ⚠️ Excepción honesta: 'finanzas.ver' y 'clientes.ver' esconden datos en la
// interfaz, pero hoy la tabla `reservas` es de lectura pública con la anon key
// (el app del cliente la necesita así). O sea: alguien con acceso de admin y
// ganas de mirar la DB igual podría ver los montos. Los permisos de escritura
// (crear / editar / eliminar) sí son una barrera real, del lado del servidor.

export const PERMISOS = [
  {
    grupo: 'Negocios',
    items: [
      { id: 'negocios.ver', label: 'Ver negocios', desc: 'Lista y ficha de cada negocio' },
      { id: 'negocios.crear', label: 'Crear negocios', desc: 'Dar de alta un negocio nuevo' },
      { id: 'negocios.editar', label: 'Editar negocios', desc: 'Destacado, acepta ahora, datos de la ficha' },
      { id: 'negocios.eliminar', label: 'Eliminar negocios', desc: 'Borra el negocio y todo lo que cuelga de él' },
      { id: 'negocios.gestionar', label: 'Entrar al panel del negocio', desc: 'Operar la agenda, servicios y equipo de un negocio' }
    ]
  },
  {
    grupo: 'Datos sensibles',
    items: [
      { id: 'finanzas.ver', label: 'Ver facturación', desc: 'Volumen, comisiones e ingresos por negocio' },
      { id: 'clientes.ver', label: 'Ver clientes', desc: 'Cuentas de clientes, emails y celulares' }
    ]
  },
  {
    grupo: 'Equipo',
    items: [
      { id: 'admins.gestionar', label: 'Administrar el equipo', desc: 'Crear admins y cambiar sus permisos' }
    ]
  }
]

export const TODOS_LOS_PERMISOS = PERMISOS.flatMap((g) => g.items.map((i) => i.id))

export function etiquetaPermiso(id) {
  for (const g of PERMISOS) {
    const i = g.items.find((x) => x.id === id)
    if (i) return i.label
  }
  return id
}

// Atajos para no tildar de a uno. El guardado siempre es la lista de permisos:
// los presets sólo rellenan los casilleros.
export const PRESETS = [
  {
    id: 'total',
    nombre: 'Acceso total',
    desc: 'Puede hacer todo, incluido administrar el equipo.',
    permisos: TODOS_LOS_PERMISOS
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones',
    desc: 'Todo menos crear y eliminar negocios.',
    permisos: ['negocios.ver', 'negocios.editar', 'negocios.gestionar', 'finanzas.ver', 'clientes.ver']
  },
  {
    id: 'soporte',
    nombre: 'Soporte',
    desc: 'Atiende negocios y clientes, sin ver facturación.',
    permisos: ['negocios.ver', 'negocios.gestionar', 'clientes.ver']
  },
  {
    id: 'lectura',
    nombre: 'Sólo lectura',
    desc: 'Ve los negocios, sin facturación ni datos de clientes.',
    permisos: ['negocios.ver']
  }
]

// ¿La lista de permisos coincide exactamente con un preset?
export function presetDe(permisos) {
  const orden = (a) => [...a].sort().join('|')
  const clave = orden(permisos || [])
  return PRESETS.find((p) => orden(p.permisos) === clave) || null
}

export function puede(permisos, permiso) {
  return Array.isArray(permisos) && permisos.includes(permiso)
}
