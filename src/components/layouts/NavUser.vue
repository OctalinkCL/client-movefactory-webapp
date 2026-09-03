<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarUser from "@/components/shared/AvatarUser.vue";
import { LogOut } from "@lucide/vue";

const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="flex gap-2 item-center cursor-pointer">
      <AvatarUser
        :src="auth.profile?.avatar_url"
        :name="auth.profile?.full_name"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="mt-1 min-w-64">
      <div class="flex items-center gap-2 p-2">
        <AvatarUser
          :src="auth.profile?.avatar_url"
          :name="auth.profile?.full_name"
        />
        <div>
          <p class="text-sm font-medium truncate leading-4">
            {{ auth.profile?.full_name }}
          </p>
          <p class="text-xs text-muted-foreground">{{ auth.user?.email }}</p>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="logout"
        ><LogOut /> Cerrar Sesión</DropdownMenuItem
      >
    </DropdownMenuContent>
  </DropdownMenu>
</template>
