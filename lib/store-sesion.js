'use client'
import { create } from 'zustand'
import { supabase } from './supabase'

const LS_KEY = 'nearus.modo_demo_id'
// Marca que el negocio abierto lo está gestionando un ADMIN de NearUs, no su
// dueño. Vive aparte de LS_KEY para que el panel pueda mostrar la barra de
// "volver a administración" sin confundirse con el viejo modo demo.
const LS_GESTION = 'nearus.gestion_admin'

export const useSesion = create((set, get) => ({
  user: null,           // user de supabase auth (null si modo demo)
  negocioId: null,      // id del negocio actual (del owner o del demo)
  modoDemo: false,
  gestionAdmin: false,  // true = un admin entró a gestionar este negocio
  saliendo: false,      // true mientras se suelta el negocio y se vuelve a /admin
  inicializado: false,

  // Llamado en el boot del app — resuelve si hay session activa o modo demo guardado
  async inicializar() {
    if (get().inicializado) return
    const demo = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null
    if (demo) {
      const gestion = localStorage.getItem(LS_GESTION) === '1'
      set({ negocioId: demo, modoDemo: true, gestionAdmin: gestion, inicializado: true })
      return
    }
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      await get().hidratarUser(data.session.user)
    } else {
      set({ inicializado: true })
    }

    // Subscribe a cambios de auth (sign in/out en otra pestaña, expiración)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        get().hidratarUser(session.user)
      } else if (!get().modoDemo) {
        set({ user: null, negocioId: null })
      }
    })
  },

  // Busca el negocio que pertenece al user logado y lo guarda en el estado
  async hidratarUser(user) {
    if (!user) {
      set({ user: null, negocioId: null, modoDemo: false, inicializado: true })
      return
    }
    const { data } = await supabase
      .from('negocios')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    set({ user, negocioId: data?.id || null, modoDemo: false, inicializado: true })
  },

  async iniciarSesion(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    await get().hidratarUser(data.user)
    return { error: null }
  },

  // Crea cuenta nueva y la asocia como dueña de un negocio existente (sin dueño).
  // Sirve para negocios creados antes del sistema de auth (ej: grigus).
  async crearCuentaYReivindicar(email, password, negocioId) {
    const { data: sup, error: errSup } = await supabase.auth.signUp({ email, password })
    if (errSup) return { error: errSup.message }
    const userId = sup.user?.id
    if (!userId) return { error: 'No se pudo crear la cuenta.' }

    // Si email confirmation está habilitado no hay session — forzamos signIn
    if (!sup.session) {
      const { error: errSi } = await supabase.auth.signInWithPassword({ email, password })
      if (errSi) return { error: 'Cuenta creada, pero no pudimos iniciar sesión: ' + errSi.message }
    }

    // Asociar negocio al user
    const { error: errUpd } = await supabase
      .from('negocios')
      .update({ owner_user_id: userId })
      .eq('id', negocioId)
      .is('owner_user_id', null)
    if (errUpd) return { error: 'Cuenta creada, pero no pudimos asignarla al negocio: ' + errUpd.message }

    await get().hidratarUser({ id: userId, email })
    return { error: null }
  },

  // Abre el panel de un negocio sin ser su dueño. Antes era el "modo demo"
  // público del /login — lo sacamos de ahí porque dejaba entrar a cualquiera al
  // panel de un negocio REAL (agenda, nombres y celulares de sus clientes).
  // Hoy sólo lo usa el admin desde /admin.
  //
  // La sesión de Supabase del admin NO se toca: esto es sólo localStorage, así
  // que volver a /admin es instantáneo y sigue autenticado.
  entrarComoNegocio(id) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_KEY, id)
      localStorage.setItem(LS_GESTION, '1')
    }
    set({ negocioId: id, modoDemo: true, gestionAdmin: true, inicializado: true })
  },

  // Sale de la gestión y devuelve el control a la sesión real (la del admin).
  //
  // `saliendo` existe por una carrera: al soltar el negocio, negocioId queda en
  // null mientras el navegador todavía está en /negocio/*, y el guard de ese
  // layout mandaría a /login antes de que se complete la vuelta a /admin.
  async salirDeGestion() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_GESTION)
    }
    set({ negocioId: null, modoDemo: false, gestionAdmin: false, saliendo: true })
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) await get().hidratarUser(data.session.user)
    set({ saliendo: false })
  },

  async cerrarSesion() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_GESTION)
    }
    await supabase.auth.signOut()
    set({ user: null, negocioId: null, modoDemo: false, gestionAdmin: false })
  }
}))
