import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Moment } from '@/types/meal-plan'

export function useMoments() {
  const moments = ref<Moment[]>([])
  const loading = ref(false)

  async function fetchMoments() {
    loading.value = true
    const { data } = await supabase.from('moments').select('*').order('sort_order')
    moments.value = data ?? []
    loading.value = false
  }

  onMounted(fetchMoments)

  return { moments, loading }
}
