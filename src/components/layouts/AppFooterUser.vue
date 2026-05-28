<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Home, UtensilsCrossed, UserRound } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'Inicio', to: 'user-dashboard', icon: Home },
  { name: 'Mi plan', to: 'user-plan', icon: UtensilsCrossed },
  { name: 'Perfil', to: 'user-profile', icon: UserRound },
]
</script>

<template>
  <footer class="sticky bottom-0 lg:hidden bg-background border-t z-50">
    <nav class="flex">
      <button
        v-for="item in navItems"
        :key="item.to"
        @click="router.push({ name: item.to })"
        class="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors"
        :class="route.name === item.to ? 'text-foreground' : 'text-muted-foreground'"
      >
        <component :is="item.icon" class="size-5" />
        <span>{{ item.name }}</span>
      </button>
    </nav>
  </footer>
</template>
