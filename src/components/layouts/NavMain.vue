<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Home, UserKey, Users } from 'lucide-vue-next'

const { role } = storeToRefs(useAuthStore())

const itemNav = [
    {
        name: 'Dashboard',
        to: 'admin-dashboard',
        icon: Home,
        role: ['admin', 'nutritionist']
    },
    {
        name: 'Staff',
        to: 'admin-staff',
        icon: UserKey,
        role: ['admin']
    },
    {
        name: 'Usuarios',
        to: 'admin-users',
        icon: Users,
        role: ['admin', 'nutritionist']
    },
]

const filteredNav = computed(() =>
    itemNav.filter(item => item.role.includes(role.value ?? ''))
)
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel>Bienvenido</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem v-for="item in filteredNav" :key="item.to">
                    <SidebarMenuButton as-child>
                        <router-link :to="{ name: item.to }">
                            <component :is="item.icon" v-if="item.icon" />
                            <span>{{ item.name }}</span>
                        </router-link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
</template>