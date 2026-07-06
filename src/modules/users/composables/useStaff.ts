import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

export function useStaff() {
  const users = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'nutritionist'])
      .order('is_active', { ascending: false })
      .order('full_name')
    if (err) error.value = err.message
    else users.value = data ?? []
    loading.value = false
  }

  onMounted(fetchUsers)

  return { users, loading, error, fetchUsers }
}
