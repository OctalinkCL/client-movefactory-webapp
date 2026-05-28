import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { UserFoodSelection } from '@/types/food-selection'

export function useUserFoodSelections() {
  const selections = ref<UserFoodSelection[]>([])

  async function fetchForDay(userId: string, dayOfWeek: number) {
    const { data } = await supabase
      .from('user_food_selections')
      .select('*, food:foods(*)')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
    selections.value = data ?? []
  }

  function getSelection(mealPlanItemId: string): UserFoodSelection | null {
    return selections.value.find(s => s.meal_plan_item_id === mealPlanItemId) ?? null
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

    const idx = selections.value.findIndex(s => s.meal_plan_item_id === mealPlanItemId)
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

    const { error } = await supabase.from('user_food_selections').insert(records)
    return !error
  }

  return { selections, fetchForDay, getSelection, saveSelection, copySelectionsForMoment }
}
