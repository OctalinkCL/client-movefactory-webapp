import type { Profile } from './profile'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: Profile['role'][]
  }
}
