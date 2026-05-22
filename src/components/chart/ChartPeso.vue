<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const data = [
  { fecha: '2025-01', valor: 72.5 },
  { fecha: '2025-02', valor: 71.0 },
  { fecha: '2025-03', valor: 69.8 },
  { fecha: '2025-04', valor: 70.3 },
  { fecha: '2025-05', valor: 68.5 },
  { fecha: '2025-06', valor: 67.2 },
]

const config: ChartConfig = {
  valor: { label: 'Peso (kg)', color: '#ef4444' },
}

const x = (_: unknown, i: number) => i
const y = (d: { fecha: string; valor: number }) => d.valor
const xTicks = (_: unknown, i: number) => data[i]?.fecha ?? ''
</script>

<template>
  <div class="space-y-1">
    <p class="text-xs text-muted-foreground">Peso (kg)</p>
    <div class="h-40">
      <ChartContainer :config="config">
        <template #default="{ id }">
          <VisXYContainer :data="data" :id="id">
            <VisLine :x="x" :y="y" color="#ef4444" />
            <VisAxis type="x" :tickFormat="xTicks" />
            <VisAxis type="y" />
          </VisXYContainer>
        </template>
      </ChartContainer>
    </div>
  </div>
</template>
