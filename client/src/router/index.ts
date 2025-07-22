import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
// import { authenticateUser, authenticateChef, authenticateAdmin } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/dashboard',
    //   component: MainLayout,
    //   beforeEnter: [authenticateUser],
    //   children: [
    //     {
    //       path: 'write-article',
    //       name: 'WriteArticle',
    //       component: () => import('../views/WriteArticle.vue'),
    //     },
    //   ],
    // },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
      ],
    },
  ],
})

export default router
