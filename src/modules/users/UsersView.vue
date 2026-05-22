<script setup lang="ts">
import { useRouter } from 'vue-router'
import CreateUser from './components/CreateUser.vue'
import { useUsers } from './composables/useUsers'
import EmptyItem from '@/components/shared/EmptyItem.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const router = useRouter()
const { users, loading, fetchUsers } = useUsers('user')

function goToDetail(id: string) {
  router.push({ name: 'admin-users-detail', params: { id } })
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
        <TableHeader class="bg-slate-50">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium">{{ user.full_name }}</TableCell>
            <TableCell class="text-right hover:underline cursor-pointer" @click="goToDetail(user.id)">
              Ver Usuario
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
