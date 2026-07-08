<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisArea, VisAxis } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface DataPoint { fecha: string; valor: number }

const props = withDefaults(defineProps<{
  data?: DataPoint[]
  title?: string
  label?: string
  color?: string
  emptyMessage?: string
}>(), {
  title: 'Tendencia de peso',
  label: 'Peso (kg)',
  color: '#84cc16',
  emptyMessage: 'Aún no hay registros de peso',
})

const config = computed<ChartConfig>(() => ({
  valor: { label: props.label, color: props.color },
}))

const x = (_: unknown, i: number) => i
const y = (d: DataPoint) => d.valor

function formatFecha(fecha: string) {
  const [year, month] = fecha.split('-')
  return `${month}/${year.slice(2)}`
}

// Fuerza los ticks a caer exactamente en los índices de los datos, para que
// el último punto siempre quede alineado al borde derecho del gráfico.
const xTickValues = computed(() => props.data?.map((_, i) => i) ?? [])
const xDomain = computed<[number, number]>(() => [0, Math.max((props.data?.length ?? 1) - 1, 0)])

const xTicks = (tick: number) => {
  const fecha = props.data?.[tick]?.fecha
  return fecha ? formatFecha(fecha) : ''
}
</script>

<template>
  <div class="border rounded-xl p-4 bg-card min-w-0">
    <p class="text-sm font-medium mb-3">{{ title }}</p>
    <div class="h-48 min-w-0">
      <template v-if="props.data?.length">
        <ChartContainer :config="config">
          <template #default="{ id }">
            <VisXYContainer :data="props.data" :id="id" :xDomain="xDomain">
              <VisArea :x="x" :y="y" :color="color" :opacity="0.18" :line="true" :lineColor="color" :lineWidth="2.5" />
              <VisAxis type="x" :tickFormat="xTicks" :tickValues="xTickValues" />
            </VisXYContainer>
          </template>
        </ChartContainer>
      </template>
      <div v-else class="h-full flex items-center justify-center">
        <p class="text-xs text-muted-foreground">{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>
