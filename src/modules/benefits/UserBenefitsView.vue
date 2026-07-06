<script setup lang="ts">
import { Gift } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserBenefits } from './composables/useUserBenefits'
import { getBenefitPublicUrl } from './lib/benefitStorage'
import { formatDate } from '@/lib/utils'

const { benefits, loading } = useUserBenefits()
</script>

<template>
  <div class="grid gap-4">
    <div class="leading-tight">
      <h1 class="text-xl font-medium">Beneficios</h1>
      <p class="text-sm text-muted-foreground">Convenios y descuentos disponibles para ti.</p>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton class="h-56 rounded-2xl" v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="benefits.length === 0" class="flex flex-col items-center gap-2 mt-20 text-center">
      <Gift class="size-10 text-muted-foreground/40" />
      <p class="text-sm font-medium">Sin beneficios por ahora</p>
      <p class="text-xs text-muted-foreground">Todavía no hay convenios disponibles para ti</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="item in benefits"
        :key="item.id"
        class="rounded-2xl border bg-card overflow-hidden"
      >
        <div class="relative h-40">
          <img :src="getBenefitPublicUrl(item.photo_path)" class="absolute inset-0 size-full object-cover" />
          <div class="absolute top-3 left-3 bg-white rounded-lg px-2 py-1.5 shadow-sm">
            <img :src="getBenefitPublicUrl(item.logo_path)" class="h-6 max-w-28 object-contain" />
          </div>
        </div>
        <div class="p-4 grid gap-3">
          <h2 class="text-lg font-semibold leading-tight">{{ item.title }}</h2>
          <span class="w-fit text-sm font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
            {{ item.benefit }}
          </span>
          <p v-if="item.description" class="text-sm text-muted-foreground">{{ item.description }}</p>
          <p v-if="item.end_date" class="text-xs text-muted-foreground">Vigente hasta {{ formatDate(item.end_date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
