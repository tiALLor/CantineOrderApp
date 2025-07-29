<script setup lang="ts">
import { ref } from 'vue'
import { FwbTab, FwbTabs } from 'flowbite-vue'
import { addDays, format } from 'date-fns'
import type { MealType } from '@server/shared/types'
import Calendar from '@/components/Calendar.vue'
import MenuTable from '@/components/MenuTable.vue'

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

const date = ref(addDays(new Date(), 1))
const minDate = ref(undefined)
const maxDate = ref(undefined)
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="lg:w-1/2">
      <Calendar
        :date="date"
        :minDate="minDate"
        :maxDate="maxDate"
        @dateUpdated="(newDate) => (date = newDate)"
      />
    </div>
  </div>
  <div class="p-5">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
      Create Menu for {{ format(date, 'yyyy-MM-dd') }}:
    </h2>
  </div>
  <fwb-tabs v-model="activeTab" variant="underline" class="p-5">
    <fwb-tab v-for="tab in tabs" :key="tab.title" :name="tab.name" :title="tab.title">
      <MenuTable :type="tab.mealType" :date="date" />
    </fwb-tab>
  </fwb-tabs>
</template>
