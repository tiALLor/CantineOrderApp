import { trpc } from '@/trpc'
import { jwtDecode } from 'jwt-decode'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserPublic, UserInsertable, AuthUserWithRoleName } from '@server/shared/types'

type JwtPayload = {
  user: AuthUserWithRoleName
  exp?: number
  iat?: number
}

type LoginResponse = {
  user: UserPublic
  accessToken: string
}

export const useUserAuthStore = defineStore('auth', () => {
  const authUser = ref<AuthUserWithRoleName | null>(null)
  // access token stored in memory
  const accessToken = ref<string | null>(sessionStorage.getItem('accessToken'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!authUser.value && !!accessToken.value)

  // ===========================================
  // login
  // ===========================================
  async function login(userLogin: { email: string; password: string }): Promise<LoginResponse> {
    try {
      isLoading.value = true
      error.value

      const response = await trpc.user.login.mutate(userLogin)

      accessToken.value = response.accessToken
      // access token stored in memory
      sessionStorage.setItem('accessToken', response.accessToken)

      const decodedPayload = jwtDecode<JwtPayload>(accessToken.value)

      if (!decodedPayload?.user) {
        throw new Error('Token does not contain valid user data.')
      }
      authUser.value = decodedPayload.user
      if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
        accessToken.value = null
        authUser.value = null
        throw new Error('Authentication token has expired.')
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ===========================================
  // signup
  // ===========================================
  async function signup(userForm: UserInsertable): Promise<UserPublic> {
    try {
      isLoading.value = true
      error.value = null

      const response = await trpc.user.signup.mutate(userForm)

      return response
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ===========================================
  // refreshToken
  // ===========================================
  async function refreshToken(): Promise<{ accessToken: string }> {
    try {
      const response = await trpc.user.refreshToken.mutate({})

      accessToken.value = response.accessToken

      sessionStorage.setItem('accessToken', response.accessToken)

      return response
    } catch (err) {
      logout()
      throw err
    }
  }

  // ===========================================
  // logout
  // ===========================================
  async function logout() {
    try {
      // can be used for sessions on server side but not implemented
      // await trpc.user.logout.mutate()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authUser.value = null
      accessToken.value = null
      sessionStorage.removeItem('accessToken')
    }
  }

  // ===========================================
  // getCurrentUser
  // ===========================================
  async function getCurrentUser() {
    try {
      if (!accessToken.value) return null
      const currentUser = await trpc.user.authMe.mutate({})
      authUser.value = currentUser

      refreshToken()

      return currentUser
    } catch (error) {
      console.error('Get current user error:', error)
      logout()
      return null
    }
  }

  return {
    authUser,
    accessToken,
    isAuthenticated,
    login,
    signup,
    refreshToken,
    logout,
    getCurrentUser,
  }
})
