<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref, computed, watch } from 'vue'
import { FwbButton, FwbAlert } from 'flowbite-vue'
import type { MenuWithMeal, MealType } from '@server/shared/types'
import { isPast, startOfDay } from 'date-fns'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import MenuModalBody from '@/components/MenuModalBody.vue'
import { useUserAuthStore } from '@/stores/userAuthStore'
import { useMenuStore } from '@/stores/menuStore'

const userAuthStore = useUserAuthStore()
const menuCache = useMenuStore()

const props = defineProps<{
  type: MealType
  date: Date
}>()

const mealsInMenu = ref<MenuWithMeal[]>([])

const usedMealsIds = computed(() => (mealsInMenu.value ?? []).map((meal) => meal.mealId))

const isEditDisabled = computed(() => isPast(startOfDay(props.date)))

watch(
  () => props.date,
  () => {
    fetchMenu()
  }
)

const isShowAddToMenuModal = ref(false)

function showAddToMenuModal() {
  isShowAddToMenuModal.value = true
}

function closeAddToMenuModal() {
  isShowAddToMenuModal.value = false
}

async function fetchMenu() {
  mealsInMenu.value = await menuCache.getAllMenuByTypeDateFromStore(props.type, props.date)
}

const [removeMeal, errorMessage] = useErrorMessage(async (menuId) => {
  clearAlerts()

  //TODO: add isUsed check input: date, mealID in Orders
  await trpc.menu.removeMenuMeal.mutate({ id: menuId })
  hasSucceeded.value = true
  console.log('deleted meal from menu')
  menuCache.invalidateCache(props.type)
  fetchMenu()
})

const hasSucceeded = ref(false)

const clearAlerts = () => {
  errorMessage.value = '' // Clears the error message
  hasSucceeded.value = false // Hides the success message
}

onMounted(fetchMenu)
</script>

<template>
  <div v-if="userAuthStore.isAuthenticated">
    <div class="p-5">
      <fwb-button color="default" @click="showAddToMenuModal()" :disabled="isEditDisabled"
        >Add {{ type }}</fwb-button
      >
    </div>
    <fwb-alert
      type="warning"
      class="text-lg font-bold text-red-800 dark:text-red-400"
      :hidden="!isEditDisabled"
    >
      Menu can be changed only for future
    </fwb-alert>
    <AlertMessages
      :showSuccess="hasSucceeded"
      successMessage="Meal deleted."
      :errorMessage="errorMessage"
    />
  </div>
  <div class="max-h-[38vh] space-y-2 overflow-y-auto">
    <div
      v-for="meal in mealsInMenu"
      :key="meal.id"
      class="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-1.5 shadow-sm sm:flex-row sm:items-center"
      :data-testId="`row-${meal.name}`"
    >
      <!-- Meal Info: Name and Price -->
      <div class="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
        <div class="text-lg font-medium text-gray-900">
          {{ meal.name }}
        </div>
        <div class="px-5 py-2 text-sm text-gray-500">{{ meal.priceEur }} €</div>
      </div>

      <!-- Action Buttons -->
      <div v-if="userAuthStore.isAuthenticated" class="mt-2 flex w-full gap-2 sm:mt-0 sm:w-auto">
        <fwb-button size="sm" color="pink" @click="removeMeal(meal.id)" :disabled="isEditDisabled">
          Remove
        </fwb-button>
      </div>
    </div>
  </div>
  <div v-if="userAuthStore.isAuthenticated">
    <MenuModalBody
      :isShowModal="isShowAddToMenuModal"
      :date="date"
      :type="type"
      :usedMealsIds="usedMealsIds"
      @close-modal="closeAddToMenuModal"
      @success="fetchMenu"
    />
  </div>
</template>
