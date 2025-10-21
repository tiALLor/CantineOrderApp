<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
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

const formattedTitleDate = computed(() => {
  const dateForFormatting = new Date(selectedMonth.value.year, selectedMonth.value.month, 1)

  return format(dateForFormatting, 'yyyy-MM')
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
  <div class="mx-auto p-5 lg:w-1/2">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
      Summary of your orders {{ formattedTitleDate }}:
    </h2>
  </div>
  <div>
    <SummaryTable :selectedMonth="selectedMonth" />
  </div>
</template>
