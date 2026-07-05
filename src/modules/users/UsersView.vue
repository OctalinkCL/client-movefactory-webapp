<script setup lang="ts">
import { useRouter } from 'vue-router'
import CreateUser from './components/CreateUser.vue'
import { useUsers } from './composables/useUsers'
import { useToggleUser } from './composables/useToggleUser'
import EmptyItem from '@/components/shared/EmptyItem.vue'
import { getInitials } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Avatar, AvatarFallback, AvatarImage,
} from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { users, loading, fetchUsers } = useUsers('user')
const { toggleUser, loading: toggling } = useToggleUser()

function goToDetail(id: string) {
  router.push({ name: 'admin-tracking', params: { id } })
}

async function handleToggle(userId: string, currentActive: boolean) {
  const action = currentActive ? 'suspender' : 'reactivar'
  if (!confirm(`¿Seguro que deseas ${action} este usuario?`)) return
  await toggleUser(userId, !currentActive)
  await fetchUsers()
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Usuarios</h1>
        <p class="text-sm text-muted-foreground">Administra los miembros del gimnasio, actividades etc.</p>
      </div>
      <CreateUser role="user" @created="fetchUsers" />
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="users.length === 0" class="mt-24">
      <EmptyItem section="users" />
    </div>

    <div class="border rounded-lg overflow-hidden" v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium flex items-center gap-2">
              <Avatar class="bg-lime-600">
                <AvatarImage :src="user.avatar_url" :alt="user.full_name" v-if="user.avatar_url" />
                <AvatarFallback class="text-xs" v-else>{{ getInitials(user.full_name) }}</AvatarFallback>
              </Avatar>
              {{ user.full_name }}
              <span
                v-if="!user.is_active"
                class="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border"
              >
                Suspendido
              </span>
            </TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.phone ?? '—' }}</TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-3">
                <span class="text-sm hover:underline cursor-pointer" @click="goToDetail(user.id)">
                  Ver usuario
                </span>
                <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" :disabled="toggling"
                  @click="handleToggle(user.id, user.is_active)">
                  {{ user.is_active ? 'Suspender' : 'Reactivar' }}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
