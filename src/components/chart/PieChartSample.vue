<script setup lang="ts">
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const data = [
  { label: 'Masa grasa', valor: 30 },
  { label: 'Masa muscular', valor: 70 },
]

const config: ChartConfig = {
  valor: { label: 'Peso (kg)' },
}

const value = (d: { label: string; valor: number }) => d.valor
const colors = ['#ef4444', '#3b82f6']
const color = (_: unknown, i: number) => colors[i % colors.length]
</script>

<template>
  <div class="w-full h-64">
    <ChartContainer :config="config">
      <template #default="{ id }">
        <VisSingleContainer :data="data" :id="id">
          <VisDonut :value="value" :color="color" :arcWidth="60" />
        </VisSingleContainer>
      </template>
    </ChartContainer>
  </div>
</template>
