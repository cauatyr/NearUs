// Textos legales de NearUs.
//
// ⚠️ Redactados a medida del producto (Cuenca/Ecuador, USD, comisión sobre pagos
// in-app), pero NO revisados por un abogado. Antes del lanzamiento real conviene
// que un profesional ecuatoriano los revise, sobre todo datos personales (LOPDP)
// y cobros.
//
// TERMINOS_VERSION: al subirla, a todos los clientes se les vuelve a pedir la
// aceptación. Usar formato fecha para que se entienda de un vistazo.

export const TERMINOS_VERSION = '2026-09-16'

export const CONTACTO = {
  email: 'hola@nearus.ec',
  ciudad: 'Cuenca, Ecuador'
}

export const TERMINOS_CLIENTE = {
  titulo: 'Términos de servicio',
  subtitulo: 'Para quienes usan NearUs para descubrir y reservar servicios.',
  version: TERMINOS_VERSION,
  resumen: [
    'NearUs te conecta con negocios locales. El servicio lo presta el negocio, no NearUs.',
    'Reservar es gratis para vos. Si pagás dentro del app, el cobro lo procesa NearUs.',
    'Usamos tu ubicación sólo para mostrarte lo que tenés cerca. No la vendemos ni la publicamos.',
    'Si no vas a una reserva, avisá: el negocio puede limitar reservas a quien falta seguido.'
  ],
  secciones: [
    {
      titulo: '1. Qué es NearUs',
      parrafos: [
        'NearUs es una plataforma que conecta personas con negocios de servicios locales (belleza, barbería, estética y categorías afines) en las ciudades donde opera. Funciona como intermediario tecnológico: mostramos los negocios, sus servicios, precios y horarios, y permitimos agendar una cita.',
        'NearUs NO presta los servicios que se reservan a través de la plataforma. Cada negocio es independiente y el único responsable por el servicio que brinda, su calidad, su personal, sus precios, su higiene, sus permisos y el cumplimiento de la cita.'
      ]
    },
    {
      titulo: '2. Tu cuenta',
      parrafos: [
        'Para reservar necesitás una cuenta con un email válido. Sos responsable de la veracidad de los datos que cargás y de mantener tu contraseña en privado.',
        'Tenés que ser mayor de edad, o contar con autorización de tu representante legal, para usar NearUs.',
        'Podés pedir la eliminación de tu cuenta en cualquier momento escribiendo a ' + CONTACTO.email + '. Conservamos el historial de reservas el tiempo que exija la ley o la resolución de disputas.'
      ]
    },
    {
      titulo: '3. Reservas',
      parrafos: [
        'Al confirmar una reserva estás acordando una cita directamente con el negocio. NearUs te envía la confirmación y un código de check-in.',
        'La disponibilidad, la duración y el precio que ves son los que el negocio cargó en la plataforma. Si el negocio cambia o cancela una cita, NearUs te avisa, pero la responsabilidad del cambio es del negocio.',
        'Podés cancelar o reagendar desde el app. Cancelar muy sobre la hora, o no presentarte, puede hacer que un negocio limite futuras reservas tuyas.'
      ]
    },
    {
      titulo: '4. Pagos',
      parrafos: [
        'Usar NearUs como cliente es gratuito: no cobramos por buscar ni por reservar.',
        'Hay dos formas de pagar el servicio: en el local (el dinero va directo al negocio, NearUs no participa) o dentro del app, cuando el negocio lo habilita. En el pago dentro del app, NearUs procesa el cobro y transfiere al negocio lo que le corresponde.',
        'Los reembolsos por un servicio no prestado o mal prestado se resuelven con el negocio. NearUs puede intermediar y, cuando el pago pasó por la plataforma, ejecutar la devolución.',
        'Los precios se expresan en dólares de los Estados Unidos de América (USD).'
      ]
    },
    {
      titulo: '5. Ubicación',
      parrafos: [
        'NearUs te pide la ubicación para centrar el mapa, ordenar los negocios por distancia real y, en Near you, encontrar el local más cercano disponible. Sin ubicación exacta el app funciona igual, pero las distancias se calculan desde el centro de la ciudad.',
        'No compartimos tu ubicación con los negocios ni con terceros, y no la usamos para seguirte fuera del app.'
      ]
    },
    {
      titulo: '6. Reseñas y contenido',
      parrafos: [
        'Podés dejar una reseña de un servicio que reservaste. La reseña tiene que ser sobre tu experiencia real.',
        'No se permite contenido ofensivo, discriminatorio, falso, publicitario ni datos personales de terceros. NearUs puede quitar reseñas que incumplan esto, y el negocio puede responderlas públicamente.'
      ]
    },
    {
      titulo: '7. Uso correcto',
      parrafos: [
        'No se puede usar NearUs para reservas falsas, para hostigar a un negocio o a su personal, para extraer datos de la plataforma de forma automatizada, ni para intentar acceder a cuentas ajenas.',
        'Podemos suspender una cuenta que incumpla estos términos o que genere perjuicio a otros usuarios o negocios.'
      ]
    },
    {
      titulo: '8. Responsabilidad',
      parrafos: [
        'NearUs responde por el funcionamiento de la plataforma, no por el servicio contratado. No garantizamos que el app esté disponible sin interrupciones ni libre de errores, aunque trabajamos para eso.',
        'En la medida que lo permita la ley, la responsabilidad de NearUs frente a un reclamo se limita al monto que hayas pagado a través de la plataforma por la reserva involucrada.'
      ]
    },
    {
      titulo: '9. Cambios',
      parrafos: [
        'Podemos actualizar estos términos. Cuando cambien de forma relevante, el app te los vuelve a mostrar y te pide aceptarlos antes de seguir usándolo. La versión vigente es la ' + TERMINOS_VERSION + '.'
      ]
    },
    {
      titulo: '10. Ley aplicable y contacto',
      parrafos: [
        'Estos términos se rigen por las leyes de la República del Ecuador. Cualquier controversia se somete a los jueces competentes de ' + CONTACTO.ciudad + '.',
        'Dudas o reclamos: ' + CONTACTO.email + '.'
      ]
    }
  ]
}

export const PRIVACIDAD = {
  titulo: 'Política de privacidad',
  subtitulo: 'Qué datos tomamos, para qué, y qué podés pedirnos.',
  version: TERMINOS_VERSION,
  resumen: [
    'Guardamos lo mínimo para que una reserva funcione: nombre, email, celular y tus citas.',
    'La ubicación se usa en el momento, para ordenar por distancia. No armamos un historial de dónde estuviste.',
    'No vendemos tus datos.',
    'Podés pedir acceso, corrección o eliminación escribiendo a ' + CONTACTO.email + '.'
  ],
  secciones: [
    {
      titulo: '1. Responsable',
      parrafos: [
        'NearUs, con operación en ' + CONTACTO.ciudad + ', es responsable del tratamiento de los datos personales que se cargan en la plataforma. Contacto: ' + CONTACTO.email + '.'
      ]
    },
    {
      titulo: '2. Qué datos tratamos',
      parrafos: [
        'De clientes: nombre, email, celular, foto de perfil si la cargás, tus reservas y tus reseñas.',
        'De negocios: datos del local (nombre, dirección, ubicación en el mapa, teléfono, fotos, horarios), datos de su equipo y el email de la cuenta de acceso.',
        'Ubicación: coordenadas aproximadas o exactas mientras usás el app, si diste permiso. Se usan en el momento para calcular distancias; no construimos un historial de desplazamientos.',
        'Datos técnicos mínimos del navegador para que el app funcione (sesión, preferencias guardadas en tu dispositivo).'
      ]
    },
    {
      titulo: '3. Para qué los usamos',
      parrafos: [
        'Para crear y mantener tu cuenta, gestionar reservas, avisarte de cambios en tus citas, mostrar negocios cerca tuyo, procesar pagos hechos dentro del app, prevenir abusos y mejorar el producto.',
        'No usamos tus datos para publicidad de terceros ni los vendemos.'
      ]
    },
    {
      titulo: '4. Con quién se comparten',
      parrafos: [
        'Con el negocio que reservás: tu nombre y tu celular, para que pueda atenderte y contactarte por esa cita. Nada más.',
        'Con proveedores de infraestructura necesarios para operar (alojamiento y base de datos), que tratan los datos por cuenta de NearUs.',
        'Con autoridades, si una norma o una orden judicial lo exige.'
      ]
    },
    {
      titulo: '5. Cuánto tiempo',
      parrafos: [
        'Mientras tengas cuenta activa. Si pedís la eliminación, borramos tus datos personales y conservamos únicamente lo necesario por obligaciones legales o contables, o por una disputa abierta.'
      ]
    },
    {
      titulo: '6. Tus derechos',
      parrafos: [
        'Podés pedir acceso a tus datos, su rectificación, su eliminación, la limitación del tratamiento, y oponerte a determinados usos, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.',
        'Escribinos a ' + CONTACTO.email + ' y respondemos en los plazos que la ley establece.'
      ]
    },
    {
      titulo: '7. Seguridad',
      parrafos: [
        'Aplicamos medidas técnicas y organizativas razonables para proteger la información. Ningún sistema es infalible: si ocurriera un incidente que afecte tus datos, te lo comunicamos y lo notificamos a la autoridad cuando corresponda.'
      ]
    }
  ]
}

export const CONTRATO_NEGOCIO = {
  titulo: 'Contrato de prestación de servicios',
  subtitulo: 'Entre NearUs y el negocio que se publica en la plataforma.',
  version: TERMINOS_VERSION,
  comisionTexto: '10% sobre los cobros hechos dentro del app',
  resumen: [
    'Publicar el negocio y recibir reservas no tiene costo fijo.',
    'NearUs cobra 10% únicamente sobre lo que se paga dentro del app. Lo que se cobra en el local no paga comisión.',
    'El negocio es el responsable del servicio, de sus precios y de sus permisos.',
    'Los datos de los clientes se usan para atender esa cita, no para otra cosa.'
  ],
  secciones: [
    {
      titulo: '1. Objeto',
      parrafos: [
        'NearUs pone a disposición del negocio una plataforma para publicar su ficha, sus servicios, su equipo y su horario, recibir reservas de clientes y administrar su agenda.',
        'El negocio presta los servicios que publica, bajo su exclusiva responsabilidad, con su propio personal y sus propios medios. Este contrato no crea relación laboral, societaria ni de dependencia entre NearUs y el negocio o su personal.'
      ]
    },
    {
      titulo: '2. Comisión',
      parrafos: [
        'Publicarse y recibir reservas no tiene costo fijo ni mensualidad durante la etapa actual.',
        'NearUs percibe una comisión del 10% sobre el valor de las reservas pagadas DENTRO del app. Las reservas que el cliente paga en el local no generan comisión: ese dinero no pasa por la plataforma.',
        'La liquidación de los cobros hechos en el app, descontada la comisión, se muestra en el panel del negocio en la sección Reportes.',
        'NearUs puede modificar el porcentaje avisando con anticipación razonable. Si el negocio no está de acuerdo, puede dar de baja su ficha.'
      ]
    },
    {
      titulo: '3. Obligaciones del negocio',
      parrafos: [
        'Mantener actualizados sus servicios, precios, horarios y disponibilidad. Un precio publicado es el precio que se le cobra al cliente por ese servicio.',
        'Honrar las reservas confirmadas y avisar por el panel con la mayor anticipación posible si no puede cumplir una.',
        'Contar con los permisos, habilitaciones y condiciones sanitarias que exija la normativa local para la actividad que ofrece.',
        'Tratar los datos de los clientes que recibe por la plataforma únicamente para atender esa cita. No se pueden usar para campañas propias, ni cederse ni venderse a terceros.',
        'Publicar fotos y contenido sobre los que tenga derechos.'
      ]
    },
    {
      titulo: '4. Obligaciones de NearUs',
      parrafos: [
        'Mantener la plataforma operativa y el panel disponible, y notificar al negocio las reservas que recibe.',
        'Resguardar los datos del negocio y de sus clientes conforme a la política de privacidad.',
        'Liquidar al negocio lo que le corresponde de los cobros hechos dentro del app.'
      ]
    },
    {
      titulo: '5. Reseñas',
      parrafos: [
        'Los clientes que reservaron pueden calificar el servicio. El negocio puede responder públicamente cada reseña.',
        'NearUs no borra reseñas negativas legítimas. Sí remueve las que sean ofensivas, falsas, de quien no fue cliente, o que incumplan los términos.'
      ]
    },
    {
      titulo: '6. Suspensión y baja',
      parrafos: [
        'El negocio puede darse de baja cuando quiera, respetando las reservas ya confirmadas.',
        'NearUs puede suspender una ficha que incumpla este contrato, que acumule reclamos por citas no cumplidas, o que publique información falsa.'
      ]
    },
    {
      titulo: '7. Ley aplicable',
      parrafos: [
        'Este contrato se rige por las leyes de la República del Ecuador y se somete a los jueces competentes de ' + CONTACTO.ciudad + '. Versión vigente: ' + TERMINOS_VERSION + '.'
      ]
    }
  ]
}
