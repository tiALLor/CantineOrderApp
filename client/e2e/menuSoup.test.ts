import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'

const userAsChef = fakeUser({
  roleName: 'chef',
})

const soupForTestFirst = fakeMeal({ type: 'soup' })
const soupForTestSecond = fakeMeal({ type: 'soup' })

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

    await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

    await page.getByRole('button', { name: 'Add soup' }).click()
    await expect(page.getByText('Add soup').nth(1)).toBeVisible()

    const form = page.getByRole('form', { name: 'mealForm' })
    // add first soup
    await form.locator('#mealName').fill(soupForTestFirst.name)
    await form.locator('#priceEUR').fill(String(soupForTestFirst.priceEur))
    await form.getByRole('button', { name: 'Add soup' }).click()
    // add Second soup
    await page.getByRole('button', { name: 'Add soup' }).first().click()
    await expect(page.getByText('Add soup').nth(1)).toBeVisible()

    await form.locator('#mealName').fill(soupForTestSecond.name)
    await form.locator('#priceEUR').fill(String(soupForTestSecond.priceEur))
    await form.getByRole('button', { name: 'Add soup' }).click()

    await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

    // Arrange menu part
    const menuLink = page.getByRole('link', { name: 'Menu' })
    //confirmation that the user role is chef
    await expect(menuLink).toBeVisible()
    await menuLink.click()

    const calendar = page.getByLabel('calendar')

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()

    await expect(page.getByRole('button', { name: 'Add soup' })).toBeEnabled()

    // Arrange menu part
    await page.getByRole('button', { name: 'Add soup' }).click()
    await expect(page.getByLabel('Add Menu Modal Header soup')).toBeVisible()

    // Then (ASSERT)
    await page.locator('label').filter({ hasText: soupForTestFirst.name }).click()

    await page.getByRole('button', { name: 'Add soup to menu' }).click()

    await expect(page.getByTestId(`row-${soupForTestFirst.name}`)).toBeVisible()

    await page.getByRole('button', { name: 'Add soup' }).click()
    await expect(page.locator('label').filter({ hasText: soupForTestFirst.name })).not.toBeVisible()

    await page.locator('label').filter({ hasText: soupForTestSecond.name }).click()
    await page.getByRole('button', { name: 'Add soup to menu' }).click()


    await expect(page.getByTestId(`row-${soupForTestFirst.name}`)).toBeVisible()
    await expect(page.getByTestId(`row-${soupForTestSecond.name}`)).toBeVisible()

    // Assert Remove
    await page
      .getByTestId(`row-${soupForTestFirst.name}`)
      .getByRole('button', { name: 'remove' })
      .click()


    await expect(page.getByTestId(`row-${soupForTestFirst.name}`)).not.toBeVisible()

    // assert persist changes
    const todayLabel = formatDateLabel(new Date())

    // If today is not visible, click the button to move calendar to previous week
    if (!(await calendar.getByLabel(todayLabel).isVisible())) {
      await calendar.locator('button').first().click()
    }
    await expect(calendar.getByLabel(todayLabel)).toBeVisible()
    await calendar.getByLabel(todayLabel).click()

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()
    await expect(page.getByTestId(`row-${soupForTestSecond.name}`)).toBeVisible()
  })
})
