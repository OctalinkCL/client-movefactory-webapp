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

  async function openDocument(filePath: string) {
    const { data, error: err } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60)
    if (err || !data) return
    window.open(data.signedUrl, '_blank')
  }

  async function deleteDocument(doc: Document) {
    error.value = null
    // El registro primero; las document_assignments caen por FK cascade.
    const { error: err } = await supabase.from('documents').delete().eq('id', doc.id)
    if (err) {
      console.error('[useDocuments]', err)
      error.value = err.message
      return false
    }
    // El archivo físico: si falla, el registro ya no existe, solo dejamos rastro.
    const { error: storageErr } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])
    if (storageErr) console.error('[useDocuments] no se pudo borrar el archivo:', storageErr)
    documents.value = documents.value.filter(d => d.id !== doc.id)
    return true
  }

  onMounted(fetchDocuments)

  return { documents, loading, error, fetchDocuments, openDocument, deleteDocument }
}
