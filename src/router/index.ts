import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/pages/main/index.vue'),
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('@/pages/download/index.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('@/pages/setting/index.vue'),
    },
  ],
})

export default router
