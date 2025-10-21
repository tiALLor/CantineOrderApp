import { trpc } from '@/trpc'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MealPublic, MealType } from '@server/shared/types'

export const useMealStore = defineStore('meal', () => {
  const soups = ref<MealPublic[]>([])
  const mains = ref<MealPublic[]>([])

  const isUpToDate = ref<Record<MealType, boolean>>({
    soup: false,
    main: false,
  })

  // Set cache duration (1 minute)
  const CACHE_DURATION_MS = 60000

  async function fetchAndCacheMeals(type: MealType, search?: string): Promise<MealPublic[]> {
    let mealList: MealPublic[]

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

    mealList = targetRef.value

    if (!isUpToDate.value[type] || mealList.length === 0) {
      try {
        const result = await trpc.meal.getAllMealsByType.query({ type: type })
        mealList = result.meals

        targetRef.value = mealList

        // Set validity and schedule invalidation
        isUpToDate.value[type] = true
        setTimeout(() => {
          isUpToDate.value[type] = false
        }, CACHE_DURATION_MS)
      } catch (e) {
        console.error(`Error fetching ${type}s:`, e)
        // Returning current data if available as fallback
        if (targetRef.value.length) return targetRef.value
        throw new Error(`Failed to fetch ${type}s.`)
      }
    }

    if (search) {
      const lowerCaseSearch = search.toLowerCase().trim()
      return mealList.filter((meal) => meal.name.toLowerCase().includes(lowerCaseSearch))
    }

    return mealList
  }

  async function getAllMealsByTypeFromStore(
    type: MealType,
    search?: string
  ): Promise<MealPublic[]> {
    if (type !== 'soup' && type !== 'main') {
      throw new Error(`Invalid meal type: ${type}`)
    }
    return fetchAndCacheMeals(type, search)
  }
  //  manually invalidate cache if needed (e.g., after creating a new meal)
  function invalidateCache(type: MealType) {
    if (isUpToDate.value[type] !== undefined) isUpToDate.value[type] = false
  }

  return {
    soups,
    mains,
    isUpToDate,
    getAllMealsByTypeFromStore,
    invalidateCache,
  }
})
