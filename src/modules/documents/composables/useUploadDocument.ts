import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useUploadDocument() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function uploadDocument(name: string, file: File, visibility: 'public' | 'private', userIds: string[]) {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const userId = authStore.user?.id
      if (!userId) throw new Error('No autenticado')

      const filePath = `${userId}/${Date.now()}_${file.name}`

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)
      if (storageError) throw storageError

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({ name, file_path: filePath, uploaded_by: userId, visibility })
        .select('id')
        .single()
      if (dbError) throw dbError

      if (visibility === 'private' && userIds.length > 0) {
        const assignments = userIds.map(uid => ({ document_id: doc.id, user_id: uid }))
        const { error: assignError } = await supabase.from('document_assignments').insert(assignments)
        if (assignError) throw assignError
      }
    } catch (e: any) {
      error.value = e.message || 'Error al subir el documento'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { uploadDocument, loading, error }
}
