import { format } from 'date-fns'


export const dateAsString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}
