<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref } from 'vue'
import { FwbButton, FwbSpinner } from 'flowbite-vue'
import type { MealPublic, MealType } from '@server/shared/types'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import MealModalBody from '@/components/MealModalBody.vue'

const { type } = defineProps<{
  type: MealType
}>()

const meals = ref<MealPublic[]>([])

const loading = ref(false)

const fetchMeals = async () => {
  loading.value = true
  try {
    meals.value = await trpc.meal.getAllMealsByType.mutate({ type: type })
  } finally {
    loading.value = false
  }
}

const isShowAddMealModal = ref(false)

const modalTitle = ref('')

const mealId = ref<number | undefined>()

const modalFunction = ref<'add' | 'update' | undefined>()

function showAddMealModal(mealType: MealType) {
  modalTitle.value = `Add ${type}`
  modalFunction.value = 'add'
  mealForm.value.type = mealType
  mealForm.value.name = ''
  mealForm.value.priceEur = ''
  isShowAddMealModal.value = true
}

function showEditMealModal(mealType: MealType, id: number, mealName: string, mealPrice: string) {
  modalTitle.value = `Update ${type}`
  mealId.value = id
  modalFunction.value = 'update'
  mealForm.value.type = mealType
  mealForm.value.name = mealName
  mealForm.value.priceEur = mealPrice
  isShowAddMealModal.value = true
}

function closeAddMealModal() {
  isShowAddMealModal.value = false
}

const mealForm = ref<{
  name: string
  priceEur: string
  type: MealType
}>({
  name: '',
  priceEur: '',
  type: 'soup',
})

const [deleteMeal, errorMessage] = useErrorMessage(async (mealId) => {
  await trpc.meal.removeMeal.mutate({ id: mealId })
  fetchMeals()
  hasSucceeded.value = true
})

const hasSucceeded = ref(false)

onMounted(fetchMeals)
</script>

<template>
  <div class="p-5">
    <fwb-button color="default" @click="showAddMealModal(type)">Add {{ type }}</fwb-button>
  </div>
  <AlertMessages
    :showSuccess="hasSucceeded"
    successMessage="Meal deleted."
    :errorMessage="errorMessage"
  />
  <div class="max-h-[55vh] space-y-2 overflow-y-auto">
    <div
      v-for="meal in meals"
      :key="meal.id"
      class="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-3 shadow-sm sm:flex-row sm:items-center"
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

      <div class="mt-2 flex w-full gap-2 sm:mt-0 sm:w-auto">
        <fwb-button
          size="sm"
          color="purple"
          @click.prevent="showEditMealModal(type, meal.id, meal.name, meal.priceEur)"
        >
          Update
        </fwb-button>
        <fwb-button size="sm" color="pink" @click="deleteMeal(meal.id)"> Delete </fwb-button>
      </div>
    </div>
  </div>

  <div>
    <MealModalBody
      :title="modalTitle"
      :isShowModal="isShowAddMealModal"
      :mealId="mealId"
      :mealName="mealForm.name"
      :priceEur="mealForm.priceEur"
      :type="type"
      :modalFunction="modalFunction"
      @close-modal="closeAddMealModal"
      @success="fetchMeals"
    />
  </div>
  <fwb-spinner v-if="loading" size="3" class="mx-auto my-4" />
</template>
