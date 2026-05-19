export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'nutritionist' | 'user'
  created_at: string
}
