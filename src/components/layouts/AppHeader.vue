<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useResponsive } from '@/composables/useResponsive'
import NavUser from './NavUser.vue'

const { isMobile } = useResponsive()
console.debug('isMobile', isMobile.value)

const currentDate = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(new Date())
</script>

<template>
    <header class="border-b sticky top-0 z-10 bg-background h-12 flex items-center lg:h-12">
        <div class="px-4 flex w-full items-center">
            <SidebarTrigger />
            <Separator orientation="vertical" class="ms-2 me-3.5 data-[orientation=vertical]:h-4 my-auto" />
            <h5 class="text-sm">{{ currentDate }}</h5>
            <!--  -->
            <div class="ml-auto">
                <NavUser />
            </div>
        </div>
    </header>
</template>