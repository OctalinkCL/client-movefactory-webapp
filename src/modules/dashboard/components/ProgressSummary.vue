<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Weight, CalendarDays } from 'lucide-vue-next'
import { useTracking } from '@/modules/tracking/composables/useTracking'
import StatCard from './StatCard.vue'
import WeightTrendCard from './WeightTrendCard.vue'
import CompositionRings from './CompositionRings.vue'

const props = defineProps<{ userId: string }>()

const { sessions, fetchSessions } = useTracking()

onMounted(async () => {
  await fetchSessions(props.userId)
})

function getMeasurement(session: typeof sessions.value[number], metric: string) {
  return session.measurements?.find(m => m.metric === metric)?.value ?? null
}

const weightData = computed(() =>
  [...sessions.value].reverse()
    .filter(s => getMeasurement(s, 'weight') !== null)
    .map(s => ({ fecha: s.date.slice(0, 7), valor: getMeasurement(s, 'weight') as number }))
    .slice(-6)
)

function formatSessionDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })
}

const lastWeight = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'weight') : null)
const lastSessionDate = computed(() => sessions.value[0] ? formatSessionDate(sessions.value[0].date) : null)

const lastFatPct = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'fat_pct') ?? undefined : undefined)
const lastMusclePct = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'muscle_pct') ?? undefined : undefined)
</script>

<template>
  <div class="grid gap-4 min-w-0">
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

    <WeightTrendCard :data="weightData.length ? weightData : undefined" />

    <CompositionRings :fatPct="lastFatPct" :musclePct="lastMusclePct" />
  </div>
</template>
