const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'IndexPage',
        name: 'IndexPage',
        component: () => import('src/IndexPage.vue')
      },
      {
        path: 'NomenclatorsCard',
        name: 'NomenclatorsCard',
        component: () => import('src/pages/Nomenclators/NomenclatorsCard.vue')
      },
      {
        path: 'Piso',
        name: 'Piso',
        component: () => import('src/pages/Nomenclators/Piso.vue')
      },
      {
        path: 'Casilla',
        name: 'Casilla',
        component: () => import('src/pages/Nomenclators/Casilla.vue')
      },
      {
        path: 'Clientes',
        name: 'Clientes',
        component: () => import('src/pages/Nomenclators/Cliente.vue')
      },
      {
        path: 'AmaDeLlaves',
        name: 'AmaDeLlaves',
        component: () => import('src/pages/Nomenclators/AmaDeLlave.vue')
      },
      {
        path: 'Habitaciones',
        name: 'Habitaciones',
        component: () => import('src/pages/Nomenclators/Habitacion.vue')
      },
      {
        path: 'Reservas',
        name: 'Reservas',
        component: () => import('src/pages/Nomenclators/Reserva.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/ErrorNotFound.vue')
  }
]

export default routes
