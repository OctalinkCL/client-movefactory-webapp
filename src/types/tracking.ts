export interface TrackingMeasurement {
  id: string
  session_id: string
  metric: string
  value: number
  created_at: string
}

export interface TrackingSession {
  id: string
  user_id: string
  date: string
  notes: string | null
  created_by: string | null
  created_at: string
  measurements?: TrackingMeasurement[]
}
