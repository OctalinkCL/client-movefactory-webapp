import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Food, FoodCategory } from '@/types/food'

export function useFoods() {
  const foods = ref<Food[]>([])
  const categories = ref<FoodCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFoods() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('foods')
      .select('*, category:food_categories(id, name)')
      .order('name')
    if (err) error.value = err.message
    else foods.value = data ?? []
    loading.value = false
  }

  async function fetchCategories() {
    const { data } = await supabase.from('food_categories').select('*').order('name')
    categories.value = data ?? []
  }

  type FoodInput = Omit<Food, 'id' | 'created_at' | 'category' | 'is_active'>

  async function createFood(fields: FoodInput) {
    const { data, error: err } = await supabase
      .from('foods')
      .insert(fields)
      .select('*, category:food_categories(id, name)')
      .single()
    if (err) { error.value = err.message; return false }
    foods.value.push(data)
    foods.value.sort((a, b) => a.name.localeCompare(b.name))
    return true
  }

  async function updateFood(id: string, fields: FoodInput) {
    const { data, error: err } = await supabase
      .from('foods')
      .update(fields)
      .eq('id', id)
      .select('*, category:food_categories(id, name)')
      .single()
    if (err) { error.value = err.message; return false }
    const idx = foods.value.findIndex(f => f.id === id)
    if (idx !== -1) foods.value[idx] = data
    return true
  }

  // Soft-delete: desactivar un alimento lo saca del listado que se ofrece
  // al elegir, pero conserva las selecciones históricas de los alumnos.
  async function setActive(id: string, isActive: boolean) {
    const { data, error: err } = await supabase
      .from('foods')
      .update({ is_active: isActive })
      .eq('id', id)
      .select('*, category:food_categories(id, name)')
      .single()
    if (err) { error.value = err.message; return false }
    const idx = foods.value.findIndex(f => f.id === id)
    if (idx !== -1) foods.value[idx] = data
    return true
  }

  return { foods, categories, loading, error, fetchFoods, fetchCategories, createFood, updateFood, setActive }
}
