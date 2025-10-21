<script setup lang="ts">
import { FwbAlert } from 'flowbite-vue'

const props = defineProps<{
  message: string
}>()
</script>

<template>
  <FwbAlert class="bg-transparent text-center">
    {{ props.message }}
    <RouterLink to="/" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
      back home
    </RouterLink>
  </FwbAlert>
</template>
