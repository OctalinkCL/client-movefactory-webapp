import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useToggleUser() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function toggleUser(userId: string, isActive: boolean) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fnError } = await supabase.functions.invoke('toggle-user', {
        body: { userId, isActive },
      })

      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar usuario'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { toggleUser, loading, error }
}
