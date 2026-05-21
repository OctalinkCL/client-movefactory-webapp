<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import { User } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push({ name: "admin-dashboard" });
  } catch (e) {
    error.value = "Credenciales incorrectas. Revisá email y contraseña.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-8">
      <!-- Header -->
      <div class="flex flex-col items-center">
        <div class="rounded-full bg-linear-to-t from-sky-500/0 to-yellow-500/30 p-3">
          <div class="size-12 rounded-full bg-white border border-yellow-300 flex items-center justify-center">
            <User :size="24" :stroke-width="1.5" class="text-yellow-500" />
          </div>
        </div>
        <h1 class="text-2xl font-medium text-mist-950">Bienvenido a Move<span class="font-bold">Factory</span></h1>
        <p class="text-xs text-muted-foreground text-center px-6">
          Qué bueno verte de nuevo. Ingresá tus datos para acceder.
        </p>
      </div>
      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label for="email" class="text-xs font-medium">Email</label>
          <Input id="email" v-model="email" type="email" placeholder="tu@email.com" autocomplete="email" required />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-xs font-medium">Contraseña</label>
          <Input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="current-password"
            required />
        </div>

        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

        <Button type="submit" class="w-full"  :disabled="loading">
          {{ loading ? "Ingresando..." : "Ingresar" }}
        </Button>
      </form>
    </div>
  </div>
</template>
