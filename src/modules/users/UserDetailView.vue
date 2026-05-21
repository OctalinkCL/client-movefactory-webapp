<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from './composables/useUser'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const { user, loading } = useUser(userId)

const plan = ref<{ created_at: string; updated_at: string } | null>(null)
onMounted(async () => {
  const { data } = await supabase
    .from('meal_plans')
    .select('created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  plan.value = data
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <button
      class="text-sm text-muted-foreground hover:underline"
      @click="router.back()"
    >
      ← Volver
    </button>

    <div v-if="loading" class="text-muted-foreground text-sm">Cargando...</div>

    <template v-else-if="user">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">{{ user.full_name }}</h1>
        <p class="text-muted-foreground text-sm capitalize">{{ user.role }}</p>
      </div>

      <section class="border rounded-md p-4 space-y-3">
        <h2 class="font-medium">Plan de alimentación</h2>
        <template v-if="plan">
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">Creado: {{ formatDate(plan.created_at) }}</p>
            <p class="text-xs text-muted-foreground">Última actualización: {{ formatDate(plan.updated_at) }}</p>
          </div>
        </template>
        <p v-else class="text-muted-foreground text-sm">Sin plan asignado.</p>
        <Button size="sm" @click="router.push({ name: 'admin-meal-plan', params: { id: user!.id } })">
          {{ plan ? 'Ver plan' : 'Crear plan' }}
        </Button>
      </section>
    </template>
  </div>
</template>
