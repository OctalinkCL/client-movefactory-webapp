<script setup lang="ts">
import { useRouter } from 'vue-router'
import CreateUser from './components/CreateUser.vue'
import { useUsers } from './composables/useUsers'

const router = useRouter()
const { users, loading, fetchUsers } = useUsers('user')

function goToDetail(id: string) {
  router.push({ name: 'admin-users-detail', params: { id } })
}
</script>

<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Usuarios</h1>
      <CreateUser role="user" @created="fetchUsers" />
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm">Cargando...</div>

    <div v-else-if="users.length === 0" class="text-muted-foreground text-sm">
      No hay usuarios registrados.
    </div>

    <ul v-else class="divide-y border rounded-md">
      <li
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between px-4 py-3 hover:bg-muted cursor-pointer"
        @click="goToDetail(user.id)"
      >
        <span class="font-medium">{{ user.full_name }}</span>
        <span class="text-muted-foreground text-sm">Ver detalle →</span>
      </li>
    </ul>
  </div>
</template>
