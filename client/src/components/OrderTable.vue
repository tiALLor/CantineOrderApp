<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, watch, onMounted, computed } from 'vue'
import { FwbListGroup, FwbListGroupItem, FwbRadio, FwbButton, FwbSpinner } from 'flowbite-vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { MenuWithMeal } from '@server/shared/types'
import { format } from 'date-fns'

const props = defineProps<{
  date: Date
}>()

const soups = ref<MenuWithMeal[]>([])

const mains = ref<MenuWithMeal[]>([])

const pickedSoup = ref<string | undefined>()

const pickedMain = ref<string | undefined>()

const loading = ref(false)

const dateAsString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}
const isEditDisabled = computed(() => (props.date > new Date() ? false : true))

const fetchMealsAndOrders = async () => {
  loading.value = true
  try {
    let responseSoup = await trpc.menu.getMenuByTypeDates.mutate({
      type: 'soup',
      dates: [props.date],
    })
    soups.value = responseSoup[dateAsString(props.date)] ?? []
    let responseMain = await trpc.menu.getMenuByTypeDates.mutate({
      type: 'main',
      dates: [props.date],
    })
    mains.value = responseMain[dateAsString(props.date)] ?? []

    let responseOrder = await trpc.order.getOrderByUserDates.mutate({ dates: [props.date] })
    let dayData = responseOrder.find((d) => dateAsString(d.date) === dateAsString(props.date))
    pickedSoup.value = dayData?.soupMealId?.toString() ?? 'none'
    pickedMain.value = dayData?.mainMealId?.toString() ?? 'none'
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const [updateOrder, errorMessage] = useErrorMessage(async () => {
  hasSucceeded.value = false
  errorMessage.value = ''
  let submitData = {
    date: props.date,
    soupMealId: pickedSoup.value === 'none' ? null : Number(pickedSoup.value),
    mainMealId: pickedMain.value === 'none' ? null : Number(pickedMain.value),
  }
  await trpc.order.updateOrder.mutate(submitData)

  hasSucceeded.value = true
})

watch(
  () => props.date,
  (dateUpdated) => {
    if (dateUpdated) {
      pickedSoup.value = undefined
      pickedMain.value = undefined
      hasSucceeded.value = false
      errorMessage.value = ''
      fetchMealsAndOrders()
    }
  }
)

const hasSucceeded = ref(false)

onMounted(() => {
  fetchMealsAndOrders()
})
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
      <fwb-spinner size="3" />
    </div>
    <div>
      <div class="pb-5">
        <fwb-button class="mt-4 w-full" @click="updateOrder" :disabled="isEditDisabled">
          Send your order or update
        </fwb-button>
        <AlertMessages
          :showSuccess="hasSucceeded"
          successMessage="Menu ordered."
          :errorMessage="errorMessage"
        />
      </div>
      <div
        class="flex flex-col gap-4 rounded-lg border border-gray-200 p-1.5 shadow-sm sm:flex-row"
      >
        <div class="flex-1 sm:max-h-[40vh] sm:overflow-y-auto">
          <div class="text-m flex items-center p-2" :aria-label="`Order menu`">
            Your order for soup:
          </div>
          <fwb-list-group aria-label="order menu soup" class="w-full">
            <fwb-list-group-item class="w-full px-0">
              <div class="flex w-full items-center px-4">
                <fwb-radio
                  v-model="pickedSoup"
                  :label="'no order'"
                  name="soup meal menu list radio"
                  :value="'none'"
                  class="w-full"
                  label-class="w-full text-left"
                  :data-testId="`row-soup-no order`"
                  :disabled="isEditDisabled"
                />
              </div>
            </fwb-list-group-item>
            <fwb-list-group-item v-for="soup in soups" :key="soup.id" class="w-full px-0">
              <div class="flex w-full items-center px-4">
                <fwb-radio
                  v-model="pickedSoup"
                  :label="`${soup.name} for ${soup.priceEur}€`"
                  name="soup meal menu list radio"
                  :value="soup.mealId.toString()"
                  class="w-full"
                  label-class="w-full text-left"
                  :data-testId="`row-soup-${soup.name}`"
                  :disabled="isEditDisabled"
                />
              </div>
            </fwb-list-group-item>
          </fwb-list-group>
        </div>
        <div class="flex-1 sm:max-h-[40vh] sm:overflow-y-auto">
          <div class="text-m flex items-center p-2" :aria-label="`Order menu`">
            Your order for main:
          </div>
          <fwb-list-group aria-label="order menu main" class="w-full">
            <fwb-list-group-item class="w-full px-0">
              <div class="flex w-full items-center px-4">
                <fwb-radio
                  v-model="pickedMain"
                  :label="'no order'"
                  name="main meal menu list radio"
                  :value="'none'"
                  class="w-full"
                  label-class="w-full text-left"
                  :data-testId="`row-main-no order`"
                  :disabled="isEditDisabled"
                />
              </div>
            </fwb-list-group-item>
            <fwb-list-group-item v-for="mainMeal in mains" :key="mainMeal.id" class="w-full px-0">
              <div class="flex w-full items-center px-4">
                <fwb-radio
                  v-model="pickedMain"
                  :label="`${mainMeal.name} for ${mainMeal.priceEur}€`"
                  name="main meal menu list radio"
                  :value="mainMeal.mealId.toString()"
                  class="w-full"
                  label-class="w-full text-left"
                  :data-testId="`row-main-${mainMeal.name}`"
                  :disabled="isEditDisabled"
                />
              </div>
            </fwb-list-group-item>
          </fwb-list-group>
        </div>
      </div>
    </div>
  </div>
</template>
