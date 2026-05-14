/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Marca = azul del logo NearUs
        marca: {
          50: '#EBF7FC',
          100: '#D1ECF8',
          200: '#A4D9F1',
          300: '#76C5EA',
          400: '#49B2E3',
          500: '#2BACE2', // azul principal del logo
          600: '#1B8FBE',
          700: '#157094',
          800: '#0F5169',
          900: '#08323F'
        },
        // Negro = bloques fuertes / hero / footer
        nocturno: {
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#A1A1AA',
          400: '#3F3F46',
          500: '#18181B',
          600: '#0F0F11',
          700: '#0A0A0B',
          800: '#050506',
          900: '#000000'
        },
        // Acento = verde para confirmaciones
        acento: {
          500: '#0F6E56',
          600: '#085041'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        suave: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
        flotante: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)',
        marca: '0 10px 25px -5px rgba(43,172,226,0.35), 0 8px 10px -6px rgba(43,172,226,0.2)'
      }
    }
  },
  plugins: []
}
