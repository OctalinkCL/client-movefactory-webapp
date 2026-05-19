import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/nutricionista',
      name: 'nutricionista',
      component: () => import('@/views/NutricionistaView.vue'),
      meta: { requiresAuth: true, role: 'nutricionista' },
    },
    {
      path: '/usuario',
      name: 'usuario',
      component: () => import('@/views/UsuarioView.vue'),
      meta: { requiresAuth: true, role: 'usuario' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
