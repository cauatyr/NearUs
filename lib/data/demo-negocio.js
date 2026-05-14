// Datos demo del negocio "n2 — Don Carlos Barbería" usado para el panel del negocio
import { SERVICIOS, EMPLEADOS } from './negocios'

export const NEGOCIO_DEMO_ID = 'n2'

function hoyConHora(hora) {
  const [h, m] = hora.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function fechaRelativa(offsetDias, hora) {
  const d = hoyConHora(hora)
  d.setDate(d.getDate() + offsetDias)
  return d
}

export const RESERVAS_DEMO = [
  {
    id: 'r-demo-1', codigo: 'NU-A4D1X', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-3', empleadoId: 'e2-1',
    cliente: { nombre: 'Mateo Vintimilla', celular: '+593 99 234 5678' },
    fecha: fechaRelativa(0, '09:30').toISOString(),
    duracion: 45, precio: 14.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-2', codigo: 'NU-B7K2P', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-1', empleadoId: 'e2-2',
    cliente: { nombre: 'Carlos Andrade', celular: '+593 98 765 4321' },
    fecha: fechaRelativa(0, '10:00').toISOString(),
    duracion: 30, precio: 8.00, estado: 'confirmada', metodoPago: 'local'
  },
  {
    id: 'r-demo-3', codigo: 'NU-C9M4R', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-2', empleadoId: 'e2-1',
    cliente: { nombre: 'Felipe Crespo', celular: '+593 97 111 2233' },
    fecha: fechaRelativa(0, '11:00').toISOString(),
    duracion: 30, precio: 10.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-4', codigo: 'NU-D2N7T', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-3', empleadoId: 'e2-2',
    cliente: { nombre: 'Diego Cordero', celular: '+593 99 888 7766' },
    fecha: fechaRelativa(0, '12:00').toISOString(),
    duracion: 45, precio: 14.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-5', codigo: 'NU-E5P3W', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-1', empleadoId: 'e2-1',
    cliente: { nombre: 'Renato Solano', celular: '+593 96 444 3322' },
    fecha: fechaRelativa(0, '14:30').toISOString(),
    duracion: 30, precio: 8.00, estado: 'confirmada', metodoPago: 'local'
  },
  {
    id: 'r-demo-6', codigo: 'NU-F8R1Y', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-4', empleadoId: 'e2-2',
    cliente: { nombre: 'Sebastián Loja', celular: '+593 98 123 4567' },
    fecha: fechaRelativa(0, '16:00').toISOString(),
    duracion: 25, precio: 6.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-7', codigo: 'NU-G3S9Z', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-3', empleadoId: 'e2-1',
    cliente: { nombre: 'Luis Ortiz', celular: '+593 99 765 4321' },
    fecha: fechaRelativa(0, '17:30').toISOString(),
    duracion: 45, precio: 14.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  // Mañana
  {
    id: 'r-demo-8', codigo: 'NU-H6T4A', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-2', empleadoId: 'e2-2',
    cliente: { nombre: 'Andrés Pulla', celular: '+593 97 654 3210' },
    fecha: fechaRelativa(1, '09:00').toISOString(),
    duracion: 30, precio: 10.00, estado: 'confirmada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-9', codigo: 'NU-I1U7B', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-3', empleadoId: 'e2-1',
    cliente: { nombre: 'Tomás Ávila', celular: '+593 98 222 1111' },
    fecha: fechaRelativa(1, '11:30').toISOString(),
    duracion: 45, precio: 14.00, estado: 'confirmada', metodoPago: 'local'
  },
  // Anteriores (completadas) para reportes
  {
    id: 'r-demo-p1', codigo: 'NU-J9V5C', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-1', empleadoId: 'e2-1',
    cliente: { nombre: 'Rodrigo Pesantez', celular: '+593 99 555 6677' },
    fecha: fechaRelativa(-1, '10:00').toISOString(),
    duracion: 30, precio: 8.00, estado: 'completada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-p2', codigo: 'NU-K4W8D', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-3', empleadoId: 'e2-2',
    cliente: { nombre: 'Camilo Bermeo', celular: '+593 96 888 9999' },
    fecha: fechaRelativa(-1, '14:00').toISOString(),
    duracion: 45, precio: 14.00, estado: 'completada', metodoPago: 'inapp'
  },
  {
    id: 'r-demo-p3', codigo: 'NU-L2X6E', negocioId: NEGOCIO_DEMO_ID,
    servicioId: 's2-2', empleadoId: 'e2-1',
    cliente: { nombre: 'Pablo Toral', celular: '+593 99 111 2222' },
    fecha: fechaRelativa(-2, '16:30').toISOString(),
    duracion: 30, precio: 10.00, estado: 'completada', metodoPago: 'local'
  }
]

export function obtenerServicioDemo(id) {
  return SERVICIOS.find((s) => s.id === id)
}

export function obtenerEmpleadoDemo(id) {
  return EMPLEADOS.find((e) => e.id === id)
}
