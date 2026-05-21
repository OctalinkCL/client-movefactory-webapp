<script setup lang="ts">
import AppSidebar from '@/components/layouts/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <router-view />
    </main>
  </SidebarProvider>
</template>
