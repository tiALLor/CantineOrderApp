import { trpc } from '@/trpc'
import type { AuthUserWithRoleName, UserInsertable } from '@server/shared/types'
import { useUserAuthStore } from '@/stores/user'


export async function signup(userForm: UserInsertable): Promise<void> {
  await trpc.user.signup.mutate(userForm)
}

export async function login(userLogin: { email: string; password: string }) {
  const result = await trpc.user.login.mutate(userLogin)
  const authToken = result.accessToken
  const userAuthStore = useUserAuthStore()

  if (!authToken) {
    // TODO: check Error handling
    throw new Error('User is not logged in - no token')
  }

  try {
    const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString())
    const authUser = payload.user as AuthUserWithRoleName

    userAuthStore.storeTokenAndUser(authToken, authUser)
  } catch {
    userAuthStore.storeTokenAndUser(null, null)
    // TODO: check Error handling
    throw new Error('User is not logged in - user data not in token')
  }
}

export function logout() {
  const userAuthStore = useUserAuthStore()
  userAuthStore.clearTokenAndUser()
}
