import { trpc } from '@/trpc'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { GroupedMenus, MealType, MenuWithMeal } from '@server/shared/types'
import { dateAsString } from '@/utils/dates'

export const useMenuStore = defineStore('menu', () => {
  const soups = ref<MenuWithMeal[]>([])
  const mains = ref<MenuWithMeal[]>([])

  const cachedDate = ref<Record<MealType, Date | undefined>>({
    soup: undefined,
    main: undefined,
  })

  const isUpToDate = ref<Record<MealType, boolean>>({
    soup: false,
    main: false,
  })

  // Set cache duration (1 minute)
  const CACHE_DURATION_MS = 60000

  async function fetchAndCacheMenu(type: MealType, date: Date): Promise<MenuWithMeal[]> {
    const dateStr = dateAsString(date)
    const cachedDateStr = cachedDate.value[type] ? dateAsString(cachedDate.value[type]!) : undefined

    let targetRef

    switch (type) {
      case 'soup':
        targetRef = soups
        break
      case 'main':
        targetRef = mains
        break
      default:
        throw new Error(`Invalid meal type: ${type}`)
    }

    if (dateStr === cachedDateStr && isUpToDate.value[type]) {
      return targetRef.value
    }

    try {
      const result: GroupedMenus = await trpc.menu.getMenuByTypeDates.query({ type, dates: [date] })

      const mealsInMenu = result[dateStr]

      targetRef.value = mealsInMenu

      cachedDate.value[type] = date

      // Set validity and schedule invalidation
      isUpToDate.value[type] = true

      setTimeout(() => {
        isUpToDate.value[type] = false // Invalidate cache after 1 minute
      }, CACHE_DURATION_MS)

      return mealsInMenu
    } catch (e) {
      console.error(`Error fetching ${type}s:`, e)
      throw new Error(`Failed to fetch ${type}s.`)
    }
  }

  async function getAllMenuByTypeDateFromStore(
    type: MealType,
    date: Date
  ): Promise<MenuWithMeal[]> {
    if (type !== 'soup' && type !== 'main') {
      throw new Error(`Invalid meal type: ${type}`)
    }
    return fetchAndCacheMenu(type, date)
  }
  //  manually invalidate cache if needed (e.g., after changes in menu)
  function invalidateCache(type: MealType) {
    if (isUpToDate.value[type] !== undefined) isUpToDate.value[type] = false
  }

  return {
    soups,
    mains,
    isUpToDate,
    getAllMenuByTypeDateFromStore,
    invalidateCache,
  }
})
