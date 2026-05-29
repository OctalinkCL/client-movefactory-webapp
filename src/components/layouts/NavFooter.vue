<script setup lang="ts">
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Settings, HelpCircle } from 'lucide-vue-next'

const items = [
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
    {
        title: "Help & Center",
        url: "#",
        icon: HelpCircle,
    },
]
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem v-for="(item, index) in items" :key="index">
            <SidebarMenuButton as-child>
                <a :href="item.url">
                    <component :is="item.icon" v-if="item.icon" />
                    {{ item.title }}
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
</template>