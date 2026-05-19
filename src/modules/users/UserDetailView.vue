<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUser } from './composables/useUser'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const { user, loading } = useUser(route.params.id as string)
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
        <p class="text-muted-foreground text-sm">Sin plan asignado.</p>
        <Button size="sm" @click="router.push({ name: 'admin-meal-plan', params: { id: user!.id } })">
          Crear plan
        </Button>
      </section>
    </template>
  </div>
</template>