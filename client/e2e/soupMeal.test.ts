import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'

const userAsChef = fakeUser({
  roleName: 'chef',
})

const soupForTest = fakeMeal({ type: 'soup' })

test.describe.serial('soup tests in sequence', () => {
  test('user as chef can create a soup', async ({ page }) => {
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
      await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

      await page.getByRole('button', { name: 'Add soup' }).click()
      await expect(page.getByText('Add soup').nth(1)).toBeVisible()

      const form = page.getByRole('form', { name: 'mealForm' })

      await form.locator('#mealName').fill(soupForTest.name)
      await form.locator('#priceEUR').fill(String(soupForTest.priceEur))
      await form.getByRole('button', { name: 'Add soup' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()

      await expect(page.getByRole('cell', { name: soupForTest.name })).toBeVisible()
    })
  })
  test('user as chef can edit soup', async ({ page }) => {
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

      await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

      await page
        .getByRole('row', { name: soupForTest.name })
        .getByRole('link', { name: 'update' })
        .click()

      const form = page.getByRole('form', { name: 'mealForm' })
      // update Price
      await form.locator('#priceEUR').fill(String(newPrice))
      await form.getByRole('button', { name: 'Update soup' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()
      await expect(
        page
          .getByRole('row', { name: soupForTest.name })
          .getByRole('cell', { name: String(newPrice) })
      ).toBeVisible()

      // update name
      await page
        .getByRole('row', { name: soupForTest.name })
        .getByRole('link', { name: 'update' })
        .click()

      await form.locator('#mealName').fill(newName)
      await form.getByRole('button', { name: 'Update soup' }).click()

      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()

      await expect(page.getByRole('cell', { name: newName })).toBeVisible()
    })
  })
  test('user as chef can delete soup', async ({ page }) => {
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

      await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

      await page.getByRole('row', { name: newName }).getByRole('link', { name: 'delete' }).click()

      // Then (ASSERT)
      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await expect(
        page.getByRole('row', { name: soupForTest.name }).getByRole('cell', { name: newName })
      ).not.toBeVisible()
    })
  })
})
