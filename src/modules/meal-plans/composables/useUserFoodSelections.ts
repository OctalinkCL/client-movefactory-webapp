import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { UserFoodSelection } from '@/types/food-selection'

export function useUserFoodSelections() {
  const selections = ref<UserFoodSelection[]>([])

  async function fetchAll(userId: string) {
    const { data } = await supabase
      .from('user_food_selections')
      .select('*, food:foods(*, category:food_categories(id, name))')
      .eq('user_id', userId)
    selections.value = data ?? []
  }

  function getSelection(mealPlanItemId: string, day: number): UserFoodSelection | null {
    return selections.value.find(
      s => s.meal_plan_item_id === mealPlanItemId && s.day_of_week === day
    ) ?? null
  }

  async function saveSelection(userId: string, mealPlanItemId: string, foodId: string, dayOfWeek: number) {
    await supabase
      .from('user_food_selections')
      .delete()
      .eq('user_id', userId)
      .eq('meal_plan_item_id', mealPlanItemId)
      .eq('day_of_week', dayOfWeek)

    const { data, error } = await supabase
      .from('user_food_selections')
      .insert({ user_id: userId, meal_plan_item_id: mealPlanItemId, food_id: foodId, day_of_week: dayOfWeek })
      .select('*, food:foods(*)')
      .single()

    if (error) return false

    const idx = selections.value.findIndex(
      s => s.meal_plan_item_id === mealPlanItemId && s.day_of_week === dayOfWeek
    )
    if (idx !== -1) selections.value[idx] = data
    else selections.value.push(data)
    return true
  }

  async function copySelectionsForMoment(
    userId: string,
    itemIds: string[],
    sourceSelections: UserFoodSelection[],
    targetDays: number[]
  ) {
    if (!sourceSelections.length || !targetDays.length || !itemIds.length) return false

    await supabase
      .from('user_food_selections')
      .delete()
      .eq('user_id', userId)
      .in('meal_plan_item_id', itemIds)
      .in('day_of_week', targetDays)

    const records = targetDays.flatMap(day =>
      sourceSelections.map(s => ({
        user_id: userId,
        meal_plan_item_id: s.meal_plan_item_id,
        food_id: s.food_id,
        day_of_week: day,
      }))
    )

    const { data, error } = await supabase
      .from('user_food_selections')
      .insert(records)
      .select('*, food:foods(*)')

    if (error) return false

    // remove old entries for target days and push new ones
    selections.value = [
      ...selections.value.filter(
        s => !(itemIds.includes(s.meal_plan_item_id) && targetDays.includes(s.day_of_week))
      ),
      ...(data ?? []),
    ]
    return true
  }

  return { selections, fetchAll, getSelection, saveSelection, copySelectionsForMoment }
}
