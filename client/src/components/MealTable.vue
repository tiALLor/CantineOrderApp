<script setup lang="ts">
import { trpc } from '@/trpc'
import { onMounted, ref, watch } from 'vue' // Import 'watch'
import { FwbButton, FwbSpinner, FwbPagination } from 'flowbite-vue'
import type { MealPublic, MealType } from '@server/shared/types'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import MealModalBody from '@/components/MealModalBody.vue'
import { useMealStore } from '@/stores/mealStore'

const mealCache = useMealStore()

// --- Props ---
const props = defineProps<{
  type: MealType
}>()

// --- State Management ---
const meals = ref<MealPublic[]>([])
const loading = ref(false)
const hasSucceeded = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

const isShowMealModal = ref(false)
const modalTitle = ref('')
const mealId = ref<number | undefined>()
const modalFunction = ref<'add' | 'update' | undefined>()

// Consolidated meal form state
const mealForm = ref<{
  name: string
  priceEur: string
  type: MealType
}>({
  name: '',
  priceEur: '',
  type: props.type,
})

// --- Data Fetching ---
const fetchMeals = async () => {
  loading.value = true
  clearAlerts()
  try {
    const result = await trpc.meal.getAllMealsByType.query({
      type: props.type,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    meals.value = result.meals
    totalPages.value = result.totalPages
  } catch (error) {
    console.error('Error fetching meals:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMeals)

watch(currentPage, () => {
  fetchMeals()
})

const clearAlerts = () => {
  errorMessage.value = ''
  hasSucceeded.value = false
}

// --- Modal Handlers ---
function showAddMealModal() {
  clearAlerts()
  modalTitle.value = `Add ${props.type}`
  modalFunction.value = 'add'
  mealId.value = undefined
  mealForm.value.type = props.type
  mealForm.value.name = ''
  mealForm.value.priceEur = ''
  isShowMealModal.value = true
}

function showEditMealModal(id: number, mealName: string, mealPrice: string) {
  clearAlerts()
  modalTitle.value = `Update ${props.type}`
  modalFunction.value = 'update'
  mealId.value = id
  mealForm.value.type = props.type
  mealForm.value.name = mealName
  mealForm.value.priceEur = mealPrice
  isShowMealModal.value = true
}

function closeMealModal() {
  isShowMealModal.value = false
  mealForm.value.name = ''
  mealForm.value.priceEur = ''
}

// --- TRPC Mutations ---
const [deleteMeal, errorMessage] = useErrorMessage(async (mealId: number) => {
  clearAlerts()
  await trpc.meal.removeMeal.mutate({ id: mealId })
  await fetchMeals()
  hasSucceeded.value = true
  // invalidate cache
  mealCache.invalidateCache(props.type)
})

// --- Success Handler for Modal (after add/update) ---
const handleModalSuccess = async (action: 'add' | 'update') => {
  closeMealModal()
  //    if the user was not already on the first page.
  if (currentPage.value !== 1 && action === 'add') {
    currentPage.value = 1
  } else {
    // Re-fetch the list
    await fetchMeals()
  }
  hasSucceeded.value = true
  // invalidate cache
  mealCache.invalidateCache(props.type)
}
</script>

<template>
  <div class="p-5">
    <fwb-button color="default" @click="showAddMealModal()">Add {{ props.type }}</fwb-button>
  </div>

  <AlertMessages
    :showSuccess="hasSucceeded"
    successMessage="Operation successful."
    :errorMessage="errorMessage"
    @clearMessages="clearAlerts"
  />

  <div v-if="loading" class="my-8 text-center">
    <FwbSpinner size="8" />
    <p class="mt-2 text-gray-500">Loading meals...</p>
  </div>

  <div v-else-if="meals.length === 0" class="my-8 text-center text-gray-500">
    No {{ props.type }} meals found.
  </div>

  <div v-else>
    <div class="max-h-[55vh] space-y-2 overflow-y-auto pb-4">
      <div
        v-for="meal in meals"
        :key="meal.id"
        class="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-3 shadow-sm sm:flex-row sm:items-center"
        :data-testId="`row-${meal.name}`"
      >
        <div class="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <div class="text-lg font-medium text-gray-900">{{ meal.name }}</div>

          <div class="px-5 py-2 text-sm text-gray-500">{{ meal.priceEur }} €</div>
        </div>

        <div class="mt-2 flex w-full gap-2 sm:mt-0 sm:w-auto">
          <fwb-button
            size="sm"
            color="purple"
            @click.prevent="showEditMealModal(meal.id, meal.name, meal.priceEur)"
          >
            Update
          </fwb-button>

          <fwb-button size="sm" color="pink" @click="deleteMeal(meal.id)"> Delete </fwb-button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-center">
      <FwbPagination
        v-model="currentPage"
        :total-pages="totalPages"
        :show-icons="true"
        :per-page="pageSize"
      />
    </div>
  </div>

  <div>
    <MealModalBody
      :isShowModal="isShowMealModal"
      :title="modalTitle"
      :mealId="mealId"
      :type="props.type"
      :modalFunction="modalFunction"
      :mealForm="mealForm"
      @close-modal="closeMealModal"
      @success="handleModalSuccess"
    />
  </div>
</template>
