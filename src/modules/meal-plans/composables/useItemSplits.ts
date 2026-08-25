import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useItemSplits() {
  const splitItemIds = ref<Set<string>>(new Set())

  async function fetchSplits(userId: string) {
    const { data } = await supabase
      .from('meal_plan_item_splits')
      .select('meal_plan_item_id')
      .eq('user_id', userId)
    splitItemIds.value = new Set((data ?? []).map(r => r.meal_plan_item_id))
  }

  function isSplit(itemId: string): boolean {
    return splitItemIds.value.has(itemId)
  }

  async function splitItem(userId: string, itemId: string) {
    const { error } = await supabase
      .from('meal_plan_item_splits')
      .insert({ user_id: userId, meal_plan_item_id: itemId })
    if (error) return false
    splitItemIds.value = new Set(splitItemIds.value).add(itemId)
    return true
  }

  async function unsplitItem(userId: string, itemId: string) {
    const { error } = await supabase
      .from('meal_plan_item_splits')
      .delete()
      .eq('user_id', userId)
      .eq('meal_plan_item_id', itemId)
    if (error) return false
    const next = new Set(splitItemIds.value)
    next.delete(itemId)
    splitItemIds.value = next
    return true
  }

  return { splitItemIds, fetchSplits, isSplit, splitItem, unsplitItem }
}
