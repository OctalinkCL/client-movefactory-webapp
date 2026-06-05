<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const router = useRouter()

const SEX_LABELS: Record<string, string> = { male: 'Masculino', female: 'Femenino' }

const birthDateFormatted = computed(() =>
  profile.value?.birth_date ? formatDate(profile.value.birth_date) : null
)

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="grid gap-6">
    <header class="leading-tight">
      <h1 class="text-xl font-medium">Mi perfil</h1>
    </header>

    <div v-if="profile" class="grid gap-4">
      <!-- Avatar y nombre -->
      <div class="flex items-center gap-4 border rounded-xl p-4">
        <Avatar class="size-16">
          <AvatarImage v-if="profile.avatar_url" :src="profile.avatar_url" :alt="profile.full_name" />
          <AvatarFallback class="text-2xl">{{ profile.initials }}</AvatarFallback>
        </Avatar>
        <div>
          <p class="font-medium text-lg">{{ profile.full_name }}</p>
          <p class="text-sm text-muted-foreground">{{ profile.email }}</p>
        </div>
      </div>

      <!-- Datos del perfil -->
      <div class="border rounded-xl divide-y">
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-muted-foreground">Teléfono</span>
          <span class="text-sm font-medium">{{ profile.phone ?? '—' }}</span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-muted-foreground">Fecha de nacimiento</span>
          <span class="text-sm font-medium">{{ birthDateFormatted ?? '—' }}</span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-muted-foreground">Sexo</span>
          <span class="text-sm font-medium">{{ profile.sex ? SEX_LABELS[profile.sex] : '—' }}</span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-muted-foreground">Estatura</span>
          <span class="text-sm font-medium">{{ profile.height ? profile.height + ' cm' : '—' }}</span>
        </div>
      </div>

      <!-- Logout -->
      <Button variant="outline" class="w-full text-destructive hover:text-destructive" @click="handleLogout">
        <LogOut class="size-4" />
        Cerrar sesión
      </Button>
    </div>
  </div>
</template>
