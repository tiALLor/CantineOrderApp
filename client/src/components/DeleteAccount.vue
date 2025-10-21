<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { FwbInput, FwbButton, FwbAlert } from 'flowbite-vue'
import StdFooter from '@/components/StdFooter.vue'
import AlertMessages from '@/components/AlertMessages.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import { useUserAuthStore } from '@/stores/userAuthStore'
import router from '@/router'

const confirmWithPasswordForm = ref({
  password: '',
})

const hasSucceeded = ref(false)

// function, which creates an error message ref and handles the try/catch block
const [deleteAccount, errorMessage] = useErrorMessage(async () => {
  clearAlerts()

  await trpc.user.removeUser.mutate(confirmWithPasswordForm.value)

  hasSucceeded.value = true

  const userAuthStore = useUserAuthStore()

  userAuthStore.logout()

  router.push({ name: 'home' })
})

const clearAlerts = () => {
  errorMessage.value = '' // Clears the error message
  hasSucceeded.value = false // Hides the success message
}
</script>

<template>
  <PageForm heading="Delete Account" formLabel="deleteAccount" @submit="deleteAccount">
    <template #default>
      <FwbInput
        label="Confirm with your password"
        id="password"
        name="password"
        type="password"
        v-model="confirmWithPasswordForm.password"
        :required="true"
      />

      <FwbAlert class="!mb-6 !mt-2" type="danger" data-testid="warning-alert">
        You are about to permanently **delete your account**. This action cannot be undone.
      </FwbAlert>

      <AlertMessages
        :showSuccess="hasSucceeded"
        successMessage="You have successfully deleted the account. You have been logged out."
        :errorMessage="errorMessage"
      />

      <div class="grid">
        <FwbButton color="red" type="submit" size="xl">Delete account</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        <StdFooter :message="''" />
      </FwbAlert>
    </template>
  </PageForm>
</template>
