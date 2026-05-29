<script setup lang="ts">
import LogoMove from '@/components/shared/LogoMove.vue'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <div class="flex items-center gap-2 px-2 py-2">
                <LogoMove class="w-9" />
                <h1 class="text-base uppercase italic">
                    <span>move</span>
                    <span class="font-bold">Factory</span>
                </h1>
            </div>
        </SidebarMenuItem>
    </SidebarMenu>
</template>