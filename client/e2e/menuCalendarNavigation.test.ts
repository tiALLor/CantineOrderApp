import { test, expect } from '@playwright/test'
import { fakeUser } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'
import { addDays } from 'date-fns'

const userAsChef = fakeUser({
  roleName: 'chef',
})

const tomorrow = addDays(new Date(), 1)

function formatDateLabel(date) {
  return (
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date) + ','
  )
}

test('user as chef can navigate thru dates', async ({ page }) => {
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

    // Arrange menu part
    const menuLink = page.getByRole('link', { name: 'Menu' })
    //confirmation that the user role is chef
    await expect(menuLink).toBeVisible()
    await menuLink.click()

    const calendar = page.getByLabel('calendar')
    await expect(calendar.getByLabel(formatDateLabel(tomorrow))).toBeVisible()

    const todayLabel = formatDateLabel(new Date())

    // If today is not visible, click the button to move calendar to previous week
    if (!(await calendar.getByLabel(todayLabel).isVisible())) {
      await calendar.locator('button').first().click()
    }
    await expect(calendar.getByLabel(todayLabel)).toBeVisible()

    await calendar.getByLabel(todayLabel).click()

    await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

    // Then (ASSERT)
    await expect(page.getByRole('button', { name: 'Add soup' })).toBeDisabled()

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()

    const tomorrowLabel = formatDateLabel(tomorrow)

    await expect(calendar.getByLabel(tomorrowLabel)).toBeVisible()

    await expect(page.getByRole('button', { name: 'Add soup' })).toBeEnabled()
  })
})
