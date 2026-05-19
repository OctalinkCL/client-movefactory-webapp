import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

interface CreateUserPayload {
  email: string
  password: string
  full_name: string
  role: Profile['role']
}

export function useCreateUser() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createUser(payload: CreateUserPayload) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-user', {
        body: payload,
      })

      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      return data
    } catch (e: any) {
      error.value = e.message || 'Error al crear usuario'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { createUser, loading, error }
}
