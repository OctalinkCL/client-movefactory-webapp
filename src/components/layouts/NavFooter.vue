<script setup lang="ts">
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

const appVersion = 'v1.4'
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <div class="px-2 py-1 text-xs text-muted-foreground text-center">
                {{ appVersion }}
            </div>
        </SidebarMenuItem>
    </SidebarMenu>
</template>