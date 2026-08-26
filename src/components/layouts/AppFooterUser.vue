<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import {
  Home,
  UtensilsCrossed,
  UserRound,
  FileText,
  Gift,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const navItems = [
  { name: "Inicio", to: "user-dashboard", icon: Home },
  { name: "Mi plan", to: "user-plan", icon: UtensilsCrossed },
  { name: "Beneficios", to: "user-benefits", icon: Gift },
  { name: "Documentos", to: "user-documents", icon: FileText },
  { name: "Perfil", to: "user-profile", icon: UserRound },
];
</script>

<template>
  <footer class="sticky bottom-0 p-3 lg:hidden flex justify-center">
    <nav class="flex bg-black rounded-full p-2 gap-4">
      <button
        v-for="item in navItems"
        :key="item.to"
        @click="router.push({ name: item.to })"
        class="rounded-full p-3"
        :class="
          route.name === item.to
            ? 'bg-amber-300 text-amber-950'
            : 'bg-transparent text-white'
        "
      >
        <component :is="item.icon" class="size-7" stroke-width="1.5" />
        <!-- <span>{{ item.name }}</span> -->
      </button>
    </nav>
  </footer>
</template>
