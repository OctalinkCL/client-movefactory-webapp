import type { Food } from './food'

export interface UserFoodSelection {
  id: string
  user_id: string
  meal_plan_item_id: string
  food_id: string
  day_of_week: number
  slot_index: number
  created_at: string
  food?: Food
  meal_plan_item?: { portion: string | null }
}
