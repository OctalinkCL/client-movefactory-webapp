import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

export interface UserDocument {
  id: string
  name: string
  file_path: string
  visibility: 'public' | 'private'
  created_at: string
}

export function useUserDocuments() {
  const documents = ref<UserDocument[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('documents')
      .select('id, name, file_path, visibility, created_at')
      .order('created_at', { ascending: false })
    if (err) error.value = err.message
    else documents.value = data ?? []
    loading.value = false
  }

  async function openDocument(filePath: string) {
    const { data, error: err } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60)
    if (err || !data) return
    window.open(data.signedUrl, '_blank')
  }

  onMounted(fetchDocuments)

  return { documents, loading, error, openDocument }
}
