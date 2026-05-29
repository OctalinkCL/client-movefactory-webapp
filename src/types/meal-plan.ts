export interface Moment {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface MealPlanItem {
  id: string
  meal_plan_moment_id: string
  food_type: string
  portion: string | null
  is_free_choice: boolean
  created_at: string
}

export interface MealPlanMoment {
  id: string
  meal_plan_id: string
  days: number[]
  name: string | null
  moment_id: string
  note: string | null
  created_at: string
  moment?: Moment
  meal_plan_items?: MealPlanItem[]
}

export interface MealPlan {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  meal_plan_moments?: MealPlanMoment[]
}
