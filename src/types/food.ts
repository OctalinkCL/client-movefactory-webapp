export interface FoodCategory {
  id: string
  name: string
  created_at: string
}

export interface Food {
  id: string
  name: string
  category_id: string
  portion_grams: number
  portion_grams_cooked: number | null
  household_measure: string | null
  created_at: string
  category?: FoodCategory
}
