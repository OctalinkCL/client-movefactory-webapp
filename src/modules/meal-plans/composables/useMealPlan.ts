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

  async function addMoment(planId: string, day: number, momentId: string, note?: string) {
    const { data, error: err } = await supabase
      .from('meal_plan_moments')
      .insert({ meal_plan_id: planId, day, moment_id: momentId, note: note || null })
      .select('*, moment:moments(*), meal_plan_items(*)')
      .single()

    if (err) { error.value = err.message; return }
    if (!plan.value!.meal_plan_moments) plan.value!.meal_plan_moments = []
    plan.value!.meal_plan_moments.push(data)
  }

  async function removeMoment(momentId: string) {
    const { error: err } = await supabase.from('meal_plan_moments').delete().eq('id', momentId)
    if (err) { error.value = err.message; return }
    if (plan.value?.meal_plan_moments)
      plan.value.meal_plan_moments = plan.value.meal_plan_moments.filter(m => m.id !== momentId)
  }

  async function addItem(
    planMomentId: string,
    payload: { foodType: string; portion: string; isFreeChoice: boolean }
  ) {
    const { data, error: err } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_moment_id: planMomentId,
        food_type: payload.foodType,
        portion: payload.isFreeChoice ? null : payload.portion,
        is_free_choice: payload.isFreeChoice,
      })
      .select()
      .single()

    if (err) { error.value = err.message; return }
    const moment = plan.value?.meal_plan_moments?.find(m => m.id === planMomentId)
    if (moment) {
      if (!moment.meal_plan_items) moment.meal_plan_items = []
      moment.meal_plan_items.push(data)
    }
  }

  async function removeItem(itemId: string, planMomentId: string) {
    const { error: err } = await supabase.from('meal_plan_items').delete().eq('id', itemId)
    if (err) { error.value = err.message; return }
    const moment = plan.value?.meal_plan_moments?.find(m => m.id === planMomentId)
    if (moment?.meal_plan_items)
      moment.meal_plan_items = moment.meal_plan_items.filter(i => i.id !== itemId)
  }

  async function copyMomentToDays(sourceMomentId: string, targetDays: number[]) {
    const source = plan.value?.meal_plan_moments?.find(m => m.id === sourceMomentId)
    if (!source || !plan.value) return

    for (const day of targetDays) {
      const { data: newMoment, error: err } = await supabase
        .from('meal_plan_moments')
        .insert({ meal_plan_id: plan.value.id, day, moment_id: source.moment_id, note: source.note })
        .select('*, moment:moments(*)')
        .single()

      if (err) { error.value = err.message; continue }

      newMoment.meal_plan_items = []

      if (source.meal_plan_items?.length) {
        const { data: newItems } = await supabase
          .from('meal_plan_items')
          .insert(
            source.meal_plan_items.map(item => ({
              meal_plan_moment_id: newMoment.id,
              food_type: item.food_type,
              portion: item.portion,
              is_free_choice: item.is_free_choice,
            }))
          )
          .select()
        newMoment.meal_plan_items = newItems ?? []
      }

      plan.value.meal_plan_moments!.push(newMoment)
    }
  }

  return { plan, loading, error, fetchOrCreatePlan, addMoment, removeMoment, addItem, removeItem, copyMomentToDays }
}
