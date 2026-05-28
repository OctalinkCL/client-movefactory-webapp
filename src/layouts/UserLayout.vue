<script setup lang="ts">
import AppHeaderUser from '@/components/layouts/AppHeaderUser.vue';
import AppFooterUser from '@/components/layouts/AppFooterUser.vue';
</script>

<template>
    <div id="user-layout">
        <!-- Header -->
        <AppHeaderUser />
        <!-- Content -->
        <main class="container mx-auto px-4 lg:px-0">
            <router-view />
        </main>
        <!-- Footer -->
        <AppFooterUser />
    </div>
</template>