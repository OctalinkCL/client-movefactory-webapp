<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface DataPoint { fecha: string; valor: number }

const props = withDefaults(defineProps<{ data?: DataPoint[] }>(), {
  data: () => [
    { fecha: '2025-01', valor: 85 },
    { fecha: '2025-02', valor: 83 },
    { fecha: '2025-03', valor: 81 },
    { fecha: '2025-04', valor: 82 },
    { fecha: '2025-05', valor: 80 },
    { fecha: '2025-06', valor: 79 },
  ],
})

const config: ChartConfig = {
  valor: { label: 'Cintura (cm)', color: '#3b82f6' },
}

const x = (_: unknown, i: number) => i
const y = (d: DataPoint) => d.valor
const xTicks = (_: unknown, i: number) => props.data[i]?.fecha ?? ''
</script>

<template>
  <div class="space-y-1">
    <p class="text-xs text-muted-foreground">Cintura (cm)</p>
    <div class="h-40">
      <ChartContainer :config="config">
        <template #default="{ id }">
          <VisXYContainer :data="props.data" :id="id">
            <VisLine :x="x" :y="y" color="#3b82f6" />
            <VisAxis type="x" :tickFormat="xTicks" />
            <VisAxis type="y" />
          </VisXYContainer>
        </template>
      </ChartContainer>
    </div>
  </div>
</template>
