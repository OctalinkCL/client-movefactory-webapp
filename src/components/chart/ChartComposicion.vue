<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const props = defineProps<{ fatPct?: number; musclePct?: number }>()

const config: ChartConfig = {
  valor: { label: 'Composición corporal' },
}

const data = computed(() => [
  { label: '% Masa grasa', valor: props.fatPct },
  { label: '% Masa muscular', valor: props.musclePct },
])

const value = (d: { label: string; valor: number }) => d.valor
const colors = ['#ef4444', '#3b82f6']
const color = (_: unknown, i: number) => colors[i % colors.length]
</script>

<template>
  <div class="space-y-1">
    <p class="text-xs text-muted-foreground">Composición corporal</p>
    <div class="h-40 flex flex-col items-center justify-center gap-2">
      <template v-if="props.fatPct != null || props.musclePct != null">
        <ChartContainer :config="config">
          <template #default="{ id }">
            <VisSingleContainer :data="data" :id="id">
              <VisDonut :value="value" :color="color" :arcWidth="60" />
            </VisSingleContainer>
          </template>
        </ChartContainer>
        <div class="flex gap-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#ef4444] inline-block" />
            Grasa {{ props.fatPct }}%
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block" />
            Músculo {{ props.musclePct }}%
          </span>
        </div>
      </template>
      <p v-else class="text-xs text-muted-foreground">Aún no hay registros</p>
    </div>
  </div>
</template>
