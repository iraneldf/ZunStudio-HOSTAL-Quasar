export const linksList = [
  {
    title: 'INICIO',
    link: 'IndexPage'
  },
  {
    icon: 'search',
    title: 'NOMENCLADORES',
    link: 'NomenclatorsCard'
  },
  {
    icon: 'search',
    title: 'BÚSQUEDAS',
    children: [
      {
        icon: 'bed',
        title: 'Habitacion por Ama de llave',
        link: 'HabitacionesPorAmadeLlaves'
      },
      {
        icon: 'hotel',
        title: 'Cliente y Habitaciones por fecha',
        link: 'ReservasPorFecha'
      },
      {
        icon: 'event',
        title: 'Reserva por rango de fecha',
        link: 'ReservasEnRango'
      }
    ]
  }
]
