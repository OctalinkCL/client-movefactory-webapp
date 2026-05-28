<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PlanSummary from './components/PlanSummary.vue'

const { profile } = storeToRefs(useAuthStore())


</script>
<template>
  <div id="user-dashboard-page" class="grid gap-4 lg:gap-8">
    <!-- Header -->
    <div class="flex gap-3 items-center">
      <Avatar class="size-12">
        <AvatarImage v-if="profile?.avatar_url" :src="profile?.avatar_url" :alt="profile?.full_name" />
        <AvatarFallback class="text-xl">{{ profile?.initials }}</AvatarFallback>
      </Avatar>
      <div>
        <h6 class="text-sm text-muted-foreground">Hola, Bienvenid@</h6>
        <h3 class="text-xl font-medium">{{ profile?.full_name }}</h3>
      </div>
    </div>

    <!-- Content -->
    <div>
      <PlanSummary v-if="profile" :userId="profile.id" />
    </div>

  </div>
</template>
