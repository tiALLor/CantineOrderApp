import { useUserAuthStore } from '@/stores/user'

const userAuthStore = useUserAuthStore()

export const authenticateUser = () => {
  if (!userAuthStore.isLoggedIn) return { name: 'Login' }

  return true
}

export const authenticateChef = () => {
  if (!userAuthStore.isLoggedIn) return { name: 'Login' }

  if (userAuthStore.authUser?.roleName !== 'chef') return { name: 'Menu' }

  return true
}

export const authenticateAdmin = () => {
  if (!userAuthStore.isLoggedIn) return { name: 'Login' }

  if (userAuthStore.authUser?.roleName !== 'admin') return { name: 'Menu' }

  return true
}
