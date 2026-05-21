<script setup lang="ts">
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'

import NavHeader from '@/components/layouts/NavHeader.vue'
import NavFooter from '@/components/layouts/NavFooter.vue'
</script>

<template>
    <Sidebar>
        <SidebarHeader>
            <NavHeader />
        </SidebarHeader>
        <SidebarContent>
            <p>Sidebar content goes here</p>
        </SidebarContent>
        <!-- Fotoer -->
        <SidebarFooter>
            <NavFooter />
        </SidebarFooter>
    </Sidebar>
</template>
