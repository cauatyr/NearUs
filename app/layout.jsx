import './globals.css'
import SWRegister from '@/components/SWRegister'
import CargadorDatos from '@/components/CargadorDatos'

export const metadata = {
  title: 'NearUs — Reserva servicios cerca de ti en Cuenca',
  description:
    'Descubre y reserva servicios locales de belleza en Cuenca, Ecuador. Sin llamadas, sin esperas. Reserva en segundos.',
  applicationName: 'NearUs',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NearUs'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'NearUs — Servicios cerca de ti',
    description:
      'Reserva salones, barberías, spas y más en Cuenca, Ecuador. En segundos, sin llamadas.',
    locale: 'es_EC',
    type: 'website'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es-EC" translate="no">
      <head>
        {/* Bloqueamos extensiones de traducción que causan errores de DOM en React */}
        <meta name="google" content="notranslate" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="notranslate">
        <CargadorDatos>{children}</CargadorDatos>
        <SWRegister />
      </body>
    </html>
  )
}
