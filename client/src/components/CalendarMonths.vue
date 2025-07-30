<script setup lang="ts">
import { ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

type monthData = {
  month: number
  year: number
}

const props = defineProps<{
  selectedMonth: monthData
}>()

const emit = defineEmits<{
  (e: 'monthUpdated', newMonthData: monthData): void
}>()

// Date object for month/year
const calendarMonth = ref<monthData>({
  month: props.selectedMonth.month,
  year: props.selectedMonth.year,
})

watch(calendarMonth, (newMonthData) => {
  emit('monthUpdated', newMonthData)
})
</script>

<template>
  <div class="mx-auto mt-1 max-w-xs">
    <VueDatePicker v-model="calendarMonth" month-picker required />
  </div>
</template>
