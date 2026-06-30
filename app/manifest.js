export default function manifest() {
  return {
    name: 'NearUs — Servicios cerca de ti',
    short_name: 'NearUs',
    description:
      'Descubre y reserva servicios locales en Cuenca, Ecuador. Belleza, barbería, spa y más, sin llamadas ni esperas.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'es-EC',
    dir: 'ltr',
    background_color: '#FFFFFF',
    theme_color: '#000000',
    categories: ['business', 'lifestyle', 'shopping'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Explorar mapa',
        short_name: 'Explorar',
        description: 'Ver servicios cerca de ti',
        url: '/explorar',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      },
      {
        name: 'Near you',
        short_name: 'Near you',
        description: 'Atención inmediata cerca de ti',
        url: '/ahora',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }
    ]
  }
}
