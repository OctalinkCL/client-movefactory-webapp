<script setup lang="ts">
import AppSidebar from "@/components/layouts/AppSidebar.vue";
import AppHeader from "@/components/layouts/AppHeader.vue";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="bg-card">
      <AppHeader />
      <div class="p-4 lg:p-6">
        <router-view />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
