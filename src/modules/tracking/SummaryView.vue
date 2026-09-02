<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Weight, CalendarDays } from 'lucide-vue-next'
import { useTracking } from './composables/useTracking'
import { formatDateDisplay as formatDate } from '@/lib/utils'
import StatCard from '@/modules/dashboard/components/StatCard.vue'
import WeightTrendCard from '@/modules/dashboard/components/WeightTrendCard.vue'
import CompositionRings from '@/modules/dashboard/components/CompositionRings.vue'

const route = useRoute()
const userId = route.params.id as string

const { sessions, fetchSessions } = useTracking()

onMounted(() => fetchSessions(userId))

function getMeasurement(session: typeof sessions.value[number] | undefined, metric: string) {
  return session?.measurements?.find(m => m.metric === metric)?.value ?? null
}

const pesoSessions = computed(() =>
  [...sessions.value].reverse()
    .filter(s => getMeasurement(s, 'weight') !== null)
    .slice(-6)
)

const chartPesoData = computed(() =>
  pesoSessions.value.map(s => ({ fecha: s.date.slice(0, 10), valor: getMeasurement(s, 'weight') as number }))
)

const weightSecondarySeries = [
  { key: 'fatPct', label: '% Masa grasa', color: '#f97316' },
  { key: 'musclePct', label: '% Masa muscular', color: '#8b5cf6' },
]

const weightSecondaryData = computed(() =>
  pesoSessions.value.map(s => ({
    fatPct: getMeasurement(s, 'fat_pct') ?? undefined,
    musclePct: getMeasurement(s, 'muscle_pct') ?? undefined,
  }))
)

const chartCinturaData = computed(() =>
  [...sessions.value].reverse()
    .filter(s => getMeasurement(s, 'waist') !== null)
    .map(s => ({ fecha: s.date.slice(0, 10), valor: getMeasurement(s, 'waist') as number }))
    .slice(-6)
)

const lastFatPct = computed(() => getMeasurement(sessions.value[0], 'fat_pct') ?? undefined)
const lastMusclePct = computed(() => getMeasurement(sessions.value[0], 'muscle_pct') ?? undefined)

const lastWeight = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'weight') : null)
const lastSessionDate = computed(() => sessions.value[0] ? formatDate(sessions.value[0].date) : null)
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Resumen</h1>
    </header>

    <!-- Resumen -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard
        :icon="Weight"
        label="Peso actual"
        :value="lastWeight != null ? String(lastWeight) : '--'"
        :suffix="lastWeight != null ? 'kg' : undefined"
        subtitle="Último registro"
      />
      <StatCard
        :icon="CalendarDays"
        label="Último control"
        :value="lastSessionDate ?? 'Sin registros'"
      />
    </div>

    <!-- Gráficas -->
    <WeightTrendCard
      :data="chartPesoData.length ? chartPesoData : undefined"
      :secondary-series="weightSecondarySeries"
      :secondary-data="chartPesoData.length ? weightSecondaryData : undefined"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <WeightTrendCard
        :data="chartCinturaData.length ? chartCinturaData : undefined"
        title="Tendencia de cintura"
        label="Cintura (cm)"
        color="#3b82f6"
        empty-message="Aún no hay registros de cintura"
      />
      <CompositionRings :fatPct="lastFatPct" :musclePct="lastMusclePct" />
    </div>
  </div>
</template>
