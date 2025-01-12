export const linksList = [
  {
    title: 'INICIO',
    link: 'IndexPage'
  },
  {
    title: 'NOMENCLADORES',
    link: 'NomenclatorsCard'
  },
  {
    title: 'BÚSQUEDAS',
    children: [
      {
        title: 'Habitacion por Ama de llave',
        link: 'HabitacionesPorAmadeLlaves'
      },
      {
        title: 'Reserva por fecha',
        link: 'ReservasPorFecha'
      },
      {
        title: 'Reserva por rango de fecha',
        link: 'ReservasEnRango'
      }
    ]
  }
]
