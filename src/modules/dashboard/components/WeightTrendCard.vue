<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisArea, VisAxis, VisScatter, VisLine } from '@unovis/vue'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface DataPoint { fecha: string; valor: number }
interface SecondarySeries { key: string; label: string; color: string }
type SecondaryDataPoint = Record<string, number | undefined>

const props = withDefaults(defineProps<{
  data?: DataPoint[]
  title?: string
  label?: string
  color?: string
  emptyMessage?: string
  secondarySeries?: SecondarySeries[]
  secondaryData?: SecondaryDataPoint[]
  secondaryUnit?: string
}>(), {
  title: 'Tendencia de peso',
  label: 'Peso (kg)',
  color: '#84cc16',
  emptyMessage: 'Aún no hay registros de peso',
  secondaryUnit: '%',
})

const config = computed<ChartConfig>(() => ({
  valor: { label: props.label, color: props.color },
}))

const secondaryConfig = computed<ChartConfig>(() =>
  Object.fromEntries(
    (props.secondarySeries ?? []).map(s => [s.key, { label: s.label, color: s.color }]),
  ),
)

const x = (_: unknown, i: number) => i
const y = (d: DataPoint) => d.valor
const ySecondary = (s: SecondarySeries) => (d: SecondaryDataPoint) => d[s.key]
const secondaryYDomain: [number, number] = [0, 100]
const secondaryTickFormat = (v: number) => `${v}${props.secondaryUnit}`

// Con eje secundario ambos gráficos superpuestos deben reservar el mismo
// margen exacto, o sus escalas X quedan desalineadas entre sí (autoMargin
// calcula cada uno por separado según sus propios ejes).
const overlayMargin = { top: 20, right: 44, bottom: 24, left: 4 }

const unit = computed(() => props.label.match(/\(([^)]+)\)/)?.[1] ?? '')
const titleWithUnit = computed(() => unit.value ? `${props.title} (${unit.value})` : props.title)
const scatterLabel = (d: DataPoint) => String(d.valor)

function formatFecha(fecha: string) {
  const [year, month, day] = fecha.slice(0, 10).split('-').map(Number)
  const monthShort = new Date(year, month - 1, day).toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')
  return `${day}-${monthShort}`
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
    <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
      <p class="text-sm font-medium">{{ titleWithUnit }}</p>
      <div v-if="secondarySeries?.length" class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span class="size-2 rounded-full shrink-0" :style="{ backgroundColor: color }" />
          {{ label }}
        </span>
        <span v-for="s in secondarySeries" :key="s.label" class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span class="size-2 rounded-full shrink-0" :style="{ backgroundColor: s.color }" />
          {{ s.label }}
        </span>
      </div>
    </div>
    <div class="h-48 min-w-0 relative">
      <template v-if="props.data?.length">
        <ChartContainer :config="config" :class="secondarySeries?.length ? 'absolute inset-0' : undefined">
          <template #default="{ id }">
            <VisXYContainer
              :data="props.data"
              :id="id"
              :xDomain="xDomain"
              :margin="secondarySeries?.length ? overlayMargin : undefined"
              :autoMargin="secondarySeries?.length ? false : undefined"
            >
              <VisArea :x="x" :y="y" :color="color" :opacity="0.18" :line="true" :lineColor="color" :lineWidth="2.5" />
              <VisScatter :x="x" :y="y" :color="color" :size="6" :label="scatterLabel" labelPosition="top" />
              <VisAxis type="x" :tickFormat="xTicks" :tickValues="xTickValues" />
            </VisXYContainer>
          </template>
        </ChartContainer>

        <ChartContainer
          v-if="secondarySeries?.length && secondaryData?.length"
          :config="secondaryConfig"
          class="absolute inset-0 pointer-events-none"
        >
          <template #default="{ id }">
            <VisXYContainer
              :data="secondaryData"
              :id="id"
              :xDomain="xDomain"
              :yDomain="secondaryYDomain"
              :margin="overlayMargin"
              :autoMargin="false"
            >
              <VisLine
                v-for="s in secondarySeries"
                :key="s.key"
                :x="x"
                :y="ySecondary(s)"
                :color="s.color"
                :lineWidth="2"
              />
              <VisAxis type="y" position="right" :tickFormat="secondaryTickFormat" />
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
