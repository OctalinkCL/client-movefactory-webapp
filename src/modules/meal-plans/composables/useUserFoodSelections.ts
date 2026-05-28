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

  return { selections, fetchForDay, getSelection, saveSelection }
}
