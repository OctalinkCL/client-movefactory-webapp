<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

async function logout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div>
    <header class="flex items-center justify-between p-4 border-b">
      <h1>AdminLayout</h1>
      <Button variant="outline" @click="logout">Cerrar sesión</Button>
    </header>
    <router-view />
  </div>
</template>
