import { menuRepository } from '@server/repositories/menuRepository'
import { publicProcedure } from '@server/trpc/index'
import provideRepos from '@server/trpc/provideRepos'
import {
  menuSchemaGetByTypeDates,
  type GroupedMenus,
} from '@server/entities/menu'

export default publicProcedure
  .use(provideRepos({ menuRepository }))
  .input(menuSchemaGetByTypeDates)
  .mutation(
    async ({ input: menuData, ctx: { repos } }): Promise<GroupedMenus> => {
      const menus = await repos.menuRepository.getMenuByTypeByDate(menuData)

      const groupedByDate = menus.reduce(
        (acc, menu) => {
          // if returned date could be a string
          // const dateKey =
          //   typeof menu.date === 'string'
          //     ? menu.date
          //     : menu.date.toISOString().slice(0, 10)

          const dateKey = menu.date.toISOString().slice(0, 10)

          acc[dateKey] ??= []
          acc[dateKey].push(menu)
          return acc
        },
        {} as Record<string, typeof menus>
      )

      return groupedByDate
    }
  )
