import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Benefit } from '@/types/benefit'

export function useUserBenefits() {
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
    if (err) error.value = err.message
    else benefits.value = data ?? []
    loading.value = false
  }

  onMounted(fetchBenefits)

  return { benefits, loading, error }
}
