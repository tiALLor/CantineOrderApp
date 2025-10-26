import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@server/shared/trpc'
import { apiBase } from '@/config'
import SuperJSON from 'superjson'
import { useUserAuthStore } from '@/stores/userAuthStore'

export const trpc = createTRPCProxyClient<AppRouter>({
  // auto convert Date <-> string
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: apiBase,

      // send the access token with every request
      headers: () => {
        // attach the access token to the request Authorization header
        const userAuthStore = useUserAuthStore()
        const accessToken = userAuthStore.accessToken
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },

      // implementation for usage of refresh tokens
      async fetch(url, options) {
        const parsedUrl = new URL(url.toString())
        const isRefreshCall = parsedUrl.pathname === '/api/v1/trpc/user.refreshToken'
        const isLoginCall = parsedUrl.pathname === '/api/v1/trpc/user.login'

        const requestOptions = {
          ...options,
          credentials: 'include' as RequestCredentials,
        }

        const response = await fetch(url, requestOptions)

        // try to refresh the token and repeat the call
        if (response.status === 401 && !isRefreshCall && !isLoginCall) {
          const userAuthStore = useUserAuthStore()
          try {
            // try to refresh the tokens with separate call
            await userAuthStore.refreshToken()

            // new options with refreshed accessToken
            const newOptions = {
              ...options,
              headers: {
                ...options?.headers,
                Authorization: `Bearer ${userAuthStore.accessToken}`,
              },
            }
            return fetch(url, newOptions)
          } catch (error) {
            userAuthStore.logout()
            window.location.href = '/login'
            // throw error
            console.error('Token refresh failed and user was logged out.', error)
            throw new Error('Authentication failed. User was logged out.')
          }
        }

        return response
      },
    }),
  ],
})
