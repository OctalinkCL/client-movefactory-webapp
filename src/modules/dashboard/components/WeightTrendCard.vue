<script setup lang="ts">
import { VisXYContainer, VisArea, VisAxis } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface DataPoint { fecha: string; valor: number }

const props = defineProps<{ data?: DataPoint[] }>()

const LIME = '#84cc16'

const config: ChartConfig = {
  valor: { label: 'Peso (kg)', color: LIME },
}

const x = (_: unknown, i: number) => i
const y = (d: DataPoint) => d.valor

function formatFecha(fecha: string) {
  const [year, month] = fecha.split('-')
  return `${month}/${year.slice(2)}`
}

const xTicks = (_: unknown, i: number) => {
  const fecha = props.data?.[i]?.fecha
  return fecha ? formatFecha(fecha) : ''
}
</script>

<template>
  <div class="border rounded-xl p-4 bg-card min-w-0">
    <p class="text-sm font-medium mb-3">Tendencia de peso</p>
    <div class="h-48 min-w-0">
      <template v-if="props.data?.length">
        <ChartContainer :config="config">
          <template #default="{ id }">
            <VisXYContainer :data="props.data" :id="id">
              <VisArea :x="x" :y="y" :color="LIME" :opacity="0.18" :line="true" :lineColor="LIME" :lineWidth="2.5" />
              <VisAxis type="x" :tickFormat="xTicks" :numTicks="props.data.length" />
            </VisXYContainer>
          </template>
        </ChartContainer>
      </template>
      <div v-else class="h-full flex items-center justify-center">
        <p class="text-xs text-muted-foreground">Aún no hay registros de peso</p>
      </div>
    </div>
  </div>
</template>
