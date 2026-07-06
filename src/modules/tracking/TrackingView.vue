<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTracking } from './composables/useTracking'
import { useAuthStore } from '@/stores/auth'
import { METRICS, getMetric } from './constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import ChartPeso from '@/components/chart/ChartPeso.vue'
import ChartCintura from '@/components/chart/ChartCintura.vue'
import ChartComposicion from '@/components/chart/ChartComposicion.vue'

const route = useRoute()
const userId = route.params.id as string
const authStore = useAuthStore()

const { sessions, loading, fetchSessions, createSession } = useTracking()

onMounted(() => fetchSessions(userId))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

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

// Sheet form
const sheetOpen = ref(false)
const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  measurements: Object.fromEntries(METRICS.map(m => [m.key, ''])) as Record<string, string>,
})

function resetForm() {
  form.date = new Date().toISOString().slice(0, 10)
  form.notes = ''
  METRICS.forEach(m => { form.measurements[m.key] = '' })
  sheetOpen.value = false
}

async function submitForm() {
  const filled = METRICS
    .filter(m => form.measurements[m.key] !== '')
    .map(m => ({ metric: m.key, value: parseFloat(form.measurements[m.key]) }))

  if (!filled.length) return

  await createSession(userId, authStore.profile!.id, form.date, form.notes, filled)
  resetForm()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Seguimiento</h1>

    <!-- Gráficas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <ChartPeso :data="chartPesoData.length ? chartPesoData : undefined" />
      <ChartCintura :data="chartCinturaData.length ? chartCinturaData : undefined" />
      <ChartComposicion :fatPct="lastFatPct" :musclePct="lastMusclePct" />
    </div>

    <!-- Historial -->
    <div class="space-y-3">
      <p class="text-sm font-medium">Historial de sesiones</p>

      <p v-if="loading" class="text-sm text-muted-foreground">Cargando...</p>

      <div v-else-if="sessions.length" class="space-y-2">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="border rounded-md p-3 space-y-2"
        >
          <p class="text-sm font-medium">{{ formatDate(session.date) }}</p>

          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="m in session.measurements"
              :key="m.metric"
              class="text-xs border rounded-full px-2 py-1 bg-muted/40"
            >
              <span class="text-muted-foreground">{{ getMetric(m.metric)?.label }}:</span>
              <span class="font-medium">{{ m.value }} {{ getMetric(m.metric)?.unit }}</span>
            </span>
          </div>

          <p v-if="session.notes" class="text-xs text-muted-foreground italic">{{ session.notes }}</p>
        </div>
      </div>

      <p v-else class="text-sm text-muted-foreground">Sin sesiones registradas.</p>

      <!-- New session sheet -->
      <Sheet v-model:open="sheetOpen">
        <SheetTrigger as-child>
          <button class="w-full border border-dashed rounded-md py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            + Nueva sesión
          </button>
        </SheetTrigger>
        <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm">
          <SheetHeader>
            <SheetTitle>Nueva sesión de seguimiento</SheetTitle>
            <SheetDescription class="sr-only">Formulario para registrar una nueva sesión de seguimiento de métricas</SheetDescription>
          </SheetHeader>

          <div class="px-4 space-y-5 py-2 overflow-y-auto flex-1">
            <!-- Fecha -->
            <div class="space-y-1.5 overflow-hidden">
              <label class="text-sm font-medium">Fecha</label>
              <Input v-model="form.date" type="date" />
            </div>

            <!-- Métricas -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Mediciones</label>
              <p class="text-xs text-muted-foreground">Completa solo las métricas de esta sesión.</p>
              <div class="space-y-2">
                <div
                  v-for="metric in METRICS"
                  :key="metric.key"
                  class="flex items-center gap-3"
                >
                  <label class="text-sm w-40 shrink-0">{{ metric.label }}</label>
                  <div class="flex items-center gap-1.5 flex-1">
                    <Input
                      v-model="form.measurements[metric.key]"
                      type="number"
                      step="0.1"
                      :placeholder="`0.0`"
                      class="flex-1"
                    />
                    <span class="text-xs text-muted-foreground w-6">{{ metric.unit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <!-- Notas -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Notas <span class="text-muted-foreground text-xs font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Observaciones de la sesión..."
                class="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <SheetFooter class="grid grid-cols-2 gap-4">
            <Button size="lg" variant="outline" @click="resetForm">Cancelar</Button>
            <Button
              size="lg"
              @click="submitForm"
              :disabled="!METRICS.some(m => form.measurements[m.key] !== '')"
            >
              Guardar sesión
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</template>

