import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { TrackingSession } from '@/types/tracking'

export function useTracking() {
  const sessions = ref<TrackingSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSessions(userId: string) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('tracking_sessions')
      .select('*, measurements:tracking_measurements(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(12)
    if (err) error.value = err.message
    else sessions.value = data ?? []
    loading.value = false
  }

  async function createSession(
    userId: string,
    createdBy: string,
    date: string,
    notes: string,
    measurements: { metric: string; value: number }[]
  ) {
    const { data: session, error: err } = await supabase
      .from('tracking_sessions')
      .insert({ user_id: userId, created_by: createdBy, date, notes: notes || null })
      .select()
      .single()

    if (err) { error.value = err.message; return }

    if (measurements.length) {
      const { error: itemErr } = await supabase
        .from('tracking_measurements')
        .insert(measurements.map(m => ({ session_id: session.id, metric: m.metric, value: m.value })))
      if (itemErr) { error.value = itemErr.message; return }
    }

    sessions.value.unshift({ ...session, measurements: measurements.map(m => ({ ...m, id: '', session_id: session.id, created_at: '' })) })
  }

  return { sessions, loading, error, fetchSessions, createSession }
}
