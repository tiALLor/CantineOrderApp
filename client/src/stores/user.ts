import { trpc } from '@/trpc'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUserWithRoleName, UserInsertable } from '@server/shared/types'

export const useUserAuthStore = defineStore('auth', () => {
  const authToken = ref<string | null>(null)
  const authUser = computed<AuthUserWithRoleName | null>(() => {
    if (!authToken.value) return null

    try {
      const payload = JSON.parse(Buffer.from(authToken.value.split('.')[1], 'base64').toString())
      return payload.user as AuthUserWithRoleName
    } catch {
      return null
    }
  })

  const authUserId = computed(() => authUser.value?.id ?? null)
  const authUserRole = computed(() => authUser.value?.roleName ?? null)

  const isLoggedIn = computed(() => !!authToken.value)

  async function login(userLogin: { email: string; password: string }) {
    const result = await trpc.user.login.mutate(userLogin)

    authToken.value = result.accessToken
  }

  function logout() {
    authToken.value = null
  }

  return {
    authToken,
    authUser,
    authUserId,
    authUserRole,
    isLoggedIn,
    login,
    logout,
  }
})

export async function signup(userForm: UserInsertable): Promise<void> {
  await trpc.user.signup.mutate(userForm)
}
