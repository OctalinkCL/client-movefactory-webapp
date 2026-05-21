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

  async function updateMoment(
    momentId: string,
    name: string | null,
    momentTypeId: string,
    days: number[],
    note: string | undefined,
    items: { foodType: string; portion: string }[]
  ) {
    const { data: updated, error: err } = await supabase
      .from('meal_plan_moments')
      .update({ name: name || null, moment_id: momentTypeId, days, note: note || null })
      .eq('id', momentId)
      .select('*, moment:moments(*)')
      .single()

    if (err) { error.value = err.message; return }

    const existingItems = plan.value?.meal_plan_moments?.find(m => m.id === momentId)?.meal_plan_items ?? []
    const normalize = (p: string) => p === 'libre' ? null : p
    const itemsChanged =
      items.length !== existingItems.length ||
      items.some((item, i) =>
        item.foodType !== existingItems[i]?.food_type ||
        normalize(item.portion) !== existingItems[i]?.portion
      )

    let newItems: any[] = []
    if (itemsChanged) {
      await supabase.from('meal_plan_items').delete().eq('meal_plan_moment_id', momentId)
      if (items.length) {
        const { data } = await supabase
          .from('meal_plan_items')
          .insert(items.map(item => ({
            meal_plan_moment_id: momentId,
            food_type: item.foodType,
            portion: normalize(item.portion),
            is_free_choice: false,
          })))
          .select()
        newItems = data ?? []
      }
    } else {
      newItems = existingItems
    }

    updated.meal_plan_items = newItems
    const idx = plan.value?.meal_plan_moments?.findIndex(m => m.id === momentId) ?? -1
    if (idx !== -1) plan.value!.meal_plan_moments![idx] = updated
  }

  return { plan, loading, error, fetchOrCreatePlan, createMoment, updateMoment, removeMoment, removeItem }
}
