import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'

const userAsChef = fakeUser({
  roleName: 'chef',
})

const mainForTestFirst = fakeMeal({ type: 'main' })
const mainForTestSecond = fakeMeal({ type: 'main' })

function formatDateLabel(date) {
  return (
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date) + ','
  )
}

test('user as chef can create and edit a menu', async ({ page }) => {
    // Given (ARRANGE)
    // Creates a user account with chef role
    await signInUser(userAsChef)
    // asUser will try to create same user but with role: user
    // account with the same email can not be created and
    // function will proceed with login
    await asUser(page, userAsChef, async () => {
      // Arrange
      const logoutLink = page.getByRole('link', { name: 'Logout' })
      //confirmation that the user is logged in
      await expect(logoutLink).toBeVisible()

      // Arrange meal part

      const mealLink = page.getByRole('link', { name: 'Meal' })
      await mealLink.click()

      const form = page.getByRole('form', { name: 'mealForm' })

      await page.locator('li').filter({ hasText: 'Mains' }).locator('div').click()

      await page.getByRole('button', { name: 'Add main' }).click()
      await expect(page.getByText('Add main').nth(1)).toBeVisible()

      // add first main
      await form.locator('#mealName').fill(mainForTestFirst.name)
      await form.locator('#priceEUR').fill(String(mainForTestFirst.priceEur))
      await form.getByRole('button', { name: 'Add main' }).click()
      // add Second main
      await form.locator('#mealName').fill(mainForTestSecond.name)
      await form.locator('#priceEUR').fill(String(mainForTestSecond.priceEur))
      await form.getByRole('button', { name: 'Add main' }).click()
      await page.getByLabel('close').click()

      // Arrange menu part
      const menuLink = page.getByRole('link', { name: 'Menu' })
      //confirmation that the user role is chef
      await expect(menuLink).toBeVisible()
      await menuLink.click()

      const calendar = page.getByLabel('calendar')

      await calendar.getByRole('button', { name: 'Tomorrow' }).click()

      await page.locator('li').filter({ hasText: 'Mains' }).locator('div').click()

      await expect(page.getByRole('button', { name: 'Add main' })).toBeEnabled()

      // Arrange menu part
      await page.getByRole('button', { name: 'Add main' }).click()
      await expect(page.getByLabel('Add Menu Modal Header main')).toBeVisible()

      // Then (ASSERT)
      await page.locator('label').filter({ hasText: mainForTestFirst.name }).click()

      await page.getByRole('button', { name: 'Add meal to menu' }).click()

      const successMessage = page.getByTestId('successMessage')
      await expect(successMessage).toBeVisible()

      await page.getByLabel('close').click()

      await expect(page.getByTestId(`row-${mainForTestFirst.name}`)).toBeVisible()

      await page.getByRole('button', { name: 'Add main' }).click()
      await expect(
        page.locator('label').filter({ hasText: mainForTestFirst.name })
      ).not.toBeVisible()

      await page.locator('label').filter({ hasText: mainForTestSecond.name }).click()
      await page.getByRole('button', { name: 'Add meal to menu' }).click()

      await page.getByLabel('close').click()

      await expect(page.getByTestId(`row-${mainForTestFirst.name}`)).toBeVisible()
      await expect(page.getByTestId(`row-${mainForTestSecond.name}`)).toBeVisible()

      // Assert Remove
      await page
        .getByTestId(`row-${mainForTestFirst.name}`)
        .getByRole('button', { name: 'remove' })
        .click()

      await expect(successMessage).toBeVisible()

      await expect(page.getByTestId(`row-${mainForTestFirst.name}`)).not.toBeVisible()

      // assert persist changes
      const todayLabel = formatDateLabel(new Date())

      // If today is not visible, click the button to move calendar to previous week
      if (!(await calendar.getByLabel(todayLabel).isVisible())) {
        await calendar.locator('button').first().click()
      }
      await expect(calendar.getByLabel(todayLabel)).toBeVisible()
      await calendar.getByLabel(todayLabel).click()

      await calendar.getByRole('button', { name: 'Tomorrow' }).click()
      await expect(page.getByTestId(`row-${mainForTestSecond.name}`)).toBeVisible()
    })
  })
