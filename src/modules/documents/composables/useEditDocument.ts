import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useEditDocument() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function updateDocument(
    documentId: string,
    visibility: 'public' | 'private',
    userIds: string[],
  ) {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ visibility })
        .eq('id', documentId)
      if (updateError) throw updateError

      const { error: deleteError } = await supabase
        .from('document_assignments')
        .delete()
        .eq('document_id', documentId)
      if (deleteError) throw deleteError

      if (visibility === 'private' && userIds.length > 0) {
        const assignments = userIds.map(uid => ({ document_id: documentId, user_id: uid }))
        const { error: insertError } = await supabase.from('document_assignments').insert(assignments)
        if (insertError) throw insertError
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el documento'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { updateDocument, loading, error }
}
