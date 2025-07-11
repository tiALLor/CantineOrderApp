import { test, expect } from '@playwright/test'
import { fakeUser } from 'utils/fakeData'

const user = fakeUser()

// We are grouping these tests in a serial block to clearly
// indicate that these tests should be run in the provided order.
// However, ideally we would like to run each test in isolation.
// That would allow us to develop faster and to see more clearly
// which part of our flow is broken.
// In this particular case, we might want to run the signup and
// login tests one after the other because we want to make sure
// that the signup + login flow works.
test.describe.serial('signup and login sequence', () => {
  test('visitor can signup', async ({ page }) => {
    // Given (ARRANGE)
    await page.goto('/signup')
    const successMessage = page.getByTestId('successMessage')
    await expect(successMessage).toBeHidden() // sanity check

    // When (ACT)
    const form = page.getByRole('form', { name: 'Signup' })

    // We would prefer using getByRole, but flowbite components are
    // not linking labels with inputs
    await form.locator('input[data-testid="name"]').fill(user.name)
    await form.locator('input[type="email"]').fill(user.email)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    // Then (ASSERT)
    await expect(successMessage).toBeVisible()
  })
})
