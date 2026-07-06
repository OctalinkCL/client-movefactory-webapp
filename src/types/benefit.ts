export interface Benefit {
  id: string
  title: string
  description: string | null
  benefit: string
  end_date: string | null
  photo_path: string
  logo_path: string
  created_by: string | null
  created_at: string
}
