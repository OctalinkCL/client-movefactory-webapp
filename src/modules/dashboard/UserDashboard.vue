<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import PlanSummary from "./components/PlanSummary.vue";
import ProgressSummary from "./components/ProgressSummary.vue";

const { profile } = storeToRefs(useAuthStore());
</script>
<template>
  <div id="user-dashboard-page" class="grid gap-4 lg:gap-8 min-w-0">
    <!-- top -->
    <section class="font-title uppercase flex justify-between items-center">
      <div>
        <p class="text-muted-foreground leading-none font-medium">Hola</p>
        <h3 class="text-3xl font-semibold leading-none">
          {{ profile?.full_name }}
        </h3>
      </div>

      <Avatar class="size-12 border-2 border-white">
        <AvatarImage
          :src="
            profile?.avatar_url
              ? profile?.avatar_url
              : 'https://api.dicebear.com/10.x/critters/svg'
          "
          :alt="profile?.full_name"
        />
      </Avatar>
    </section>

    <!-- meal_plan -->
    <PlanSummary v-if="profile" :userId="profile.id" />

    <!-- progress -->
    <ProgressSummary v-if="profile" :userId="profile.id" />
  </div>
</template>
