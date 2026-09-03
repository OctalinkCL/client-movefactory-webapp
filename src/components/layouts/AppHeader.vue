<script setup lang="ts">
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NavUser from "./NavUser.vue";

const currentDate = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());
</script>

<template>
  <header class="bg-card border-b sticky top-0 z-10 h-12 flex items-center lg:h-14">
    <div class="px-4 flex w-full items-center">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        class="ms-2 me-3.5 data-[orientation=vertical]:h-4 my-auto"
      />
      <h5 class="text-sm font-medium">{{ currentDate }}</h5>
      <!--  -->
      <div class="ml-auto">
        <NavUser />
      </div>
    </div>
  </header>
</template>
