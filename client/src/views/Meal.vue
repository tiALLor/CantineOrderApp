<script setup lang="ts">
import { ref } from 'vue'
import { FwbTab, FwbTabs } from 'flowbite-vue'
import MealTable from '@/components/MealTable.vue'
import type { MealType } from '@server/shared/types'

type tab = {
  name: string
  title: string
  mealType: MealType
}

const tabs: tab[] = [
  { name: 'soup', title: 'Soups', mealType: 'soup' },
  { name: 'main', title: 'Mains', mealType: 'main' },
]

const activeTab = ref('soup')
</script>

<template>
  <div class="p-5">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
      Manage meals: add ... update ... delete
    </h2>
    <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
      Attention: You can delete only a meal not used in menu.
    </p>
  </div>
  <fwb-tabs v-model="activeTab" variant="underline" class="p-5">
    <fwb-tab v-for="tab in tabs" :key="tab.title" :name="tab.name" :title="tab.title">
      <MealTable :type="tab.mealType" />
    </fwb-tab>
  </fwb-tabs>
</template>
