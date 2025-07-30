<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, watch } from 'vue'
import { FwbButton, FwbModal, FwbInput } from 'flowbite-vue'
import PageForm from '@/components/PageForm.vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { MealType } from '@server/shared/types'

const props = defineProps<{
  mealId?: number
  title: string
  mealName: string
  priceEur: string
  type: MealType
  isShowModal: boolean
  modalFunction: 'add' | 'update' | undefined
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'submit'): void
  (e: 'success'): void
}>()

const hasSucceeded = ref(false)

const successMessage = ref<string>()

const mealForm = ref({
  name: '',
  priceEur: '',
  type: props.type,
})

watch(
  () => props.isShowModal,
  (isOpen) => {
    if (isOpen) {
      hasSucceeded.value = false
      successMessage.value = undefined
      mealForm.value.name = props.mealName
      mealForm.value.priceEur = props.priceEur
      mealForm.value.type = props.type
    }
  }
)

const [submit, errorMessage] = useErrorMessage(async () => {
  if (props.modalFunction === 'add') {
    await trpc.meal.createMeal.mutate(mealForm.value)
    successMessage.value = `Meal ${mealForm.value.name} created.`
  } else if (props.modalFunction === 'update' && props.mealId) {
    await trpc.meal.updateMeal.mutate({ id: props.mealId, mealData: mealForm.value })
    successMessage.value = `Meal ${mealForm.value.name} updated.`
  } else {
    throw new Error('Internal server Error, function')
  }

  hasSucceeded.value = true
  emit('success')
})
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
            v-model="mealForm.name"
            input-class="overflow-x-auto whitespace-nowrap"
            class="w-full"
            :required="true"
          />

          <FwbInput
            label="Meal Price in EUR"
            id="priceEUR"
            name="priceEUR"
            type="number"
            v-model.number="mealForm.priceEur"
            step="0.01"
            :required="true"
          />

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
