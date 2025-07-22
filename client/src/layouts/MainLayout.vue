<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { useUserAuthStore } from '@/stores/user'
import { logout } from '@/utils/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userAuthStore = useUserAuthStore()

const links = computed(() => [
  { label: 'Menu', name: 'Home' },

  ...(userAuthStore.isLoggedIn
    ? [{ label: 'Order a menu', name: 'OrderMenu' }]
    : [
        { label: 'Login', name: 'Login' },
        { label: 'Signup', name: 'Signup' },
      ]),
])

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="userAuthStore.isLoggedIn" @click.prevent="logoutUser" link="#"
        >Logout</FwbNavbarLink
      >
    </template>
  </StackedLayout>
</template>
