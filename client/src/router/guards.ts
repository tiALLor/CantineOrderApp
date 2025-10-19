import { useUserAuthStore } from '@/stores/userAuthStore'

export const authenticateUser = () => {
  const userAuthStore = useUserAuthStore()

  if (!userAuthStore.isAuthenticated) return { name: 'Login' }

  return true
}

export const authenticateChef = () => {
  const userAuthStore = useUserAuthStore()

  if (!userAuthStore.isAuthenticated) return { name: 'Login' }

  if (userAuthStore.authUser?.roleName !== 'chef') return { name: 'Menu' }

  return true
}

export const authenticateAdmin = () => {
  const userAuthStore = useUserAuthStore()
  if (!userAuthStore.isAuthenticated) return { name: 'Login' }

  if (userAuthStore.authUser?.roleName !== 'admin') return { name: 'Menu' }

  return true
}
