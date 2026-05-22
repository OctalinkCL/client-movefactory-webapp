<script setup lang="ts">
import AppSidebar from '@/components/layouts/AppSidebar.vue'
import AppHeader from '@/components/layouts/AppHeader.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <router-view />
    </SidebarInset>
  </SidebarProvider>
</template>
