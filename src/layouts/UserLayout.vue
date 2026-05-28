<script setup lang="ts">
import AppHeaderUser from '@/components/layouts/AppHeaderUser.vue';
import AppFooterUser from '@/components/layouts/AppFooterUser.vue';
</script>

<template>
    <div id="user-layout" class="flex flex-col min-h-screen">
        <!-- Header -->
        <AppHeaderUser />
        <!-- Content -->
        <main class="flex-1 container mx-auto px-4 py-6 lg:px-0">
            <router-view />
        </main>
        <!-- Footer -->
        <AppFooterUser />
    </div>
</template>