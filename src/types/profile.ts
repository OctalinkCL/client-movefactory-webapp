export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  birth_date: string | null
  sex: 'male' | 'female' | null
  height: number | null
  role: 'admin' | 'nutritionist' | 'user'
  avatar_url: string | null
  is_active: boolean
  created_at: string
  initials: string
}
