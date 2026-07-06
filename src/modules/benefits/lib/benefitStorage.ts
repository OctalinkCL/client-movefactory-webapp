import { supabase } from '@/lib/supabase'

export function getBenefitPublicUrl(path: string) {
  return supabase.storage.from('benefits').getPublicUrl(path).data.publicUrl
}
