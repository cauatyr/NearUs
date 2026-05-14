// Datos seed — 20 negocios reales-inspirados de Cuenca, Ecuador
// Coordenadas alrededor del centro de Cuenca (-2.9001, -79.0059)

export const CIUDAD = {
  nombre: 'Cuenca',
  pais: 'Ecuador',
  centro: { lat: -2.9001, lng: -79.0059 },
  zoom: 14
}

export const NEGOCIOS = [
  {
    id: 'n1',
    nombre: 'Estilo Andino — Salón & Spa',
    categoria: 'cabello',
    direccion: 'Av. Solano 4-23 y Florencia Astudillo',
    barrio: 'El Ejido',
    lat: -2.9098, lng: -79.0107,
    rating: 4.8, reviews: 124,
    horario: 'Lun–Sáb · 09:00–19:00',
    imagen: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    descripcion: 'Salón boutique especializado en color y cortes contemporáneos. Productos veganos.',
    aceptaAhora: true,
    telefono: '+593 99 123 4567'
  },
  {
    id: 'n2',
    nombre: 'Don Carlos Barbería Clásica',
    categoria: 'barberia',
    direccion: 'Calle Larga 7-65 y Luis Cordero',
    barrio: 'Centro Histórico',
    lat: -2.9023, lng: -79.0038,
    rating: 4.9, reviews: 287,
    horario: 'Lun–Sáb · 08:00–20:00',
    imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    portada: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200',
    descripcion: 'Barbería tradicional con más de 20 años en el centro histórico. Afeitado clásico con navaja.',
    aceptaAhora: true,
    telefono: '+593 98 765 4321'
  },
  {
    id: 'n3',
    nombre: 'Nails Studio Cuenca',
    categoria: 'unas',
    direccion: 'Av. Remigio Crespo Toral 1-128',
    barrio: 'El Vergel',
    lat: -2.9151, lng: -79.0078,
    rating: 4.7, reviews: 198,
    horario: 'Mar–Dom · 10:00–19:00',
    imagen: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
    portada: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200',
    descripcion: 'Diseño de uñas semipermanentes, acrílico, gel y nail art personalizado.',
    aceptaAhora: false,
    telefono: '+593 99 222 1133'
  },
  {
    id: 'n4',
    nombre: 'Aura Estética Avanzada',
    categoria: 'estetica',
    direccion: 'Av. Ordóñez Lasso 4-50',
    barrio: 'Cañaribamba',
    lat: -2.8895, lng: -79.0210,
    rating: 4.6, reviews: 89,
    horario: 'Lun–Sáb · 09:30–18:30',
    imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    portada: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200',
    descripcion: 'Tratamientos faciales, limpieza profunda, hidrafacial y radiofrecuencia.',
    aceptaAhora: false,
    telefono: '+593 97 444 5566'
  },
  {
    id: 'n5',
    nombre: 'Serenity Spa Urbano',
    categoria: 'spa',
    direccion: 'Calle del Batán 2-45',
    barrio: 'El Batán',
    lat: -2.9050, lng: -79.0250,
    rating: 4.9, reviews: 156,
    horario: 'Todos los días · 10:00–21:00',
    imagen: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    portada: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    descripcion: 'Spa urbano con sauna, jacuzzi, masajes terapéuticos y ritual de aromaterapia.',
    aceptaAhora: false,
    telefono: '+593 96 777 8899'
  },
  {
    id: 'n6',
    nombre: 'Glow Depilación Láser',
    categoria: 'depilacion',
    direccion: 'Av. Loja 2-110 y Av. de las Américas',
    barrio: 'Yanuncay',
    lat: -2.9120, lng: -79.0190,
    rating: 4.7, reviews: 142,
    horario: 'Lun–Sáb · 09:00–19:00',
    imagen: 'https://images.unsplash.com/photo-1614859275398-8e1f7b8b0f4a?w=800',
    portada: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    descripcion: 'Depilación láser diodo de última generación. Tarifas accesibles, paquetes corporales.',
    aceptaAhora: false,
    telefono: '+593 99 333 2211'
  },
  {
    id: 'n7',
    nombre: 'María Eugenia Makeup',
    categoria: 'maquillaje',
    direccion: 'Mariscal Lamar 12-34 y Estévez de Toral',
    barrio: 'Centro Histórico',
    lat: -2.8961, lng: -79.0061,
    rating: 5.0, reviews: 76,
    horario: 'Cita previa · 08:00–20:00',
    imagen: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
    portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    descripcion: 'Maquillaje profesional para novias, eventos y producción fotográfica.',
    aceptaAhora: false,
    telefono: '+593 98 111 2233'
  },
  {
    id: 'n8',
    nombre: 'Manos Sanadoras Masajes',
    categoria: 'masajes',
    direccion: 'Av. Huayna Cápac 2-30',
    barrio: 'Totoracocha',
    lat: -2.8920, lng: -78.9760,
    rating: 4.8, reviews: 92,
    horario: 'Lun–Dom · 10:00–20:00',
    imagen: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    portada: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200',
    descripcion: 'Masaje terapéutico, descontracturante, piedras calientes y reflexología.',
    aceptaAhora: true,
    telefono: '+593 99 887 6655'
  },
  {
    id: 'n9',
    nombre: 'Rebel Cuts Barbershop',
    categoria: 'barberia',
    direccion: 'Av. de las Américas 8-12',
    barrio: 'Misicata',
    lat: -2.9180, lng: -79.0290,
    rating: 4.6, reviews: 213,
    horario: 'Mar–Dom · 10:00–21:00',
    imagen: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800',
    portada: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
    descripcion: 'Barbería urbana, fades, diseños, beard styling. Reserva online sin filas.',
    aceptaAhora: true,
    telefono: '+593 97 555 4422'
  },
  {
    id: 'n10',
    nombre: 'Coral Beauty Bar',
    categoria: 'unas',
    direccion: 'Gran Colombia 11-40 y Tarqui',
    barrio: 'Centro Histórico',
    lat: -2.8973, lng: -79.0072,
    rating: 4.5, reviews: 67,
    horario: 'Lun–Sáb · 09:00–18:00',
    imagen: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800',
    portada: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200',
    descripcion: 'Manicure, pedicure spa, esmaltado tradicional y semipermanente.',
    aceptaAhora: false,
    telefono: '+593 99 654 3210'
  },
  {
    id: 'n11',
    nombre: 'Belleza Integral Karina',
    categoria: 'estetica',
    direccion: 'Av. González Suárez 3-78',
    barrio: 'El Vergel',
    lat: -2.9197, lng: -78.9892,
    rating: 4.4, reviews: 54,
    horario: 'Lun–Vie · 09:00–18:00',
    imagen: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    portada: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
    descripcion: 'Tratamientos corporales, drenaje linfático, presoterapia y cavitación.',
    aceptaAhora: false,
    telefono: '+593 98 234 5678'
  },
  {
    id: 'n12',
    nombre: 'Zen Garden Spa',
    categoria: 'spa',
    direccion: 'Vía a Misicata 5-200',
    barrio: 'Misicata',
    lat: -2.9220, lng: -79.0310,
    rating: 4.7, reviews: 103,
    horario: 'Todos los días · 11:00–22:00',
    imagen: 'https://images.unsplash.com/photo-1531112685364-fe8c4ec40c83?w=800',
    portada: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
    descripcion: 'Spa de inspiración asiática, masaje thai, shiatsu y ceremonia del té.',
    aceptaAhora: false,
    telefono: '+593 96 432 1098'
  },
  {
    id: 'n13',
    nombre: 'Hair Lab — Color Experts',
    categoria: 'cabello',
    direccion: 'Av. Solano 6-12',
    barrio: 'El Ejido',
    lat: -2.9120, lng: -79.0115,
    rating: 4.9, reviews: 167,
    horario: 'Lun–Sáb · 10:00–20:00',
    imagen: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
    portada: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    descripcion: 'Especialistas en balayage, mechas californianas, rubios fríos y color creativo.',
    aceptaAhora: false,
    telefono: '+593 99 998 7766'
  },
  {
    id: 'n14',
    nombre: 'Sleek Barber Club',
    categoria: 'barberia',
    direccion: 'Av. Don Bosco 1-45',
    barrio: 'Yanuncay',
    lat: -2.9105, lng: -79.0160,
    rating: 4.7, reviews: 184,
    horario: 'Lun–Sáb · 09:00–20:00',
    imagen: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
    portada: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200',
    descripcion: 'Cortes ejecutivos, masaje capilar, mascarillas de barba y ambiente premium.',
    aceptaAhora: true,
    telefono: '+593 98 765 0011'
  },
  {
    id: 'n15',
    nombre: 'Pretty Nails Boutique',
    categoria: 'unas',
    direccion: 'Av. 12 de Octubre 4-67',
    barrio: 'El Batán',
    lat: -2.9075, lng: -79.0230,
    rating: 4.6, reviews: 88,
    horario: 'Lun–Sáb · 10:00–19:00',
    imagen: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800',
    portada: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200',
    descripcion: 'Uñas acrílicas, gelish, nail art temático y atención personalizada.',
    aceptaAhora: false,
    telefono: '+593 99 543 2167'
  },
  {
    id: 'n16',
    nombre: 'Pure Skin Cosmetología',
    categoria: 'estetica',
    direccion: 'Calle Honorato Vázquez 8-12',
    barrio: 'Centro Histórico',
    lat: -2.8989, lng: -79.0048,
    rating: 4.8, reviews: 115,
    horario: 'Mar–Sáb · 09:00–18:00',
    imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    portada: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200',
    descripcion: 'Microdermoabrasión, peeling químico, mesoterapia facial.',
    aceptaAhora: false,
    telefono: '+593 96 321 9876'
  },
  {
    id: 'n17',
    nombre: 'Velvet Wax Studio',
    categoria: 'depilacion',
    direccion: 'Av. 10 de Agosto 2-89',
    barrio: 'Totoracocha',
    lat: -2.8932, lng: -78.9710,
    rating: 4.5, reviews: 72,
    horario: 'Lun–Sáb · 09:00–18:00',
    imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    portada: 'https://images.unsplash.com/photo-1614859275398-8e1f7b8b0f4a?w=1200',
    descripcion: 'Depilación con cera tibia, chocolate y caramelo. Cejas con hilo.',
    aceptaAhora: true,
    telefono: '+593 99 876 1234'
  },
  {
    id: 'n18',
    nombre: 'Glam Bridal — Maquillaje de Novias',
    categoria: 'maquillaje',
    direccion: 'Av. Paucarbamba 1-30',
    barrio: 'Yanuncay',
    lat: -2.9098, lng: -79.0220,
    rating: 4.9, reviews: 58,
    horario: 'Cita previa',
    imagen: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
    portada: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    descripcion: 'Maquillaje y peinado para novias, quinceañeras y eventos especiales.',
    aceptaAhora: false,
    telefono: '+593 97 222 8844'
  },
  {
    id: 'n19',
    nombre: 'Relax Thai Massage',
    categoria: 'masajes',
    direccion: 'Av. Fray Vicente Solano 7-90',
    barrio: 'El Ejido',
    lat: -2.9135, lng: -79.0085,
    rating: 4.6, reviews: 134,
    horario: 'Todos los días · 11:00–21:00',
    imagen: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    portada: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200',
    descripcion: 'Masaje thai tradicional, sueco, relajante y deportivo.',
    aceptaAhora: true,
    telefono: '+593 98 654 3322'
  },
  {
    id: 'n20',
    nombre: 'Casa de Belleza Sofía',
    categoria: 'cabello',
    direccion: 'Calle Bolívar 9-45 y Benigno Malo',
    barrio: 'Centro Histórico',
    lat: -2.8975, lng: -79.0040,
    rating: 4.5, reviews: 245,
    horario: 'Lun–Sáb · 08:30–19:30',
    imagen: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    portada: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200',
    descripcion: 'Salón familiar tradicional. Cortes, peinados, tintes y tratamientos capilares.',
    aceptaAhora: false,
    telefono: '+593 99 111 5544'
  }
]

export const SERVICIOS = [
  // Estilo Andino (n1)
  { id: 's1-1', negocioId: 'n1', nombre: 'Corte mujer', duracion: 45, precio: 18.00, categoria: 'cabello' },
  { id: 's1-2', negocioId: 'n1', nombre: 'Color completo', duracion: 120, precio: 65.00, categoria: 'cabello' },
  { id: 's1-3', negocioId: 'n1', nombre: 'Balayage', duracion: 180, precio: 95.00, categoria: 'cabello' },
  { id: 's1-4', negocioId: 'n1', nombre: 'Tratamiento de keratina', duracion: 150, precio: 80.00, categoria: 'cabello' },

  // Don Carlos (n2)
  { id: 's2-1', negocioId: 'n2', nombre: 'Corte clásico caballero', duracion: 30, precio: 8.00, categoria: 'barberia' },
  { id: 's2-2', negocioId: 'n2', nombre: 'Afeitado con navaja', duracion: 30, precio: 10.00, categoria: 'barberia' },
  { id: 's2-3', negocioId: 'n2', nombre: 'Corte + barba', duracion: 45, precio: 14.00, categoria: 'barberia' },
  { id: 's2-4', negocioId: 'n2', nombre: 'Corte niño', duracion: 25, precio: 6.00, categoria: 'barberia' },

  // Nails Studio (n3)
  { id: 's3-1', negocioId: 'n3', nombre: 'Manicure clásico', duracion: 45, precio: 12.00, categoria: 'unas' },
  { id: 's3-2', negocioId: 'n3', nombre: 'Pedicure spa', duracion: 60, precio: 18.00, categoria: 'unas' },
  { id: 's3-3', negocioId: 'n3', nombre: 'Uñas acrílicas', duracion: 90, precio: 30.00, categoria: 'unas' },
  { id: 's3-4', negocioId: 'n3', nombre: 'Nail art personalizado', duracion: 75, precio: 25.00, categoria: 'unas' },

  // Aura Estética (n4)
  { id: 's4-1', negocioId: 'n4', nombre: 'Limpieza facial profunda', duracion: 60, precio: 35.00, categoria: 'estetica' },
  { id: 's4-2', negocioId: 'n4', nombre: 'Hidrafacial', duracion: 75, precio: 55.00, categoria: 'estetica' },
  { id: 's4-3', negocioId: 'n4', nombre: 'Radiofrecuencia facial', duracion: 60, precio: 45.00, categoria: 'estetica' },

  // Serenity Spa (n5)
  { id: 's5-1', negocioId: 'n5', nombre: 'Masaje relajante 60min', duracion: 60, precio: 35.00, categoria: 'spa' },
  { id: 's5-2', negocioId: 'n5', nombre: 'Ritual aromaterapia', duracion: 90, precio: 55.00, categoria: 'spa' },
  { id: 's5-3', negocioId: 'n5', nombre: 'Circuito de hidroterapia', duracion: 120, precio: 70.00, categoria: 'spa' },

  // Glow Depilación (n6)
  { id: 's6-1', negocioId: 'n6', nombre: 'Depilación láser axilas', duracion: 20, precio: 25.00, categoria: 'depilacion' },
  { id: 's6-2', negocioId: 'n6', nombre: 'Depilación láser piernas completas', duracion: 60, precio: 80.00, categoria: 'depilacion' },
  { id: 's6-3', negocioId: 'n6', nombre: 'Depilación láser zona bikini', duracion: 30, precio: 40.00, categoria: 'depilacion' },

  // María Eugenia (n7)
  { id: 's7-1', negocioId: 'n7', nombre: 'Maquillaje social', duracion: 60, precio: 35.00, categoria: 'maquillaje' },
  { id: 's7-2', negocioId: 'n7', nombre: 'Maquillaje de novia', duracion: 120, precio: 120.00, categoria: 'maquillaje' },
  { id: 's7-3', negocioId: 'n7', nombre: 'Prueba de maquillaje', duracion: 90, precio: 45.00, categoria: 'maquillaje' },

  // Manos Sanadoras (n8)
  { id: 's8-1', negocioId: 'n8', nombre: 'Masaje descontracturante', duracion: 60, precio: 30.00, categoria: 'masajes' },
  { id: 's8-2', negocioId: 'n8', nombre: 'Masaje con piedras calientes', duracion: 75, precio: 45.00, categoria: 'masajes' },
  { id: 's8-3', negocioId: 'n8', nombre: 'Reflexología podal', duracion: 45, precio: 25.00, categoria: 'masajes' },

  // Rebel Cuts (n9)
  { id: 's9-1', negocioId: 'n9', nombre: 'Fade clásico', duracion: 40, precio: 12.00, categoria: 'barberia' },
  { id: 's9-2', negocioId: 'n9', nombre: 'Diseño + corte', duracion: 50, precio: 18.00, categoria: 'barberia' },
  { id: 's9-3', negocioId: 'n9', nombre: 'Beard styling', duracion: 30, precio: 10.00, categoria: 'barberia' },

  // Coral Beauty (n10)
  { id: 's10-1', negocioId: 'n10', nombre: 'Manicure express', duracion: 30, precio: 8.00, categoria: 'unas' },
  { id: 's10-2', negocioId: 'n10', nombre: 'Pedicure clásico', duracion: 45, precio: 12.00, categoria: 'unas' },
  { id: 's10-3', negocioId: 'n10', nombre: 'Esmaltado semipermanente', duracion: 60, precio: 18.00, categoria: 'unas' },

  // Belleza Karina (n11)
  { id: 's11-1', negocioId: 'n11', nombre: 'Drenaje linfático', duracion: 60, precio: 28.00, categoria: 'estetica' },
  { id: 's11-2', negocioId: 'n11', nombre: 'Presoterapia', duracion: 45, precio: 22.00, categoria: 'estetica' },
  { id: 's11-3', negocioId: 'n11', nombre: 'Sesión de cavitación', duracion: 60, precio: 35.00, categoria: 'estetica' },

  // Zen Garden (n12)
  { id: 's12-1', negocioId: 'n12', nombre: 'Masaje Thai 90 min', duracion: 90, precio: 50.00, categoria: 'spa' },
  { id: 's12-2', negocioId: 'n12', nombre: 'Shiatsu', duracion: 60, precio: 40.00, categoria: 'spa' },
  { id: 's12-3', negocioId: 'n12', nombre: 'Ceremonia del té + spa facial', duracion: 120, precio: 75.00, categoria: 'spa' },

  // Hair Lab (n13)
  { id: 's13-1', negocioId: 'n13', nombre: 'Balayage premium', duracion: 240, precio: 130.00, categoria: 'cabello' },
  { id: 's13-2', negocioId: 'n13', nombre: 'Decoloración + tono', duracion: 180, precio: 100.00, categoria: 'cabello' },
  { id: 's13-3', negocioId: 'n13', nombre: 'Corte y peinado', duracion: 60, precio: 22.00, categoria: 'cabello' },

  // Sleek Barber (n14)
  { id: 's14-1', negocioId: 'n14', nombre: 'Corte ejecutivo', duracion: 35, precio: 12.00, categoria: 'barberia' },
  { id: 's14-2', negocioId: 'n14', nombre: 'Ritual de barba', duracion: 40, precio: 15.00, categoria: 'barberia' },
  { id: 's14-3', negocioId: 'n14', nombre: 'Combo premium', duracion: 60, precio: 22.00, categoria: 'barberia' },

  // Pretty Nails (n15)
  { id: 's15-1', negocioId: 'n15', nombre: 'Uñas acrílicas', duracion: 90, precio: 28.00, categoria: 'unas' },
  { id: 's15-2', negocioId: 'n15', nombre: 'Gelish manos y pies', duracion: 90, precio: 25.00, categoria: 'unas' },
  { id: 's15-3', negocioId: 'n15', nombre: 'Diseño nail art', duracion: 60, precio: 20.00, categoria: 'unas' },

  // Pure Skin (n16)
  { id: 's16-1', negocioId: 'n16', nombre: 'Microdermoabrasión', duracion: 60, precio: 38.00, categoria: 'estetica' },
  { id: 's16-2', negocioId: 'n16', nombre: 'Peeling químico', duracion: 45, precio: 50.00, categoria: 'estetica' },
  { id: 's16-3', negocioId: 'n16', nombre: 'Mesoterapia facial', duracion: 60, precio: 65.00, categoria: 'estetica' },

  // Velvet Wax (n17)
  { id: 's17-1', negocioId: 'n17', nombre: 'Depilación cera bigote', duracion: 15, precio: 5.00, categoria: 'depilacion' },
  { id: 's17-2', negocioId: 'n17', nombre: 'Depilación cera piernas', duracion: 40, precio: 18.00, categoria: 'depilacion' },
  { id: 's17-3', negocioId: 'n17', nombre: 'Diseño de cejas con hilo', duracion: 20, precio: 8.00, categoria: 'depilacion' },

  // Glam Bridal (n18)
  { id: 's18-1', negocioId: 'n18', nombre: 'Maquillaje + peinado novia', duracion: 180, precio: 180.00, categoria: 'maquillaje' },
  { id: 's18-2', negocioId: 'n18', nombre: 'Maquillaje quinceañera', duracion: 120, precio: 80.00, categoria: 'maquillaje' },
  { id: 's18-3', negocioId: 'n18', nombre: 'Maquillaje fiesta', duracion: 60, precio: 40.00, categoria: 'maquillaje' },

  // Relax Thai (n19)
  { id: 's19-1', negocioId: 'n19', nombre: 'Masaje Thai 60 min', duracion: 60, precio: 30.00, categoria: 'masajes' },
  { id: 's19-2', negocioId: 'n19', nombre: 'Masaje sueco', duracion: 60, precio: 32.00, categoria: 'masajes' },
  { id: 's19-3', negocioId: 'n19', nombre: 'Masaje deportivo', duracion: 75, precio: 40.00, categoria: 'masajes' },

  // Casa de Belleza Sofía (n20)
  { id: 's20-1', negocioId: 'n20', nombre: 'Corte y secado', duracion: 50, precio: 12.00, categoria: 'cabello' },
  { id: 's20-2', negocioId: 'n20', nombre: 'Tinte raíz', duracion: 90, precio: 30.00, categoria: 'cabello' },
  { id: 's20-3', negocioId: 'n20', nombre: 'Tratamiento capilar', duracion: 60, precio: 22.00, categoria: 'cabello' }
]

export const EMPLEADOS = [
  { id: 'e1-1', negocioId: 'n1', nombre: 'Lucía Vintimilla', cargo: 'Estilista senior', avatar: 'LV' },
  { id: 'e1-2', negocioId: 'n1', nombre: 'Diego Cabrera', cargo: 'Colorista', avatar: 'DC' },
  { id: 'e2-1', negocioId: 'n2', nombre: 'Carlos Ortega', cargo: 'Maestro barbero', avatar: 'CO' },
  { id: 'e2-2', negocioId: 'n2', nombre: 'Andrés Pesántez', cargo: 'Barbero', avatar: 'AP' },
  { id: 'e3-1', negocioId: 'n3', nombre: 'Daniela Tello', cargo: 'Manicurista', avatar: 'DT' },
  { id: 'e3-2', negocioId: 'n3', nombre: 'Paula Vélez', cargo: 'Nail artist', avatar: 'PV' },
  { id: 'e8-1', negocioId: 'n8', nombre: 'Patricia Ávila', cargo: 'Masajista terapéutica', avatar: 'PA' },
  { id: 'e9-1', negocioId: 'n9', nombre: 'Jonathan Cárdenas', cargo: 'Master barber', avatar: 'JC' },
  { id: 'e9-2', negocioId: 'n9', nombre: 'Mateo Rivera', cargo: 'Barbero', avatar: 'MR' },
  { id: 'e14-1', negocioId: 'n14', nombre: 'Sebastián Loja', cargo: 'Barbero senior', avatar: 'SL' },
  { id: 'e17-1', negocioId: 'n17', nombre: 'Anita Quito', cargo: 'Esteticista', avatar: 'AQ' },
  { id: 'e19-1', negocioId: 'n19', nombre: 'Tanya Wong', cargo: 'Masajista', avatar: 'TW' }
]

export function obtenerNegocio(id) {
  return NEGOCIOS.find((n) => n.id === id)
}

export function serviciosDeNegocio(negocioId) {
  return SERVICIOS.filter((s) => s.negocioId === negocioId)
}

export function empleadosDeNegocio(negocioId) {
  return EMPLEADOS.filter((e) => e.negocioId === negocioId)
}

export function obtenerServicio(id) {
  return SERVICIOS.find((s) => s.id === id)
}
