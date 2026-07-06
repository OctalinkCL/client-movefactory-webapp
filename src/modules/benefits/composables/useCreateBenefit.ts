import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { optimizeImage } from '@/lib/imageOptimize'

export interface BenefitFormFields {
  title: string
  description: string
  benefit: string
  endDate: string
}

export function useCreateBenefit() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createBenefit(fields: BenefitFormFields, photo: File, logo: File) {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const userId = authStore.user?.id
      if (!userId) throw new Error('No autenticado')

      const optimizedPhoto = await optimizeImage(photo, { maxWidth: 1600, maxHeight: 1600 })
      const optimizedLogo = await optimizeImage(logo, { maxWidth: 600, maxHeight: 600, quality: 0.9 })

      const photoPath = `beneficios/${Date.now()}_photo_${optimizedPhoto.name}`
      const logoPath = `beneficios/${Date.now()}_logo_${optimizedLogo.name}`

      const { error: photoError } = await supabase.storage.from('benefits').upload(photoPath, optimizedPhoto)
      if (photoError) throw photoError

      const { error: logoError } = await supabase.storage.from('benefits').upload(logoPath, optimizedLogo)
      if (logoError) throw logoError

      const { error: dbError } = await supabase.from('benefits').insert({
        title: fields.title,
        description: fields.description.trim() || null,
        benefit: fields.benefit,
        end_date: fields.endDate || null,
        photo_path: photoPath,
        logo_path: logoPath,
        created_by: userId,
      })
      if (dbError) throw dbError
    } catch (e: any) {
      error.value = e.message || 'Error al crear el beneficio'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { createBenefit, loading, error }
}
