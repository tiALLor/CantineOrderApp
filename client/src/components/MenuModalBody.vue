<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, watch } from 'vue'
import {
  FwbModal,
  FwbListGroup,
  FwbListGroupItem,
  FwbRadio,
  FwbButton,
  FwbSpinner,
  FwbInput
} from 'flowbite-vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { MealPublic, MealType } from '@server/shared/types'
import { useMealStore } from '@/stores/mealStore'
import { useMenuStore } from '@/stores/menuStore'

const mealCache = useMealStore()
const menuCache = useMenuStore()

const props = defineProps<{
  date: Date
  type: MealType
  usedMealsIds: number[]
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'success'): void
}>()

const meals = ref<MealPublic[]>([])
const totalMealsAvailable = ref(0)
const picked = ref<string>()

const searchQuery = ref('')

const loading = ref(false)
const hasSucceeded = ref(false)

const clearAlerts = () => {
  errorMessage.value = ''
  hasSucceeded.value = false
}

const fetchMeals = async () => {
  loading.value = true

  // Clear messages before fetching new data
  clearAlerts()
  picked.value = undefined

  try {
    const usedIds = new Set(props.usedMealsIds ?? [])

    const allMeals = await mealCache.getAllMealsByTypeFromStore(props.type, searchQuery.value)

    totalMealsAvailable.value = allMeals.length

    meals.value = allMeals.filter((meal) => !usedIds.has(meal.id))
  } catch (e) {
    console.error('Error fetching meals:', e)
    totalMealsAvailable.value = 0
  } finally {
    loading.value = false
  }
}

const [addMealToMenu, errorMessage] = useErrorMessage(async () => {
  clearAlerts()

  if (!picked.value) return

  await trpc.menu.addMenuMeal.mutate({
    date: props.date,
    mealId: Number(picked.value),
  })

  hasSucceeded.value = true
  menuCache.invalidateCache(props.type)
  emit('success')
  emit('closeModal')
  // Clear picked value after successful submission
  picked.value = undefined
  fetchMeals()
})

watch(
  () => props.isShowModal,
  (isOpen) => {
    if (isOpen) {
      picked.value = undefined
      hasSucceeded.value = false
      errorMessage.value = ''
      searchQuery.value = ''
      fetchMeals()
    }
  }
)

watch(searchQuery, fetchMeals)
</script>

<template>
  <fwb-modal v-if="isShowModal" @close="$emit('closeModal')">
    <template #header>
      <div class="flex items-center text-2xl" :aria-label="`Add Menu Modal Header ${props.type}`">
        Please choose a {{ props.type }} for the menu
      </div>
    </template>

    <template #body>
      <fwb-input
        v-model="searchQuery"
        placeholder="Search in meals by name..."
        type="search"
        size="sm"
        class="mt-3"
      />
      <div class="pb-5">
        <fwb-button class="mt-4 w-full" @click="addMealToMenu" :disabled="!picked">
          Add {{ props.type }} to Menu
        </fwb-button>

        <AlertMessages
          :showSuccess="hasSucceeded"
          successMessage="Meal added."
          :errorMessage="errorMessage"
          @clearMessages="clearAlerts"
        />
      </div>

      <div v-if="loading" class="my-8 flex justify-center">
        <FwbSpinner size="8" />
      </div>

      <div
        v-else-if="meals.length === 0 && totalMealsAvailable > 0"
        class="my-4 text-center text-gray-500"
      >
        All existing {{ props.type }} meals are already on the menu.
      </div>
      <div
        v-else-if="meals.length === 0 && totalMealsAvailable === 0 && searchQuery.length > 0"
        class="my-4 text-center text-gray-500"
      >
        There are no {{ props.type }} meals meeting search pattern.
      </div>
      <div
        v-else-if="meals.length === 0 && totalMealsAvailable === 0 && searchQuery.length === 0"
        class="my-4 text-center text-gray-500"
      >
        There are no {{ props.type }} meals defined in the system.
      </div>

      <div v-else class="max-h-[65vh] overflow-y-auto">
        <fwb-list-group aria-label="pick meal" class="w-full">
          <fwb-list-group-item v-for="meal in meals" :key="meal.id" class="w-full px-0">
            <div class="flex w-full items-center px-4">
              <fwb-radio
                v-model="picked"
                :label="`${meal.name} (${meal.priceEur} €)`"
                name="menu list radio"
                :value="meal.id.toString()"
                class="w-full"
                label-class="w-full text-left"
              />
            </div>
          </fwb-list-group-item>
        </fwb-list-group>
      </div>
    </template>
  </fwb-modal>
</template>
