import { trpc } from '@/trpc'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUserWithRoleName, UserInsertable } from '@server/shared/types'

export const userAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const authUser = computed<AuthUserWithRoleName | null>(() => {
    if (!accessToken.value) return null

    try {
      const payload = JSON.parse(Buffer.from(accessToken.value.split('.')[1], 'base64').toString())
      return payload.user as AuthUserWithRoleName
    } catch {
      return null
    }
  })

  const authUserId = computed(() => authUser.value?.id ?? null)
  const authUserRole = computed(() => authUser.value?.role ?? null)

  async function login(userLogin: { email: string; password: string }) {
    accessToken.value = await trpc.user.login.mutate(userLogin)
  }

  function logout() {
    accessToken.value = null
  }

  return {
    accessToken,
    authUser,
    authUserId,
    authUserRole,
    login,
    logout,
  }
})

export async function signup(userForm: UserInsertable): Promise<void> {
  await trpc.user.signup.mutate(userForm)
}
