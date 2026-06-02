<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTracking } from '@/modules/tracking/composables/useTracking'
import ChartPeso from '@/components/chart/ChartPeso.vue'
import ChartComposicion from '@/components/chart/ChartComposicion.vue'

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
)

const lastFatPct = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'fat_pct') ?? undefined : undefined)
const lastMusclePct = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'muscle_pct') ?? undefined : undefined)
</script>

<template>
  <div>
    <ChartPeso :data="weightData.length ? weightData : undefined" />
    <ChartComposicion :fatPct="lastFatPct" :musclePct="lastMusclePct" />
  </div>
</template>
