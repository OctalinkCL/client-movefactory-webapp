<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label: string
  value: string
  suffix?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="border rounded-xl p-4 flex flex-col gap-3 bg-card">
    <div class="flex items-center gap-2">
      <span class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <component :is="icon" class="size-4" />
      </span>
      <p class="text-sm font-medium">{{ label }}</p>
    </div>
    <div>
      <p class="text-2xl font-semibold leading-none">
        {{ value }}<span v-if="suffix" class="text-base font-normal text-muted-foreground ml-1">{{ suffix }}</span>
      </p>
      <p v-if="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
    </div>
  </div>
</template>
