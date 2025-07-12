<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { useUserAuthStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const userAuthStore = useUserAuthStore()

const links = [{ label: 'Order a menu', name: 'OrderMenu' }]

function logoutUser() {
  userAuthStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
