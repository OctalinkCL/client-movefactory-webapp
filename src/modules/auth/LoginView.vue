<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";

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
  <div class=" flex items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-8">
      <div class="text-center space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Move Factory</h1>
        <p class="text-muted-foreground text-sm">Ingresá a tu cuenta</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">Email</label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium">Contraseña</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? "Ingresando..." : "Ingresar" }}
        </Button>
      </form>
    </div>
  </div>
</template>
