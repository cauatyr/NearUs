// Imágenes default por categoría (cuando el negocio recién creado no sube foto).
// Vive fuera de store-datos.js porque también lo usa la ruta de servidor que
// crea negocios desde el panel de administración (app/api/admin/negocios).
export const IMAGEN_DEFAULT = {
  cabello:    { imagen: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',  portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200' },
  barberia:   { imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',  portada: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200' },
  unas:       { imagen: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',  portada: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200' },
  estetica:   { imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',  portada: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200' },
  spa:        { imagen: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',    portada: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200' },
  depilacion: { imagen: 'https://images.unsplash.com/photo-1614859275398-8e1f7b8b0f4a?w=800',  portada: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200' },
  maquillaje: { imagen: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',  portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200' },
  masajes:    { imagen: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',  portada: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200' }
}
