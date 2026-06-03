export function formatoUSD(valor) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(valor)
}

export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatoDistancia(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatoDuracion(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export function diasSemanaCorto(fecha) {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return dias[fecha.getDay()]
}

export function mesCorto(fecha) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return meses[fecha.getMonth()]
}

export function siguientesDias(cantidad = 14) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return d
  })
}

export function generarHorarios(inicio = 9, fin = 19, paso = 30) {
  const horarios = []
  for (let h = inicio; h < fin; h++) {
    for (let m = 0; m < 60; m += paso) {
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horarios
}

export function generarCodigoReserva() {
  return 'NU-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Avatar SVG con iniciales del nombre, fondo del color de la categoría.
// Sirve de placeholder cuando un negocio aún no subió su logo real.
export function logoPlaceholder(nombre, color) {
  const seed = encodeURIComponent(nombre || 'NearUs')
  const bg = (color || '#2BACE2').replace('#', '')
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}&fontWeight=700&radius=50`
}

// Comprime una imagen del input file a maxSize×maxSize y devuelve dataURL.
// formato='image/png' preserva transparencia (uso para logos).
// formato='image/jpeg' es mucho más liviano y va bien para fotos grandes (portadas, fotos del negocio).
export function comprimirImagen(file, maxSize = 256, formato = 'image/png') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (formato === 'image/jpeg') {
          // JPEG no soporta transparencia — rellenamos blanco para evitar fondo negro
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL(formato, formato === 'image/jpeg' ? 0.85 : undefined))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
