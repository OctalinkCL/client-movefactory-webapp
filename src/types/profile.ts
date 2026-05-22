export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: 'admin' | 'nutritionist' | 'user'
  avatar_url: string | null
  created_at: string
  initials: string
}
