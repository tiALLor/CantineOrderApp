<script setup lang="ts">
import { trpc } from '@/trpc'
import { computed, ref, watch } from 'vue'
import { FwbButton, FwbModal, FwbInput } from 'flowbite-vue'
import PageForm from '@/components/PageForm.vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { MealType } from '@server/shared/types'

type MealFormType = {
  name: string
  priceEur: string
  type: MealType
}

const props = defineProps<{
  isShowModal: boolean
  mealId?: number
  title: string
  type: MealType
  modalFunction: 'add' | 'update' | undefined
  mealForm: MealFormType
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'success', action: 'add' | 'update'): void
}>()

const hasSucceeded = ref(false)

const successMessage = ref<string>()

watch(
  () => props.isShowModal,
  (isOpen) => {
    if (isOpen) {
      hasSucceeded.value = false
      errorMessage.value = ''
    }
  }
)

const formState = computed(() => props.mealForm)

const [submit, errorMessage] = useErrorMessage(async () => {
  clearAlerts()

  const formValues = props.mealForm // Use the reactive prop directly

  if (props.modalFunction === 'add') {
    await trpc.meal.createMeal.mutate(formValues)
    successMessage.value = `Meal ${formValues.name} created.`
  } else if (props.modalFunction === 'update' && props.mealId) {
    await trpc.meal.updateMeal.mutate({ id: props.mealId, mealData: formValues })
    successMessage.value = `Meal ${formValues.name} updated.`
  } else {
    throw new Error('Internal server Error: Invalid modal function or missing mealId.')
  }

  hasSucceeded.value = true
  emit('success', props.modalFunction)
})

const clearAlerts = () => {
  errorMessage.value = '' // Clears the error message
  hasSucceeded.value = false // Hides the success message
}
</script>

<template>
  <fwb-modal v-if="isShowModal" @close="$emit('closeModal')" :aria-label="`modal ${props.title}`">
    <template #header>
      <div class="flex items-center text-2xl">
        {{ title }}
      </div>
    </template>
    <template #body>
      <PageForm heading="Input the values" formLabel="mealForm" @submit="submit">
        <template #default>
          <FwbInput
            label="Meal name"
            id="mealName"
            name="mealName"
            type="text"
            v-model="formState.name"
            input-class="overflow-x-auto whitespace-nowrap"
            class="w-full"
            :required="true"
          />

          <FwbInput
            label="Meal Price in EUR"
            id="priceEUR"
            name="priceEUR"
            type="number"
            v-model.number="formState.priceEur"
            step="0.01"
            :min="0"
            :required="true"
          />

          <input type="hidden" :value="props.mealForm.type" name="mealType" />

          <AlertMessages
            :showSuccess="hasSucceeded"
            :successMessage="successMessage"
            :errorMessage="errorMessage"
          />

          <div class="grid">
            <FwbButton color="default" type="submit" size="xl">{{ title }}</FwbButton>
          </div>
        </template>
      </PageForm>
    </template>
  </fwb-modal>
</template>
