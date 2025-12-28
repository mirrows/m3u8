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
    {
      path: '/tools',
      name: 'tools',
      component: () => import('@/pages/tools/index.vue'),
    },
    {
      path: '/combine',
      name: 'combine',
      component: () => import('@/pages/tools/combine.vue'),
    },
  ],
})

export default router
