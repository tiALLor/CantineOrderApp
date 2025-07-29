import { test, expect } from '@playwright/test'
import { fakeUser, fakeMeal } from 'utils/fakeData'
import { signInUser, asUser } from 'utils/api'
import { logout } from '../../src/utils/auth'

const userAsUser = fakeUser({})

const userAsChef = fakeUser({
  roleName: 'chef',
})

const soupForTestFirst = fakeMeal({ type: 'soup' })
const soupForTestSecond = fakeMeal({ type: 'soup' })
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

test('user can place and change a order', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('our menu')).toBeVisible()

  await signInUser(userAsChef)

  await asUser(page, userAsChef, async () => {
    // Arrange
    const logoutLink = page.getByRole('link', { name: 'Logout' })
    //confirmation that the user is logged in
    await expect(logoutLink).toBeVisible()

    // Arrange meal part for soups
    const calendar = page.getByLabel('calendar')

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
    await form.locator('#mealName').fill(soupForTestSecond.name)
    await form.locator('#priceEUR').fill(String(soupForTestSecond.priceEur))
    await form.getByRole('button', { name: 'Add soup' }).click()
    await page.getByLabel('close').click()

    await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

    // Arrange meal part for soups
    await mealLink.click()

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

    // Arrange menu part - add soup
    const menuLink = page.getByRole('link', { name: 'Menu' })
    await menuLink.click()

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()
    await page.locator('li').filter({ hasText: 'Soups' }).locator('div').click()

    await page.getByRole('button', { name: 'Add soup' }).click()
    await expect(page.getByLabel('Add Menu Modal Header soup')).toBeVisible()

    await page.locator('label').filter({ hasText: soupForTestFirst.name }).click()
    await page.getByRole('button', { name: 'Add meal to menu' }).click()
    await page.locator('label').filter({ hasText: soupForTestSecond.name }).click()
    await page.getByRole('button', { name: 'Add meal to menu' }).click()
    await page.getByLabel('close').click()

    // Arrange menu part - add soup
    await page.locator('li').filter({ hasText: 'Mains' }).locator('div').click()
    await page.getByRole('button', { name: 'Add main' }).click()
    await expect(page.getByLabel('Add Menu Modal Header main')).toBeVisible()

    await page.locator('label').filter({ hasText: mainForTestFirst.name }).click()
    await page.getByRole('button', { name: 'Add meal to menu' }).click()
    await page.locator('label').filter({ hasText: mainForTestSecond.name }).click()
    await page.getByRole('button', { name: 'Add meal to menu' }).click()

    await page.getByLabel('close').click()

    await expect(page.getByTestId(`row-${mainForTestFirst.name}`)).toBeVisible()
    await expect(page.getByTestId(`row-${mainForTestSecond.name}`)).toBeVisible()

    // logout as chef
    const logout = page.getByRole('link', { name: 'Logout' })
    await logout.click()
  })

  await asUser(page, userAsUser, async () => {
    // Arrange menu part - add soup
    const orderLink = page.getByRole('link', { name: 'Home', exact: true })
    await orderLink.click()

    await page.locator('label').filter({ hasText: soupForTestSecond.name }).click()
    await page.locator('label').filter({ hasText: mainForTestSecond.name }).click()
    await page.getByRole('button', { name: 'Send your order or update' }).click()

    const successMessage = page.getByTestId('successMessage')
    await expect(successMessage).toBeVisible()

    await expect(page.getByTestId(`row-soup-${soupForTestSecond.name}`)).toBeChecked()
    await expect(page.getByTestId(`row-main-${mainForTestSecond.name}`)).toBeChecked()

    // assert persist changes
    const calendar = page.getByLabel('calendar')
    const todayLabel = formatDateLabel(new Date())

    // If today is not visible, click the button to move calendar to previous week
    if (!(await calendar.getByLabel(todayLabel).isVisible())) {
      await calendar.locator('button').first().click()
    }
    await expect(calendar.getByLabel(todayLabel)).toBeVisible()
    await calendar.getByLabel(todayLabel).click()

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()

    await expect(page.getByTestId(`row-soup-${soupForTestSecond.name}`)).toBeChecked()
    await expect(page.getByTestId(`row-main-${mainForTestSecond.name}`)).toBeChecked()

    //cancel order
    await page
      .getByLabel('order menu soup')
      .locator('label')
      .filter({ hasText: 'no order' })
      .click()
    await page.locator('label').filter({ hasText: mainForTestSecond.name }).click()
    await page.getByRole('button', { name: 'Send your order or update' }).click()

    await expect(successMessage).toBeVisible()

    await expect(page.getByTestId(`row-soup-no order`)).toBeChecked()
    await expect(page.getByTestId(`row-main-${mainForTestSecond.name}`)).toBeChecked()

    // assert persist changes
    // If today is not visible, click the button to move calendar to previous week
    if (!(await calendar.getByLabel(todayLabel).isVisible())) {
      await calendar.locator('button').first().click()
    }
    await expect(calendar.getByLabel(todayLabel)).toBeVisible()
    await calendar.getByLabel(todayLabel).click()

    await calendar.getByRole('button', { name: 'Tomorrow' }).click()

    await expect(page.getByTestId(`row-soup-no order`)).toBeChecked()
    await expect(page.getByTestId(`row-main-${mainForTestSecond.name}`)).toBeChecked()
  })
})
