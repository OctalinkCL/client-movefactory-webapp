<script setup lang="ts">
import LogoMove from '@/components/shared/LogoMove.vue'
</script>
<template>
  <div class="min-h-screen p-6 grid lg:grid-cols-2 lg:gap-12">
    <!-- Left -->
    <div class="flex flex-col">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <LogoMove class="w-12" />
        <h1 class="text-xl uppercase italic">
          <span>move</span>
          <span class="font-bold">Factory</span>
        </h1>
      </div>
      <!-- Form -->
      <div class="flex-1 flex flex-col justify-center">
        <router-view />
      </div>
      <footer class="flex justify-between">
        <p class="text-xs text-mist-500">2026 MoveFactory. All rights reserved.</p>
        <p class="text-xs text-mist-500">
          <span>Developed by MoveFactory Team & </span>
          <a href="https://octalink.cl" target="_blank" class="text-orange-500 font-medium hover:underline">Octalink</a>
        </p>
      </footer>
    </div>
    <!-- Right -->
    <div class="hidden lg:block">
      <div class="h-full bg-mist-300 rounded-xl overflow-hidden">
        <img src="https://images.pexels.com/photos/4853664/pexels-photo-4853664.jpeg" alt="Auth Background"
          class="size-full object-cover" />
      </div>
    </div>
  </div>
</template>
