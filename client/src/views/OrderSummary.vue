<script setup lang="ts">
import { ref } from 'vue'
import CalendarMonths from '@/components/CalendarMonths.vue'
import SummaryTable from '@/components/SummaryTable.vue'

type monthData = {
  month: number
  year: number
}

const selectedMonth = ref<monthData>({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
})
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="lg:w-1/2">
      <CalendarMonths
        :selectedMonth="selectedMonth"
        @month-updated="(newMonthData: monthData) => (selectedMonth = newMonthData)"
      />
    </div>
  </div>
  <div class="p-5">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
      Summary of your orders {{ selectedMonth.year }}-{{
        (selectedMonth.month + 1).toString().padStart(2, '0')
      }}:
    </h2>
  </div>
  <div>
    <SummaryTable :selectedMonth="selectedMonth" />
  </div>
</template>
