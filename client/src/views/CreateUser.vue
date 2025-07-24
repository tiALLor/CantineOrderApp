<script lang="ts" setup>
import { trpc } from '@/trpc'
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { FwbAlert, FwbInput, FwbSelect, FwbButton } from 'flowbite-vue'
import AlertError from '@/components/AlertError.vue'
import useErrorMessage from '@/composables/useErrorMessage'
import type { EntityRole } from '@server/shared/types'

const ROLES = ['admin', 'chef', 'user'] as const

const roles = ROLES.map((role) => ({
  value: role,
  name: role.charAt(0).toUpperCase() + role.slice(1),
}))

const userForm = ref({
  email: '',
  password: '',
  name: '',
  roleName: '',
})

const hasSucceeded = ref(false)

// function, which creates an error message ref and handles the try/catch block
const [submitCreateUser, errorMessage] = useErrorMessage(async () => {
  // await trpc.user.createUser.mutate(userForm.value)
  await trpc.user.createUser.mutate({
    ...userForm.value,
    roleName: userForm.value.roleName as EntityRole,
  })

  hasSucceeded.value = true
})
</script>

<template>
  <PageForm
    heading="Create user account for cantina use"
    formLabel="Create"
    @submit="submitCreateUser"
  >
    <template #default>
      <FwbInput
        data-testid="name"
        label="User Name"
        type="text"
        v-model="userForm.name"
        :required="true"
      />

      <FwbInput
        label="Email"
        type="email"
        autocomplete="username"
        v-model="userForm.email"
        :required="true"
      />

      <FwbInput
        label="Password"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        v-model="userForm.password"
        :required="true"
      />

      <FwbSelect
        data-testid="roleName"
        :options="roles"
        label="Select users role"
        v-model="userForm.roleName"
        :required="true"
      />

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully created a new user.
      </FwbAlert>
      <AlertError :message="errorMessage">
        {{ errorMessage }}
      </AlertError>
      <div class="grid">
        <FwbButton color="default" type="submit" size="xl">Create</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Create another user or go
        <RouterLink to="/" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          back home
        </RouterLink>
      </FwbAlert>
    </template>
  </PageForm>
</template>
