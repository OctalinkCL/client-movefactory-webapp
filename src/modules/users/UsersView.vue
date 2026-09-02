<script setup lang="ts">
import { useRouter } from "vue-router";
import CreateUser from "./components/CreateUser.vue";
import { useUsers } from "./composables/useUsers";
import { useToggleUser } from "./composables/useToggleUser";
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

const router = useRouter();
const { users, loading, fetchUsers } = useUsers("user");
const { toggleUser, loading: toggling } = useToggleUser();

function goToDetail(id: string) {
  router.push({ name: "admin-tracking", params: { id } });
}

async function handleToggle(userId: string, currentActive: boolean) {
  const action = currentActive ? "suspender" : "reactivar";
  if (!confirm(`¿Seguro que deseas ${action} este usuario?`)) return;
  await toggleUser(userId, !currentActive);
  await fetchUsers();
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Usuarios</h1>
      </div>
      <CreateUser role="user" @created="fetchUsers" />
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="users.length === 0" class="mt-24">
      <EmptyItem section="users" />
    </div>

    <div class="border rounded-lg" v-else>
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
            <TableCell
              class="font-medium flex items-center gap-2 cursor-pointer"
              @click="goToDetail(user.id)"
            >
              <AvatarUser :src="user.avatar_url" :name="user.full_name" />
              {{ user.full_name }}
              <span
                v-if="!user.is_active"
                class="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border"
              >
                Suspendido
              </span>
            </TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.phone ?? "—" }}</TableCell>
            <TableCell class="text-right">
              <Button
                size="sm"
                variant="ghost"
                class="text-destructive hover:text-destructive cursor-pointer"
                :disabled="toggling"
                @click="handleToggle(user.id, user.is_active)"
              >
                {{ user.is_active ? "Suspender" : "Reactivar" }}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
