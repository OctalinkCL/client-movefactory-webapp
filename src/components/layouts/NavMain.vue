<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSidebar, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Home, UserKey, Users, Apple, FileText } from 'lucide-vue-next'

const { role } = storeToRefs(useAuthStore())
const route = useRoute()
const router = useRouter()
const { isMobile, setOpenMobile } = useSidebar()

const itemNav = [
    {
        name: 'Dashboard',
        to: 'admin-dashboard',
        icon: Home,
        role: ['admin']
    },
    {
        name: 'Dashboard',
        to: 'user-dashboard',
        icon: Home,
        role: ['user']
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
    {
        name: 'Alimentos',
        to: 'admin-foods',
        icon: Apple,
        role: ['admin']
    },
    {
        name: 'Documentos',
        to: 'admin-documents',
        icon: FileText,
        role: ['admin', 'nutritionist']
    },
]

const filteredNav = computed(() =>
    itemNav.filter(item => item.role.includes(role.value ?? ''))
)

function handleNavClick(to: string) {
    router.push({ name: to })
    if (isMobile.value) setOpenMobile(false)
}
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel>Bienvenido</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu class="gap-1">
                <SidebarMenuItem v-for="item in filteredNav" :key="item.to">
                    <SidebarMenuButton :is-active="route.name === item.to" @click="handleNavClick(item.to)"
                        class="cursor-pointer h-9 data-[active=true]:bg-black data-[active=true]:text-white">
                        <component :is="item.icon" v-if="item.icon" />
                        <span>{{ item.name }}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
</template>