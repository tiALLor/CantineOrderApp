<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  FwbButton,
  FwbA,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
} from 'flowbite-vue'
import type { MealPublic, MealType } from '@server/shared/types'
import { trpc } from '@/trpc'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import MealModalBody from '@/components/MealModalBody.vue'

const { type } = defineProps<{
  type: MealType
}>()

const meals = ref<MealPublic[]>([])

const fetchMeals = async () => {
  meals.value = await trpc.meal.getAllMealsByType.mutate({ type: type })
}

const isShowAddMealModal = ref(false)

const modalTitle = ref('')

const mealId = ref<number | undefined>()

const modalFunction = ref<'add' | 'update' | undefined>()

function showAddMealModal(mealType: MealType) {
  modalTitle.value = `Add ${type}`
  // if (id) mealId.value = id
  modalFunction.value = 'add'
  mealForm.value.type = mealType
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
  console.log(id)
  console.log(mealId.value)
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
  <div class="max-h-[60vh] overflow-y-auto">
    <FwbTable striped :aria-label="`table ${type}`" class="table-auto">
      <FwbTableHead>
        <FwbTableHeadCell>Meal name</FwbTableHeadCell>
        <FwbTableHeadCell>Price [EUR]</FwbTableHeadCell>
        <FwbTableHeadCell>
          <span class="sr-only">Edit</span>
        </FwbTableHeadCell>
        <FwbTableHeadCell>
          <span class="sr-only">Delete</span>
        </FwbTableHeadCell>
      </FwbTableHead>
      <FwbTableBody>
        <FwbTableRow v-for="meal in meals" :key="meal.id">
          <FwbTableCell>
            {{ meal.name }}
          </FwbTableCell>
          <FwbTableCell>
            {{ meal.priceEur }}
          </FwbTableCell>
          <fwb-table-cell>
            <fwb-a
              href="#"
              @click.prevent="showEditMealModal(type, meal.id, meal.name, meal.priceEur)"
            >
              Update
            </fwb-a>
          </fwb-table-cell>
          <fwb-table-cell>
            <fwb-a href="#" @click.prevent="deleteMeal(meal.id)"> Delete </fwb-a>
          </fwb-table-cell>
        </FwbTableRow>
      </FwbTableBody>
    </FwbTable>
  </div>
  <AlertMessages
    :showSuccess="hasSucceeded"
    successMessage="Meal deleted."
    :errorMessage="errorMessage"
  />
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
</template>
