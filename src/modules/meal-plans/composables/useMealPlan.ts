import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { MealPlan } from '@/types/meal-plan'

const PLAN_SELECT = `
  *,
  meal_plan_moments (
    *,
    moment:moments(*),
    meal_plan_items (*)
  )
`

export function useMealPlan() {
  const plan = ref<MealPlan | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrCreatePlan(userId: string) {
    loading.value = true
    error.value = null

    const { data: existing } = await supabase
      .from('meal_plans')
      .select(PLAN_SELECT)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      plan.value = existing
      loading.value = false
      return
    }

    const { data: created, error: createError } = await supabase
      .from('meal_plans')
      .insert({ user_id: userId })
      .select(PLAN_SELECT)
      .single()

    if (createError) error.value = createError.message
    else plan.value = created
    loading.value = false
  }

  async function createMoment(
    planId: string,
    name: string | null,
    momentId: string,
    days: number[],
    note: string | undefined,
    items: { foodType: string; portion: string }[]
  ) {
    const { data: newMoment, error: err } = await supabase
      .from('meal_plan_moments')
      .insert({ meal_plan_id: planId, name: name || null, moment_id: momentId, days, note: note || null })
      .select('*, moment:moments(*)')
      .single()

    if (err) { error.value = err.message; return }

    newMoment.meal_plan_items = []

    if (items.length) {
      const { data: newItems } = await supabase
        .from('meal_plan_items')
        .insert(items.map(item => ({
          meal_plan_moment_id: newMoment.id,
          food_type: item.foodType,
          portion: item.portion === 'libre' ? null : item.portion,
          is_free_choice: false,
        })))
        .select()
      newMoment.meal_plan_items = newItems ?? []
    }

    if (!plan.value!.meal_plan_moments) plan.value!.meal_plan_moments = []
    plan.value!.meal_plan_moments.push(newMoment)
  }

  async function removeMoment(momentId: string) {
    const { error: err } = await supabase.from('meal_plan_moments').delete().eq('id', momentId)
    if (err) { error.value = err.message; return }
    if (plan.value?.meal_plan_moments)
      plan.value.meal_plan_moments = plan.value.meal_plan_moments.filter(m => m.id !== momentId)
  }

  async function removeItem(itemId: string, planMomentId: string) {
    const { error: err } = await supabase.from('meal_plan_items').delete().eq('id', itemId)
    if (err) { error.value = err.message; return }
    const moment = plan.value?.meal_plan_moments?.find(m => m.id === planMomentId)
    if (moment?.meal_plan_items)
      moment.meal_plan_items = moment.meal_plan_items.filter(i => i.id !== itemId)
  }

  return { plan, loading, error, fetchOrCreatePlan, createMoment, removeMoment, removeItem }
}
