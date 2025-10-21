import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'

const userAsUser = fakeUser({})

const userAsChef = fakeUser({
  roleName: 'chef',
})

test('user can place and change a order', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('our menu')).toBeVisible()

  // await signInUser(userAsChef)

  await asUser(page, userAsUser, async () => {
    // Arrange
    const logoutLink = page.getByRole('link', { name: 'Logout' })
    //confirmation that the user is logged in
    await expect(logoutLink).toBeVisible()

    const summaryLink = page.getByRole('link', { name: 'Your orders' })
    await summaryLink.click()

    await expect(page.locator('[data-test-id="dp-input"]')).toBeVisible()
    await expect(page.getByRole('heading', { name: ', you have ordered meals for' })).toBeVisible()
  })
})
