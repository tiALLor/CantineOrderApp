<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref, watch, computed } from 'vue'
import type { PriceEurSchema, OrderWithUserMeal } from '@server/shared/types'
import { format } from 'date-fns'

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
    userOrderSummary.value = await trpc.order.getMonthlyCosts.query({
      year: props.selectedMonth.year,
      month: props.selectedMonth.month + 1,
    })

    let responseOrders = await trpc.order.getOrderByUserDates.query({
      dates: getDatesInMonth(props.selectedMonth.year, props.selectedMonth.month + 1),
    })
    ordersPerMonth.value = responseOrders
      .filter((order) => order.mainMealId || order.soupMealId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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

const formattedMonth = computed(() => {
  // Create a date for the first day of the month for easy formatting
  const dateForFormatting = new Date(props.selectedMonth.year, props.selectedMonth.month, 1)
  return format(dateForFormatting, 'yyyy-MM')
})

const formattedTotalCost = computed(() => {
  const cost = parseFloat(userOrderSummary.value.priceEur)

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost)
})

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
      In {{ formattedMonth }}, you have ordered meals for {{ formattedTotalCost }}
    </h2>
  </div>
  <div class="max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border p-5 shadow-inner">
    <div
      v-for="order in ordersPerMonth"
      :key="order.id"
      :data-testId="`row-${order.date}`"
      class="border-b pb-3 pt-3 first:pt-0 last:border-b-0"
    >
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
        {{ order.date }}
      </h3>

      <div class="mt-2 text-sm text-gray-600">
        <span class="font-semibold">Soup: </span>
        <span v-if="order.soupMealName">
          {{ order.soupMealName }} ({{ order.soupMealPrice }} €)
        </span>
        <span v-else class="text-gray-400">— Not Ordered —</span>
      </div>

      <div class="mt-1 text-sm text-gray-600">
        <span class="font-semibold">Main: </span>
        <span v-if="order.mainMealName">
          {{ order.mainMealName }} ({{ order.mainMealPrice }} €)
        </span>
        <span v-else class="text-gray-400">— Not Ordered —</span>
      </div>
    </div>

    <div v-if="ordersPerMonth.length === 0" class="py-10 text-center text-gray-500">
      You have no orders for {{ formattedMonth }}.
    </div>
  </div>
</template>
