import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

export function useUser(id: string) {
  const user = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUser() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (err) error.value = err.message
    else user.value = data
    loading.value = false
  }

  onMounted(fetchUser)

  return { user, loading, error }
}
