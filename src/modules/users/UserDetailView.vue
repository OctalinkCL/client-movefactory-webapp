<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTracking } from '@/modules/tracking/composables/useTracking'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'
import { formatDateDisplay } from '@/lib/utils'
import ChartPeso from '@/components/chart/ChartPeso.vue'
import ChartCintura from '@/components/chart/ChartCintura.vue'
import ChartComposicion from '@/components/chart/ChartComposicion.vue'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const { sessions, fetchSessions } = useTracking()
const { plan, fetchPlan } = useMealPlan()

function getMeasurement(session: typeof sessions.value[number] | undefined, metric: string) {
  return session?.measurements?.find(m => m.metric === metric)?.value ?? null
}

const chartPesoData = computed(() =>
  [...sessions.value].reverse()
    .filter(s => getMeasurement(s, 'weight') !== null)
    .map(s => ({ fecha: s.date.slice(0, 7), valor: getMeasurement(s, 'weight') as number }))
)

const chartCinturaData = computed(() =>
  [...sessions.value].reverse()
    .filter(s => getMeasurement(s, 'waist') !== null)
    .map(s => ({ fecha: s.date.slice(0, 7), valor: getMeasurement(s, 'waist') as number }))
)

const lastFatPct = computed(() => getMeasurement(sessions.value[0], 'fat_pct') ?? undefined)
const lastMusclePct = computed(() => getMeasurement(sessions.value[0], 'muscle_pct') ?? undefined)

onMounted(() => {
  fetchPlan(userId)
  fetchSessions(userId)
})
</script>

<template>
  <div class="space-y-4">
    <!-- plan -->
    <section class="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center">
      <div class="flex-1">
        <h4 class="text-lg font-medium text-amber-800">Plan de alimentación</h4>
        <template v-if="plan">
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground">Creado: {{ formatDateDisplay(plan.created_at) }}</p>
            <p class="text-xs text-muted-foreground">Última actualización: {{ formatDateDisplay(plan.updated_at) }}</p>
          </div>
        </template>
        <p v-else class="text-muted-foreground text-sm">Sin plan asignado.</p>
      </div>
      <Button
        class="bg-amber-500 hover:bg-amber-600"
        @click="router.push({ name: 'admin-meal-plan', params: { id: userId } })"
      >
        {{ plan ? 'Ver plan' : 'Crear plan' }}
      </Button>
    </section>

    <!-- seguimiento -->
    <header class="flex items-center justify-between">
      <h3 class="text-xl font-semibold">Seguimiento</h3>
      <Button @click="router.push({ name: 'admin-tracking', params: { id: userId } })">
        Ver Datos
      </Button>
    </header>

    <section class="border rounded-xl p-4">
      <ChartPeso :data="chartPesoData.length ? chartPesoData : undefined" />
    </section>

    <section class="border rounded-xl p-4">
      <ChartCintura :data="chartCinturaData.length ? chartCinturaData : undefined" />
    </section>

    <section class="border rounded-xl p-4">
      <ChartComposicion :fatPct="lastFatPct" :musclePct="lastMusclePct" />
    </section>
  </div>
</template>
