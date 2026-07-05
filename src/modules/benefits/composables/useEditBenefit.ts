import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Benefit } from '@/types/benefit'
import type { BenefitFormFields } from './useCreateBenefit'

export function useEditBenefit() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function updateBenefit(
    current: Benefit,
    fields: BenefitFormFields,
    photo: File | null,
    logo: File | null,
  ) {
    loading.value = true
    error.value = null

    try {
      let photoPath = current.photo_path
      let logoPath = current.logo_path

      if (photo) {
        photoPath = `beneficios/${Date.now()}_photo_${photo.name}`
        const { error: photoError } = await supabase.storage.from('benefits').upload(photoPath, photo)
        if (photoError) throw photoError
      }

      if (logo) {
        logoPath = `beneficios/${Date.now()}_logo_${logo.name}`
        const { error: logoError } = await supabase.storage.from('benefits').upload(logoPath, logo)
        if (logoError) throw logoError
      }

      const { error: updateError } = await supabase
        .from('benefits')
        .update({
          title: fields.title,
          description: fields.description.trim() || null,
          benefit: fields.benefit,
          end_date: fields.endDate || null,
          photo_path: photoPath,
          logo_path: logoPath,
        })
        .eq('id', current.id)
      if (updateError) throw updateError

      if (photo && current.photo_path !== photoPath) {
        await supabase.storage.from('benefits').remove([current.photo_path])
      }
      if (logo && current.logo_path !== logoPath) {
        await supabase.storage.from('benefits').remove([current.logo_path])
      }
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el beneficio'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { updateBenefit, loading, error }
}
