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

watch(calendarDate, (newDate) => {
  emit('dateUpdated', newDate)
})

const moveToTomorrow = () => {
  const newDate = new Date()
  newDate.setDate(newDate.getDate() + 1)
  calendarDate.value = newDate
}
</script>

<template>
  <div>
    <VDatePicker
      v-model="calendarDate"
      expanded
      is-dark="system"
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
