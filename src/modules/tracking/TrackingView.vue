<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/modules/users/composables/useUser'
import { useTracking } from './composables/useTracking'
import { useAuthStore } from '@/stores/auth'
import { METRICS, getMetric } from './constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import LineChartSample from '@/components/chart/LineChartSample.vue'
import BarChartSample from '@/components/chart/BarChartSample.vue'
import AreaChartSample from '@/components/chart/AreaChartSample.vue'
import PieChartSample from '@/components/chart/PieChartSample.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const authStore = useAuthStore()

const { user } = useUser(userId)
const { sessions, loading, fetchSessions, createSession } = useTracking()

onMounted(() => fetchSessions(userId))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

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
  <div class="p-6 space-y-6">
    <button class="text-sm text-muted-foreground hover:underline" @click="router.back()">
      ← Volver
    </button>

    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">Seguimiento</h1>
        <p v-if="user" class="text-muted-foreground text-sm">{{ user.full_name }}</p>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-muted-foreground">Cargando...</p>

    <div class="grid grid-cols-2 gap-4">
      <LineChartSample />
      <BarChartSample />
      <AreaChartSample />
      <PieChartSample />
    </div>

    <div class="space-y-4">
      <!-- Session cards -->
      <div
        v-for="session in sessions"
        :key="session.id"
        class="border rounded-md p-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm">{{ formatDate(session.date) }}</span>
          <span class="text-xs text-muted-foreground">{{ session.measurements?.length ?? 0 }} métricas</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="m in session.measurements"
            :key="m.id"
            class="border rounded-full px-2 py-0.5 text-xs"
          >
            {{ getMetric(m.metric)?.label ?? m.metric }}
            <span class="text-muted-foreground">{{ m.value }} {{ getMetric(m.metric)?.unit }}</span>
          </span>
        </div>

        <p v-if="session.notes" class="text-xs text-muted-foreground italic">{{ session.notes }}</p>
      </div>

      <!-- New session sheet -->
      <Sheet v-model:open="sheetOpen">
        <SheetTrigger as-child>
          <button class="w-full border border-dashed rounded-md py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            + Nueva sesión
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva sesión de seguimiento</SheetTitle>
          </SheetHeader>

          <div class="space-y-5 py-2 overflow-y-auto flex-1">
            <!-- Fecha -->
            <div class="space-y-1.5">
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
                  <label class="text-sm w-40 flex-shrink-0">{{ metric.label }}</label>
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

          <SheetFooter>
            <Button variant="outline" @click="resetForm">Cancelar</Button>
            <Button
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
