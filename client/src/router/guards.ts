import { useUserAuthStore } from '@/stores/user'

const userAuthStore = useUserAuthStore()

export const authenticate = () => {
  if (!userAuthStore.isLoggedIn) return { name: 'Login' }

  return true
}
