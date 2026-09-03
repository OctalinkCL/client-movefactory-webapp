<script setup lang="ts">
import CreateUser from "./components/CreateUser.vue";
import { useStaff } from "./composables/useStaff";
import { useToggleUser } from "./composables/useToggleUser";
import { useAuthStore } from "@/stores/auth";
import EmptyItem from "@/components/shared/EmptyItem.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AvatarUser from "@/components/shared/AvatarUser.vue";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const authStore = useAuthStore();
const { users, loading, fetchUsers } = useStaff();
const { toggleUser, loading: toggling } = useToggleUser();

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  if (role === "nutritionist") return "Nutricionista";
  return role;
}

async function handleToggle(userId: string, currentActive: boolean) {
  const action = currentActive ? "suspender" : "reactivar";
  if (!confirm(`¿Seguro que deseas ${action} este miembro del staff?`)) return;
  await toggleUser(userId, !currentActive);
  await fetchUsers();
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Staff</h1>
      </div>
      <CreateUser role="nutritionist" @created="fetchUsers" />
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 4" :key="i" />
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
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium flex items-center gap-2">
              <AvatarUser :src="user.avatar_url" :name="user.full_name" />
              {{ user.full_name }}
              <span v-if="!user.is_active"
                class="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">
                Suspendido
              </span>
            </TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.phone ?? "—" }}</TableCell>
            <TableCell class="text-muted-foreground">
              {{ roleLabel(user.role) }}
            </TableCell>
            <TableCell>
              <span :class="{
                'px-2 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-500/10 text-green-500 ': user.is_active,
                'bg-red-500/10 text-red-500': !user.is_active,
              }">
                {{ user.is_active ? "Activo" : "Suspendido" }}
              </span>
            </TableCell>
            <!-- actions -->
            <TableCell class="text-right">
              <Button v-if="user.id !== authStore.profile?.id" size="sm" variant="ghost"
                class="text-destructive hover:text-destructive cursor-pointer" :disabled="toggling"
                @click="handleToggle(user.id, user.is_active)">
                {{ user.is_active ? "Suspender" : "Reactivar" }}
              </Button>
              <Button v-else variant="ghost" size="sm" disabled>Tú</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
