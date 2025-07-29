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
} from 'flowbite-vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { MealPublic, MealType } from '@server/shared/types'

const props = defineProps<{
  date: Date
  type: MealType
  usedMealsIds: number[]
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'submit'): void
  (e: 'success'): void
}>()

const meals = ref<MealPublic[]>([])

const picked = ref<string>()

const loading = ref(false)

const fetchMeals = async () => {
  loading.value = true
  try {
    const usedIds = new Set(props.usedMealsIds ?? [])
    let data = await trpc.meal.getAllMealsByType.mutate({ type: props.type })
    meals.value = data.filter((meal) => !usedIds.has(meal.id))
  } finally {
    loading.value = false
  }
}

const [addMealToMenu, errorMessage] = useErrorMessage(async () => {
  await trpc.menu.addMenuMeal.mutate({
    date: props.date,
    mealId: Number(picked.value),
  })

  emit('success')
  hasSucceeded.value = true
})

watch(
  () => props.isShowModal,
  (isOpen) => {
    if (isOpen) {
      picked.value = undefined
      hasSucceeded.value = false
      errorMessage.value = ''
      fetchMeals()
    }
  }
)

const hasSucceeded = ref(false)
</script>

<template>
  <fwb-modal v-if="isShowModal" @close="$emit('closeModal')">
    <template #header>
      <div class="flex items-center text-2xl" :aria-label="`Add Menu Modal Header ${props.type}`">
        Please choose a meal for the menu
      </div>
    </template>
    <template #body>
      <div class="pb-5">
        <fwb-button class="mt-4 w-full" @click="addMealToMenu" :disabled="!picked">
          Add Meal to Menu
        </fwb-button>
        <AlertMessages
          :showSuccess="hasSucceeded"
          successMessage="Meal added."
          :errorMessage="errorMessage"
        />
      </div>
      <div class="max-h-[70vh] overflow-y-auto">
        <fwb-list-group aria-label="pick meal" class="w-full">
          <fwb-list-group-item v-for="meal in meals" :key="meal.id" class="w-full px-0">
            <div class="flex w-full items-center px-4">
              <fwb-radio
                v-model="picked"
                :label="meal.name"
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
  <fwb-spinner v-if="loading" size="3" class="mx-auto my-4" />
</template>
