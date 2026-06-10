import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Document {
  id: string
  name: string
  file_path: string
  visibility: 'public' | 'private'
  uploaded_by: string | null
  created_at: string
  profiles: { full_name: string } | null
  document_assignments: { user_id: string }[]
}

export function useDocuments() {
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('documents')
      .select('*, profiles!uploaded_by(full_name), document_assignments(user_id)')
      .order('created_at', { ascending: false })
    if (err) {
      console.error('[useDocuments]', err)
      error.value = err.message
    } else {
      documents.value = data ?? []
    }
    loading.value = false
  }

  onMounted(fetchDocuments)

  return { documents, loading, error, fetchDocuments }
}
