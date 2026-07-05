import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Benefit } from '@/types/benefit'

export function useBenefits() {
  const benefits = ref<Benefit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBenefits() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('benefits')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      console.error('[useBenefits]', err)
      error.value = err.message
    } else {
      benefits.value = data ?? []
    }
    loading.value = false
  }

  async function deleteBenefit(benefit: Benefit) {
    const { error: err } = await supabase.from('benefits').delete().eq('id', benefit.id)
    if (err) {
      error.value = err.message
      return false
    }
    await supabase.storage.from('benefits').remove([benefit.photo_path, benefit.logo_path])
    benefits.value = benefits.value.filter(b => b.id !== benefit.id)
    return true
  }

  onMounted(fetchBenefits)

  return { benefits, loading, error, fetchBenefits, deleteBenefit }
}
