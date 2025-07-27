import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticateUser, authenticateChef, authenticateAdmin } from './guards'

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
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: () => import('../views/LoginView.vue'),
    // },
    // {
    //   path: '/signup',
    //   name: 'Signup',
    //   component: () => import('../views/SignupView.vue'),
    // },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
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
      ],
    },
    {
      path: '',
      component: MainLayout,
      beforeEnter: [authenticateAdmin],
      children: [
        {
          path: '/createUser',
          name: 'CreateUser',
          component: () => import('../views/CreateUser.vue'),
        },
      ],
    },
    {
      path: '',
      component: MainLayout,
      beforeEnter: [authenticateChef],
      children: [
        {
          path: '/meal',
          name: 'Meal',
          component: () => import('../views/Meal.vue'),
        },
      ],
    },
    {
      path: '',
      component: MainLayout,
      beforeEnter: [authenticateUser],
      children: [
        {
          path: '/accountSettings',
          name: 'AccountSettings',
          component: () => import('../views/AccountSettings.vue'),
        },
      ],
    },
  ],
})

export default router
