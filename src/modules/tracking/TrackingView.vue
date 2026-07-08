<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Weight, CalendarDays, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useTracking } from './composables/useTracking'
import { useAuthStore } from '@/stores/auth'
import { METRICS, getMetric } from './constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import StatCard from '@/modules/dashboard/components/StatCard.vue'
import WeightTrendCard from '@/modules/dashboard/components/WeightTrendCard.vue'
import CompositionRings from '@/modules/dashboard/components/CompositionRings.vue'

const route = useRoute()
const userId = route.params.id as string
const authStore = useAuthStore()

const { sessions, loading, fetchSessions, createSession, updateSession, deleteSession } = useTracking()

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

const lastWeight = computed(() => sessions.value[0] ? getMeasurement(sessions.value[0], 'weight') : null)
const lastSessionDate = computed(() => sessions.value[0] ? formatDate(sessions.value[0].date) : null)

// Sheet form
const sheetOpen = ref(false)
const editingSessionId = ref<string | null>(null)
const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  measurements: Object.fromEntries(METRICS.map(m => [m.key, ''])) as Record<string, string>,
})

function resetForm() {
  form.date = new Date().toISOString().slice(0, 10)
  form.notes = ''
  METRICS.forEach(m => { form.measurements[m.key] = '' })
  editingSessionId.value = null
  sheetOpen.value = false
}

function openEditSession(session: typeof sessions.value[number]) {
  editingSessionId.value = session.id
  form.date = session.date.slice(0, 10)
  form.notes = session.notes ?? ''
  METRICS.forEach(m => {
    const value = getMeasurement(session, m.key)
    form.measurements[m.key] = value !== null ? String(value) : ''
  })
  sheetOpen.value = true
}

async function onDeleteSession(session: typeof sessions.value[number]) {
  if (!confirm(`¿Eliminar la sesión del ${formatDate(session.date)}? Esta acción no se puede deshacer.`)) return
  await deleteSession(session.id)
}

async function submitForm() {
  const filled = METRICS
    .filter(m => form.measurements[m.key] !== '')
    .map(m => ({ metric: m.key, value: parseFloat(form.measurements[m.key]) }))

  if (!filled.length) return

  if (editingSessionId.value) {
    await updateSession(editingSessionId.value, form.date, form.notes, filled)
  } else {
    await createSession(userId, authStore.profile!.id, form.date, form.notes, filled)
  }
  resetForm()
}
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Seguimiento</h1>

      <Sheet v-model:open="sheetOpen" @update:open="(open) => !open && resetForm()">
        <SheetTrigger as-child>
          <Button @click="editingSessionId = null">
            <Plus class="size-4" />
            Nueva sesión
          </Button>
        </SheetTrigger>
        <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm">
          <SheetHeader>
            <SheetTitle>{{ editingSessionId ? 'Editar sesión de seguimiento' : 'Nueva sesión de seguimiento' }}</SheetTitle>
            <SheetDescription class="sr-only">Formulario para {{ editingSessionId ? 'editar una' : 'registrar una nueva' }} sesión de seguimiento de métricas</SheetDescription>
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
              {{ editingSessionId ? 'Guardar cambios' : 'Guardar sesión' }}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
    <WeightTrendCard :data="chartPesoData.length ? chartPesoData : undefined" />

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
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ formatDate(session.date) }}</p>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon" class="size-7" @click="openEditSession(session)">
                <Pencil class="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-7 text-destructive hover:text-destructive"
                @click="onDeleteSession(session)"
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>
          </div>

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
    </div>
  </div>
</template>

