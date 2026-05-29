<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
    await auth.logout();
    router.push({ name: 'login' })
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger class="flex gap-2 item-center cursor-pointer">
            <Avatar>
                <AvatarImage :src="auth.profile?.avatar_url" v-if="auth.profile?.avatar_url" />
                <AvatarFallback class="text-xs font-medium" v-else>{{ auth.profile?.initials }}</AvatarFallback>
            </Avatar>
            <div class="grid text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ auth.profile?.full_name }}</span>
                <span class="text-muted-foreground truncate text-xs">{{ auth.profile?.role }}</span>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">Cerrar Sesión</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
