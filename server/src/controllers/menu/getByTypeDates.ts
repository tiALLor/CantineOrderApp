const groupedByDate = meals.reduce(
  (acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = []
    acc[meal.date].push(meal)
    return acc
  },
  {} as Record<string, typeof meals>
)
