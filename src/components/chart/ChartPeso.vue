<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface DataPoint { fecha: string; valor: number }

const props = defineProps<{ data?: DataPoint[] }>()

const config: ChartConfig = {
  valor: { label: 'Peso (kg)', color: '#ef4444' },
}

const x = (_: unknown, i: number) => i
const y = (d: DataPoint) => d.valor
const xTicks = (_: unknown, i: number) => props.data?.[i]?.fecha ?? ''
</script>

<template>
  <div class="space-y-1">
    <p class="text-xs text-muted-foreground">Peso (kg)</p>
    <div class="h-40">
      <template v-if="props.data?.length">
        <ChartContainer :config="config">
          <template #default="{ id }">
            <VisXYContainer :data="props.data" :id="id">
              <VisLine :x="x" :y="y" color="#ef4444" />
              <VisAxis type="x" :tickFormat="xTicks" />
              <VisAxis type="y" />
            </VisXYContainer>
          </template>
        </ChartContainer>
      </template>
      <div v-else class="h-full flex items-center justify-center">
        <p class="text-xs text-muted-foreground">Aún no hay registros</p>
      </div>
    </div>
  </div>
</template>
