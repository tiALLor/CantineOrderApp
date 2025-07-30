import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'

const userAsChef = fakeUser({
  roleName: 'chef',
})

const mainForTest = fakeMeal({ type: 'main' })

test.describe.serial('main tests in sequence', () => {
  test('user as chef can create a main', async ({ page }) => {
    // Given (ARRANGE)
    // Creates a user account with chef role
    await signInUser(userAsChef)
    // asUser will try to create same user but with role: user
    // account with the same email can not be created and
    // function will proceed with login
    await asUser(page, userAsChef, async () => {
      const logoutLink = page.getByRole('link', { name: 'Logout' })
      //confirmation that the user is logged in
      await expect(logoutLink).toBeVisible()

      const mealLink = page.getByRole('link', { name: 'Meal' })
      //confirmation that the user role is chef
      await expect(mealLink).toBeVisible()
      await mealLink.click()
      await page.locator('li').filter({ hasText: 'mains' }).locator('div').click()

      await page.getByRole('button', { name: 'Add main' }).click()
      await expect(page.getByText('Add main').nth(1)).toBeVisible()

      const form = page.getByRole('form', { name: 'mealForm' })

      await form.locator('#mealName').fill(mainForTest.name)
      await form.locator('#priceEUR').fill(String(mainForTest.priceEur))
      await form.getByRole('button', { name: 'Add main' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()

      await expect(page.getByTestId(`row-${mainForTest.name}`)).toBeVisible()
    })
  })
  test('user as chef can edit main', async ({ page }) => {
    const newPrice = 999.99
    const newName = 'new Name'
    await signInUser(userAsChef)
    await asUser(page, userAsChef, async () => {
      const logoutLink = page.getByRole('link', { name: 'Logout' })
      //confirmation that the user is logged in
      await expect(logoutLink).toBeVisible()

      const mealLink = page.getByRole('link', { name: 'Meal' })
      //confirmation that the user role is chef
      await expect(mealLink).toBeVisible()
      await mealLink.click()

      await page.locator('li').filter({ hasText: 'mains' }).locator('div').click()

      await page.getByTestId(`row-${mainForTest.name}`).getByRole('button', { name: 'update' }).click()

      const form = page.getByRole('form', { name: 'mealForm' })
      // update Price
      await form.locator('#priceEUR').fill(String(newPrice))
      await form.getByRole('button', { name: 'Update main' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()
      await expect(page.getByTestId(`row-${mainForTest.name}`).getByText(String(newPrice))).toBeVisible()

      // update name
      await page.getByTestId(`row-${mainForTest.name}`).getByRole('button', { name: 'update' }).click()

      await form.locator('#mealName').fill(newName)
      await form.getByRole('button', { name: 'Update main' }).click()

      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()

      await expect(page.getByTestId(`row-${newName}`)).toBeVisible()
    })
  })
  test('user as chef can delete main', async ({ page }) => {
    const newName = 'new Name'
    await signInUser(userAsChef)
    await asUser(page, userAsChef, async () => {
      const logoutLink = page.getByRole('link', { name: 'Logout' })
      //confirmation that the user is logged in
      await expect(logoutLink).toBeVisible()

      const mealLink = page.getByRole('link', { name: 'Meal' })
      //confirmation that the user role is chef
      await expect(mealLink).toBeVisible()
      await mealLink.click()

      await page.locator('li').filter({ hasText: 'mains' }).locator('div').click()

      await page.getByTestId(`row-${newName}`).getByRole('button', { name: 'delete' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await expect(page.getByTestId(`row-${newName}`)).not.toBeVisible()
    })
  })
})

