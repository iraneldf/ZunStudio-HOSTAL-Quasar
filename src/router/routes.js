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
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/ErrorNotFound.vue')
  }
]

export default routes
