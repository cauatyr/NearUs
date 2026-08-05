'use client'
import { create } from 'zustand'
import { supabase } from './supabase'

// Mappers: snake_case (DB) → camelCase (frontend, igual al mock original)
function mapNegocio(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    direccion: row.direccion,
    barrio: row.barrio,
    lat: row.lat,
    lng: row.lng,
    rating: row.rating,
    reviews: row.reviews,
    horario: row.horario,
    imagen: row.imagen,
    portada: row.portada,
    logo: row.logo,
    descripcion: row.descripcion,
    aceptaAhora: row.acepta_ahora,
    telefono: row.telefono,
    destacado: row.destacado,
    ownerUserId: row.owner_user_id,
    horarioSemanal: row.horario_semanal || null,
    galeria: Array.isArray(row.galeria) ? row.galeria : []
  }
}

function mapServicio(row) {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    duracion: row.duracion,
    precio: Number(row.precio),
    categoria: row.categoria,
    foto: row.foto || null
  }
}

function mapEmpleado(row) {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nombre: row.nombre,
    cargo: row.cargo,
    avatar: row.avatar,
    celular: row.celular,
    diasTrabajo: row.dias_trabajo || [],
    foto: row.foto || null
  }
}

function mapReserva(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    negocioId: row.negocio_id,
    servicioId: row.servicio_id,
    empleadoId: row.empleado_id,
    cliente: {
      nombre: row.cliente_nombre,
      celular: row.cliente_celular
    },
    fecha: row.fecha,
    duracion: row.duracion,
    precio: Number(row.precio),
    estado: row.estado,
    metodoPago: row.metodo_pago,
    clienteUserId: row.cliente_user_id || null
  }
}

function mapResena(row) {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    reservaId: row.reserva_id || null,
    clienteUserId: row.cliente_user_id || null,
    clienteNombre: row.cliente_nombre,
    rating: row.rating,
    comentario: row.comentario || '',
    createdAt: row.created_at,
    respuesta: row.respuesta || null,
    respuestaAt: row.respuesta_at || null
  }
}

// Imágenes default por categoría (cuando el negocio recién creado no sube foto)
const IMAGEN_DEFAULT = {
  cabello:    { imagen: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',  portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200' },
  barberia:   { imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',  portada: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200' },
  unas:       { imagen: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',  portada: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200' },
  estetica:   { imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',  portada: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200' },
  spa:        { imagen: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',    portada: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200' },
  depilacion: { imagen: 'https://images.unsplash.com/photo-1614859275398-8e1f7b8b0f4a?w=800',  portada: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200' },
  maquillaje: { imagen: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',  portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200' },
  masajes:    { imagen: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',  portada: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200' }
}

function generarIdNegocio() {
  // ID curto único — formato n-<base36 timestamp>-<random 4 chars>
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// ID curto único con prefijo (servicios: 's', empleados: 'e')
function generarId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// Helpers de upsert sin duplicar (Realtime puede llegar antes/después del insert local)
function upsertPor(id, lista, item) {
  const i = lista.findIndex((x) => x.id === id)
  if (i === -1) return [...lista, item]
  const nuevo = [...lista]
  nuevo[i] = item
  return nuevo
}

function removerPor(id, lista) {
  return lista.filter((x) => x.id !== id)
}

export const useDatosStore = create((set, get) => ({
  negocios: [],
  servicios: [],
  empleados: [],
  reservas: [],
  resenas: [],
  cargado: false,
  cargando: false,
  error: null,
  realtimeActivo: false,

  async cargar() {
    if (get().cargado || get().cargando) return
    set({ cargando: true, error: null })

    try {
      const [neg, ser, emp, res, rev] = await Promise.all([
        supabase.from('negocios').select('*'),
        supabase.from('servicios').select('*'),
        supabase.from('empleados').select('*'),
        supabase.from('reservas').select('*'),
        supabase.from('resenas').select('*')
      ])

      // resenas puede no existir todavía (migración no corrida) → no romper la carga.
      const criticos = [neg, ser, emp, res].find((r) => r.error)
      if (criticos) throw criticos.error

      set({
        negocios: (neg.data ?? []).map(mapNegocio),
        servicios: (ser.data ?? []).map(mapServicio),
        empleados: (emp.data ?? []).map(mapEmpleado),
        reservas: (res.data ?? []).map(mapReserva),
        resenas: (rev.error ? [] : rev.data ?? []).map(mapResena),
        cargado: true,
        cargando: false
      })

      get().iniciarRealtime()
    } catch (e) {
      set({ error: e.message ?? String(e), cargando: false })
    }
  },

  // Inserta un nuevo negocio en Supabase + push local inmediato.
  // Si llegan email/password, primero crea el user en auth y guarda owner_user_id.
  async agregarNegocio({ nombre, categoria, descripcion, direccion, barrio, telefono, lat, lng, horario, horarioSemanal, logo, email, password }) {
    let ownerUserId = null
    if (email && password) {
      const { data: sup, error: errSup } = await supabase.auth.signUp({ email, password })
      if (errSup) {
        // Si el email ya existe, intentamos signin (caso el dueño ya tenía cuenta)
        if (errSup.message && errSup.message.toLowerCase().includes('already')) {
          const { data: si, error: errSi } = await supabase.auth.signInWithPassword({ email, password })
          if (errSi) return { id: null, error: 'Ese email ya existe pero la contraseña no coincide.' }
          ownerUserId = si.user?.id || null
        } else {
          return { id: null, error: errSup.message ?? String(errSup) }
        }
      } else {
        ownerUserId = sup.user?.id || null
        // Si el proyecto requiere confirmación de email, signUp no devuelve session.
        // Intentamos signin igual para ya dejarlo logado en demo.
        if (!sup.session) {
          await supabase.auth.signInWithPassword({ email, password })
        }
      }
    }

    const id = generarIdNegocio()
    const defaults = IMAGEN_DEFAULT[categoria] || IMAGEN_DEFAULT.cabello

    const payload = {
      id,
      nombre,
      categoria,
      descripcion,
      direccion,
      barrio,
      telefono,
      lat,
      lng,
      horario: horario || 'Lun–Sáb · 09:00–19:00',
      horario_semanal: horarioSemanal || null,
      imagen: defaults.imagen,
      portada: defaults.portada,
      logo: logo || null,
      rating: null,
      reviews: 0,
      acepta_ahora: false,
      destacado: false,
      owner_user_id: ownerUserId
    }

    const { data, error } = await supabase
      .from('negocios')
      .insert(payload)
      .select()
      .single()

    if (error) return { id: null, error: error.message ?? String(error) }

    const nuevo = mapNegocio(data)
    set((s) => ({ negocios: upsertPor(nuevo.id, s.negocios, nuevo) }))

    return { id: nuevo.id, error: null, ownerUserId }
  },

  // Actualiza campos editables de un negocio existente (foto, teléfono, horario, etc).
  // La logo NO se edita por aquí — es identidad fija de la marca.
  async actualizarNegocio(id, campos) {
    // Map camelCase frontend → snake_case DB. Sólo campos editables.
    const payload = {}
    if (campos.imagen !== undefined) payload.imagen = campos.imagen
    if (campos.portada !== undefined) payload.portada = campos.portada
    if (campos.telefono !== undefined) payload.telefono = campos.telefono
    if (campos.horario !== undefined) payload.horario = campos.horario
    if (campos.horarioSemanal !== undefined) payload.horario_semanal = campos.horarioSemanal
    if (campos.descripcion !== undefined) payload.descripcion = campos.descripcion
    if (campos.aceptaAhora !== undefined) payload.acepta_ahora = campos.aceptaAhora
    if (campos.galeria !== undefined) payload.galeria = campos.galeria

    if (Object.keys(payload).length === 0) return { error: null }

    const { data, error } = await supabase
      .from('negocios')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message ?? String(error) }

    const actualizado = mapNegocio(data)
    set((s) => ({ negocios: upsertPor(actualizado.id, s.negocios, actualizado) }))
    return { error: null }
  },

  // ===== SERVICIOS =====
  async agregarServicio({ negocioId, nombre, duracion, precio, categoria, foto }) {
    const id = generarId('s')
    const payload = { id, negocio_id: negocioId, nombre, duracion, precio, categoria, foto: foto || null }
    const { data, error } = await supabase.from('servicios').insert(payload).select().single()
    if (error) return { error: error.message ?? String(error) }
    const nuevo = mapServicio(data)
    set((s) => ({ servicios: upsertPor(nuevo.id, s.servicios, nuevo) }))
    return { id: nuevo.id, error: null }
  },

  async actualizarServicio(id, campos) {
    const payload = {}
    if (campos.nombre !== undefined) payload.nombre = campos.nombre
    if (campos.duracion !== undefined) payload.duracion = campos.duracion
    if (campos.precio !== undefined) payload.precio = campos.precio
    if (campos.categoria !== undefined) payload.categoria = campos.categoria
    if (campos.foto !== undefined) payload.foto = campos.foto
    const { data, error } = await supabase.from('servicios').update(payload).eq('id', id).select().single()
    if (error) return { error: error.message ?? String(error) }
    const actualizado = mapServicio(data)
    set((s) => ({ servicios: upsertPor(actualizado.id, s.servicios, actualizado) }))
    return { error: null }
  },

  async eliminarServicio(id) {
    const { error } = await supabase.from('servicios').delete().eq('id', id)
    if (error) return { error: error.message ?? String(error) }
    set((s) => ({ servicios: removerPor(id, s.servicios) }))
    return { error: null }
  },

  // ===== EMPLEADOS =====
  async agregarEmpleado({ negocioId, nombre, cargo, avatar, celular, diasTrabajo, foto }) {
    const id = generarId('e')
    const payload = { id, negocio_id: negocioId, nombre, cargo, avatar, celular, dias_trabajo: diasTrabajo, foto: foto || null }
    const { data, error } = await supabase.from('empleados').insert(payload).select().single()
    if (error) return { error: error.message ?? String(error) }
    const nuevo = mapEmpleado(data)
    set((s) => ({ empleados: upsertPor(nuevo.id, s.empleados, nuevo) }))
    return { id: nuevo.id, error: null }
  },

  async actualizarEmpleado(id, campos) {
    const payload = {}
    if (campos.nombre !== undefined) payload.nombre = campos.nombre
    if (campos.cargo !== undefined) payload.cargo = campos.cargo
    if (campos.avatar !== undefined) payload.avatar = campos.avatar
    if (campos.celular !== undefined) payload.celular = campos.celular
    if (campos.diasTrabajo !== undefined) payload.dias_trabajo = campos.diasTrabajo
    if (campos.foto !== undefined) payload.foto = campos.foto
    const { data, error } = await supabase.from('empleados').update(payload).eq('id', id).select().single()
    if (error) return { error: error.message ?? String(error) }
    const actualizado = mapEmpleado(data)
    set((s) => ({ empleados: upsertPor(actualizado.id, s.empleados, actualizado) }))
    return { error: null }
  },

  async eliminarEmpleado(id) {
    const { error } = await supabase.from('empleados').delete().eq('id', id)
    if (error) return { error: error.message ?? String(error) }
    set((s) => ({ empleados: removerPor(id, s.empleados) }))
    return { error: null }
  },

  // ===== RESERVAS (creadas por el cliente) =====
  // Inserta la reserva en Supabase para que aparezca en la agenda del negocio
  // en cualquier dispositivo/cuenta. r usa el shape del front (camelCase).
  async crearReservaPublica(r) {
    const payload = {
      id: r.id,
      codigo: r.codigo,
      negocio_id: r.negocioId,
      servicio_id: r.servicioId,
      empleado_id: r.empleadoId || null,
      cliente_user_id: r.clienteUserId || null,
      cliente_nombre: r.cliente?.nombre || 'Cliente',
      cliente_celular: r.cliente?.celular || null,
      fecha: r.fecha,
      duracion: r.duracion ?? 30,
      precio: r.precio ?? 0,
      estado: 'confirmada',
      metodo_pago: r.metodoPago || 'local'
    }
    const { data, error } = await supabase.from('reservas').insert(payload).select().single()
    if (error) return { error: error.message ?? String(error) }
    const nueva = mapReserva(data)
    set((s) => ({ reservas: upsertPor(nueva.id, s.reservas, nueva) }))
    return { error: null }
  },

  // Actualiza una reserva existente (estado para check-in/atendido, fecha para reagendar).
  async actualizarReserva(id, campos) {
    const payload = {}
    if (campos.estado !== undefined) payload.estado = campos.estado
    if (campos.fecha !== undefined) payload.fecha = campos.fecha
    if (campos.empleadoId !== undefined) payload.empleado_id = campos.empleadoId
    const { data, error } = await supabase.from('reservas').update(payload).eq('id', id).select().single()
    if (error) return { error: error.message ?? String(error) }
    const actualizada = mapReserva(data)
    set((s) => ({ reservas: upsertPor(actualizada.id, s.reservas, actualizada) }))
    return { error: null }
  },

  // ===== RESEÑAS =====
  // Inserta una reseña. El trigger del DB recalcula rating/reviews del negocio
  // y Realtime empuja el negocio actualizado (rating nuevo) a todos.
  async agregarResena({ negocioId, reservaId, clienteUserId, clienteNombre, rating, comentario }) {
    const id = generarId('r')
    const payload = {
      id,
      negocio_id: negocioId,
      reserva_id: reservaId || null,
      cliente_user_id: clienteUserId || null,
      cliente_nombre: clienteNombre || 'Cliente',
      rating,
      comentario: comentario || null
    }
    const { data, error } = await supabase.from('resenas').insert(payload).select().single()
    if (error) return { error: error.message ?? String(error) }
    const nueva = mapResena(data)
    set((s) => ({ resenas: upsertPor(nueva.id, s.resenas, nueva) }))
    return { error: null }
  },

  // El dueño responde (o edita/borra) una reseña. respuesta vacía = quitar respuesta.
  async responderResena(id, respuesta) {
    const texto = (respuesta || '').trim()
    const payload = {
      respuesta: texto || null,
      respuesta_at: texto ? new Date().toISOString() : null
    }
    const { data, error } = await supabase.from('resenas').update(payload).eq('id', id).select().single()
    if (error) return { error: error.message ?? String(error) }
    const actualizada = mapResena(data)
    set((s) => ({ resenas: upsertPor(actualizada.id, s.resenas, actualizada) }))
    return { error: null }
  },

  iniciarRealtime() {
    if (get().realtimeActivo) return

    const channel = supabase
      .channel('datos-publicos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negocios' }, (payload) => {
        const { eventType, new: nuevo, old: viejo } = payload
        if (eventType === 'DELETE') {
          set((s) => ({ negocios: removerPor(viejo.id, s.negocios) }))
        } else {
          const item = mapNegocio(nuevo)
          set((s) => ({ negocios: upsertPor(item.id, s.negocios, item) }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicios' }, (payload) => {
        const { eventType, new: nuevo, old: viejo } = payload
        if (eventType === 'DELETE') {
          set((s) => ({ servicios: removerPor(viejo.id, s.servicios) }))
        } else {
          const item = mapServicio(nuevo)
          set((s) => ({ servicios: upsertPor(item.id, s.servicios, item) }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'empleados' }, (payload) => {
        const { eventType, new: nuevo, old: viejo } = payload
        if (eventType === 'DELETE') {
          set((s) => ({ empleados: removerPor(viejo.id, s.empleados) }))
        } else {
          const item = mapEmpleado(nuevo)
          set((s) => ({ empleados: upsertPor(item.id, s.empleados, item) }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, (payload) => {
        const { eventType, new: nuevo, old: viejo } = payload
        if (eventType === 'DELETE') {
          set((s) => ({ reservas: removerPor(viejo.id, s.reservas) }))
        } else {
          const item = mapReserva(nuevo)
          set((s) => ({ reservas: upsertPor(item.id, s.reservas, item) }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resenas' }, (payload) => {
        const { eventType, new: nuevo, old: viejo } = payload
        if (eventType === 'DELETE') {
          set((s) => ({ resenas: removerPor(viejo.id, s.resenas) }))
        } else {
          const item = mapResena(nuevo)
          set((s) => ({ resenas: upsertPor(item.id, s.resenas, item) }))
        }
      })
      .subscribe()

    set({ realtimeActivo: true, _channel: channel })
  }
}))
