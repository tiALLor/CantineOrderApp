<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref, watch } from 'vue'
import type { PriceEurSchema, OrderWithUserMeal } from '@server/shared/types'

type monthData = {
  month: number
  year: number
}

const props = defineProps<{
  selectedMonth: monthData
}>()

const userOrderSummary = ref<PriceEurSchema>({
  priceEur: '0',
})

const ordersPerMonth = ref<OrderWithUserMeal[]>([])

async function fetchSummaryAndOrders() {
  try {
    userOrderSummary.value = await trpc.order.getMonthlyCosts.mutate({
      year: props.selectedMonth.year,
      month: props.selectedMonth.month + 1,
    })

    let responseOrders = await trpc.order.getOrderByUserDates.mutate({
      dates: getDatesInMonth(props.selectedMonth.year, props.selectedMonth.month + 1),
    })
    ordersPerMonth.value = responseOrders.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  } catch (error) {
    console.log(error)
  }
}

function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = []
  // number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(Date.UTC(year, month - 1, day)))
  }

  return dates
}

watch(
  () => props.selectedMonth,
  () => {
    fetchSummaryAndOrders()
  }
)

onMounted(() => {
  fetchSummaryAndOrders()
})
</script>

<template>
  <div class="p-5">
    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
      Summary of your orders for {{ selectedMonth.year }}-{{
        (selectedMonth.month + 1).toString().padStart(2, '0')
      }},
      <br />
      you have ordered meals for {{ userOrderSummary.priceEur }} €
    </h2>
  </div>
  <div
    v-for="order in ordersPerMonth"
    :key="order.id"
    :data-testId="`row-${order.date}`"
    class="max-h-[38vh] space-y-2 overflow-y-auto border p-3"
  >
    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
      {{ order.date }}
    </h3>
    <div class="text-m flex items-center p-2" :aria-label="`Soup`">Soup:</div>
    <div
      class="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-1.5 shadow-sm sm:flex-row sm:items-center"
    >
      <!-- Meal Info: Name and Price -->
      <div
        class="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
        v-if="order.soupMealName"
      >
        <div class="text-lg font-medium text-gray-900">
          {{ order.soupMealName }}
        </div>
        <div class="px-5 py-2 text-sm text-gray-500">{{ order.soupMealPrice }} €</div>
      </div>
    </div>
    <div class="text-m flex items-center p-2" :aria-label="`Main`">Main:</div>
    <div
      class="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-1.5 shadow-sm sm:flex-row sm:items-center"
    >
      <!-- Meal Info: Name and Price -->
      <div class="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
        <div class="text-lg font-medium text-gray-900">
          {{ order.mainMealName }}
        </div>
        <div class="px-5 py-2 text-sm text-gray-500">{{ order.mainMealPrice }} €</div>
      </div>
    </div>
  </div>
</template>
