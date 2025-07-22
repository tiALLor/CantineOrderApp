import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@server/shared/trpc'
import { apiBase } from '@/config'
import SuperJSON from 'superjson'
import { useUserAuthStore } from '@/stores/user'

const userAuthStore = useUserAuthStore()

export const trpc = createTRPCProxyClient<AppRouter>({
  // auto convert Date <-> string
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: apiBase,

      // send the access token with every request
      headers: () => {
        // TODO: attach the access token to the request Authorization header
        const accessToken = userAuthStore.authToken
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },
    }),
  ],
})
