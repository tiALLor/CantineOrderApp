import { router } from '@server/trpc'
import createOrderForMenu from './createOrderForMenu'
import updateOrder from './updateOrder'
import getOrderByUserDates from './getOrderByUserDates'
import getMonthlyCosts from './getMonthlyCosts'

export default router({
  createOrderForMenu,
  updateOrder,
  getOrderByUserDates,
  getMonthlyCosts,
})
