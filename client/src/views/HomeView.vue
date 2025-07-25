<script setup lang="ts">
import { FwbButton } from 'flowbite-vue'
import { useUserAuthStore } from '@/stores/user'

const userAuthStore = useUserAuthStore()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="!userAuthStore.isLoggedIn" class="items-center lg:flex">
      <div class="lg:w-1/2">
        <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">Open blogging platform</h2>
        <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
          Hi! Join the community and start sharing your thoughts with the world. Sign up now and
          start writing your first article.
        </p>
        <div class="mt-6 flex items-center gap-2">
          <FwbButton component="RouterLink" tag="router-link" href="/signup">Sign up</FwbButton>
          <FwbButton component="RouterLink" tag="router-link" color="alternative" href="/login">
            Log in
          </FwbButton>
        </div>
      </div>
    </div>
  </div>
</template>
