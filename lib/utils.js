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

// Cuenca usa America/Guayaquil (UTC-5, sin horario de verano).
export const TZ_CUENCA = 'America/Guayaquil'

// "Ahora" en Cuenca: fecha YYYY-MM-DD y minutos desde medianoche.
export function ahoraEnCuenca() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_CUENCA,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]))
  // en algunos navegadores la medianoche sale como "24" — normalizamos a 0
  const hora = p.hour === '24' ? 0 : Number(p.hour)
  return {
    fecha: `${p.year}-${p.month}-${p.day}`,
    minutos: hora * 60 + Number(p.minute)
  }
}

// Fecha calendario (local del dispositivo) de un Date, formato YYYY-MM-DD.
// Es el día tal como lo ve el usuario en los chips (no convierte zona horaria).
export function diaLocalISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Fecha de un Date interpretada en Cuenca, formato YYYY-MM-DD.
export function fechaEnCuenca(date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_CUENCA,
    year: 'numeric', month: '2-digit', day: '2-digit'
  })
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]))
  return `${p.year}-${p.month}-${p.day}`
}

export function generarCodigoReserva() {
  return 'NU-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// "faltan 2 h 15 min" / "faltan 3 días" a partir de milisegundos.
function formatoCuenta(ms) {
  if (ms <= 0) return null
  const min = Math.round(ms / 60000)
  if (min < 60) return `faltan ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) {
    const m = min % 60
    return m ? `faltan ${horas} h ${m} min` : `faltan ${horas} h`
  }
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'falta 1 día' : `faltan ${dias} días`
}

// Estado "en vivo" derivado de una reserva, SIN tocar el DB (el estado real
// sigue siendo confirmada/completada/cancelada). Sirve para el timeline y los
// contadores del cliente. `paso` = índice del timeline (0..3), -1 = cancelada.
// Timeline: 0 Confirmada · 1 Te esperan (hoy) · 2 En progreso · 3 Completada.
export function estadoReserva(reserva) {
  if (!reserva) return { clave: 'desconocido', paso: 0, etiqueta: '', detalle: '', cuenta: null }
  const ahora = new Date()
  const inicio = new Date(reserva.fecha)
  const fin = new Date(inicio.getTime() + (reserva.duracion ?? 30) * 60000)

  if (reserva.estado === 'cancelada')
    return { clave: 'cancelada', paso: -1, etiqueta: 'Reserva cancelada', detalle: 'Esta cita fue cancelada.', cuenta: null }
  if (reserva.estado === 'completada')
    return { clave: 'completada', paso: 3, etiqueta: 'Cita completada', detalle: '¡Gracias por tu visita!', cuenta: null }

  // estado confirmada:
  if (ahora >= fin)
    return { clave: 'esperando-checkin', paso: 2, etiqueta: 'Cita en curso', detalle: 'Tu cita ya está por finalizar.', cuenta: null }
  if (ahora >= inicio)
    return { clave: 'en-progreso', paso: 2, etiqueta: 'En progreso', detalle: 'Tu cita está ocurriendo ahora.', cuenta: null }

  const esHoy = fechaEnCuenca(inicio) === ahoraEnCuenca().fecha
  return {
    clave: esHoy ? 'hoy' : 'confirmada',
    paso: esHoy ? 1 : 0,
    etiqueta: esHoy ? 'Te esperan hoy' : 'Reserva confirmada',
    detalle: esHoy ? 'Tu cita es hoy.' : 'Tu cita está agendada.',
    cuenta: formatoCuenta(inicio - ahora)
  }
}

// ¿El negocio está abierto AHORA (hora de Cuenca)? Parsea el primer rango
// "HH:MM–HH:MM" del texto de horario. Devuelve true/false, o null si no se
// puede interpretar (para ocultar el badge en vez de mostrar algo dudoso).
export function horarioAbierto(horario) {
  if (!horario) return null
  const m = String(horario).match(/(\d{1,2}):(\d{2})\s*[–\-a]{1,3}\s*(\d{1,2}):(\d{2})/)
  if (!m) return null
  const abre = Number(m[1]) * 60 + Number(m[2])
  const cierra = Number(m[3]) * 60 + Number(m[4])
  const { minutos } = ahoraEnCuenca()
  return minutos >= abre && minutos < cierra
}

// ===== HORARIO POR DÍA =====
// Orden fijo de la semana en NearUs (coincide con empleados.diasTrabajo).
export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Horario semanal por defecto: Lun–Sáb 09:00–19:00, Dom cerrado.
export function horarioSemanalDefault() {
  return DIAS_SEMANA.map((dia) => ({
    dia,
    abierto: dia !== 'Dom',
    apertura: '09:00',
    cierre: '19:00'
  }))
}

// Convierte el horario_semanal estructurado en un resumen legible para los
// cards (ej. "Lun–Sáb · 09:00–19:00"). Devuelve null si no hay datos válidos.
export function resumenHorario(horarioSemanal) {
  if (!Array.isArray(horarioSemanal) || horarioSemanal.length === 0) return null
  const abiertos = horarioSemanal.filter((d) => d && d.abierto)
  if (abiertos.length === 0) return 'Cerrado temporalmente'

  const indices = abiertos
    .map((d) => DIAS_SEMANA.indexOf(d.dia))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
  const primero = DIAS_SEMANA[indices[0]]
  const ultimo = DIAS_SEMANA[indices[indices.length - 1]]
  const contiguos = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1)
  const mismoHorario = abiertos.every(
    (d) => d.apertura === abiertos[0].apertura && d.cierre === abiertos[0].cierre
  )

  if (mismoHorario) {
    const franja = `${abiertos[0].apertura}–${abiertos[0].cierre}`
    if (indices.length === 7) return `Todos los días · ${franja}`
    const rango =
      contiguos && indices.length > 1
        ? `${primero}–${ultimo}`
        : indices.map((i) => DIAS_SEMANA[i]).join(', ')
    return `${rango} · ${franja}`
  }
  // Horarios distintos por día → resumen corto (el detalle completo se ve por día).
  return `${primero}–${ultimo} · horario variable`
}

// Devuelve la franja { dia, abierto, apertura, cierre } del horario_semanal que
// corresponde a la FECHA dada (según el día de la semana). null si no hay datos.
export function franjaDelDia(horarioSemanal, date) {
  if (!Array.isArray(horarioSemanal)) return null
  const etiqueta = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()]
  return horarioSemanal.find((d) => d && d.dia === etiqueta) || null
}

// Genera las horas de inicio válidas ('HH:MM') entre apertura y cierre en pasos
// de `paso` minutos. Si se pasa `duracion`, solo incluye inicios que dejan
// terminar el servicio antes del cierre.
export function horariosDeFranja(apertura, cierre, duracion = 0, paso = 30) {
  if (!apertura || !cierre) return []
  const toMin = (t) => {
    const [h, m] = String(t).split(':').map(Number)
    return h * 60 + m
  }
  const ini = toMin(apertura)
  const fin = toMin(cierre)
  const limite = duracion > 0 ? fin - duracion : fin - 1
  const out = []
  for (let t = ini; t <= limite; t += paso) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return out
}

// "hace 3 días" / "hace 2 h" / "recién" a partir de una fecha ISO.
export function tiempoRelativo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return d === 1 ? 'hace 1 día' : `hace ${d} días`
  const sem = Math.floor(d / 7)
  if (sem < 5) return sem === 1 ? 'hace 1 semana' : `hace ${sem} semanas`
  const meses = Math.floor(d / 30)
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`
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
