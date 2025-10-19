<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  date: Date
  minDate?: Date
  maxDate?: Date
}>()

const emit = defineEmits<{
  (e: 'dateUpdated', newdate: Date): void
}>()

const calendarDate = ref<Date>(props.date)
const datePickerKey = ref(0) // Key for forcing redraw

watch(calendarDate, (newDate) => {
  emit('dateUpdated', newDate)
})

const moveToTomorrow = () => {
  const newDate = new Date()
  newDate.setDate(newDate.getDate() + 1)
  calendarDate.value = newDate

  // Increment the key to force re-render
  datePickerKey.value++
}
</script>

<template>
  <div>
    <VDatePicker
      :key="datePickerKey"
      v-model="calendarDate"
      expanded
      is-required
      :is-dark="false"
      view="weekly"
      :min-date="props.minDate"
      :max-date="props.maxDate"
      :first-day-of-week="2"
      :masks="{ weekdays: 'WWW' }"
      aria-label="calendar"
    >
      <template #footer>
        <div class="w-full px-4 pb-3">
          <button
            class="w-full rounded-md bg-indigo-600 px-3 py-1 font-bold text-white hover:bg-indigo-700"
            @click="moveToTomorrow"
          >
            Tomorrow
          </button>
        </div>
      </template>
    </VDatePicker>
  </div>
</template>
