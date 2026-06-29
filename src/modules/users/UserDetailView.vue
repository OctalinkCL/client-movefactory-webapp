<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from './composables/useUser'
import { useTracking } from '@/modules/tracking/composables/useTracking'

import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import ChartPeso from '@/components/chart/ChartPeso.vue'
import ChartCintura from '@/components/chart/ChartCintura.vue'
import ChartComposicion from '@/components/chart/ChartComposicion.vue'

// icons
import { ArrowLeft } from 'lucide-vue-next'

// ui_components
import { Button } from '@/components/ui/button'

// components
import UserProfile from '@/components/shared/UserProfile.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const { user, loading, updateProfile } = useUser(userId)
const { sessions, fetchSessions } = useTracking()

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

const plan = ref<{ created_at: string; updated_at: string } | null>(null)
onMounted(async () => {
  const { data } = await supabase
    .from('meal_plans')
    .select('created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  plan.value = data
  fetchSessions(userId)
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function sexLabel(sex: string | null) {
  if (sex === 'male') return 'Masculino'
  if (sex === 'female') return 'Femenino'
  return null
}

const hasFixedData = () => !!(user.value?.birth_date || user.value?.sex || user.value?.height)

// Sheet datos del paciente
const profileSheetOpen = ref(false)
const profileForm = reactive({
  birth_date: '',
  sex: '' as 'male' | 'female' | '',
  height: '',
  phone: '',
})

function openProfileSheet() {
  profileForm.birth_date = user.value?.birth_date ?? ''
  profileForm.sex = user.value?.sex ?? ''
  profileForm.height = user.value?.height?.toString() ?? ''
  profileForm.phone = user.value?.phone ?? ''
  profileSheetOpen.value = true
}

async function saveProfile() {
  await updateProfile({
    birth_date: profileForm.birth_date || null,
    sex: profileForm.sex || null,
    height: profileForm.height ? parseFloat(profileForm.height) : null,
    phone: profileForm.phone || null,
  })
  profileSheetOpen.value = false
}
</script>

<template>
  <div id="user-detail-view" class="space-y-4">

    <!-- button_back -->
    <button class="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer" @click="router.back()">
      <ArrowLeft :size="15" />
      Volver al Directorio de usuario
    </button>

    <!-- main -->
    <div class="grid gap-4 lg:grid-cols-7">
      <!-- aside -->
      <aside class="lg:col-span-2 space-y-3">
        <UserProfile :user="user" />

        <!-- edit -->
        <Sheet v-model:open="profileSheetOpen">
          <SheetTrigger as-child>
            <Button class="w-full" @click="openProfileSheet">
              {{ hasFixedData() ? 'Editar datos' : 'Completar datos' }}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Datos del paciente</SheetTitle>
            </SheetHeader>
            <div class="space-y-4 py-2 flex-1 overflow-y-auto">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Fecha de nacimiento</label>
                <Input v-model="profileForm.birth_date" type="date" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Sexo</label>
                <select v-model="profileForm.sex" class="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="">Sin especificar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Estatura (cm)</label>
                <Input v-model="profileForm.height" type="number" step="0.1" placeholder="170" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Teléfono</label>
                <Input v-model="profileForm.phone" type="tel" placeholder="+56 9 1234 5678" />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" @click="profileSheetOpen = false">Cancelar</Button>
              <Button @click="saveProfile">Guardar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </aside>

      <!-- content -->
      <div class="lg:col-span-5">
        <div v-if="loading" class="text-muted-foreground text-sm">Cargando...</div>

        <template v-else-if="user">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">{{ user.full_name }}</h1>
            <p class="text-muted-foreground text-sm capitalize">{{ user.role }}</p>
          </div>

          <!-- Datos del paciente -->
          <section class="border rounded-md p-4 space-y-3">
            <h2 class="font-medium">Datos del paciente</h2>
            <template v-if="hasFixedData()">
              <div class="grid grid-cols-2 gap-3">
                <div v-if="user.birth_date" class="space-y-0.5">
                  <p class="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <p class="text-sm">{{ formatDate(user.birth_date) }}</p>
                </div>
                <div v-if="user.sex" class="space-y-0.5">
                  <p class="text-xs text-muted-foreground">Sexo</p>
                  <p class="text-sm">{{ sexLabel(user.sex) }}</p>
                </div>
                <div v-if="user.height" class="space-y-0.5">
                  <p class="text-xs text-muted-foreground">Estatura</p>
                  <p class="text-sm">{{ user.height }} cm</p>
                </div>
                <div v-if="user.phone" class="space-y-0.5">
                  <p class="text-xs text-muted-foreground">Teléfono</p>
                  <p class="text-sm">{{ user.phone }}</p>
                </div>
              </div>
            </template>
            <p v-else class="text-muted-foreground text-sm">Sin datos registrados.</p>

          </section>

          <!-- Plan de alimentación -->
          <section class="border rounded-md p-4 space-y-3">
            <h2 class="font-medium">Plan de alimentación</h2>
            <template v-if="plan">
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground">Creado: {{ formatDate(plan.created_at) }}</p>
                <p class="text-xs text-muted-foreground">Última actualización: {{ formatDate(plan.updated_at) }}</p>
              </div>
            </template>
            <p v-else class="text-muted-foreground text-sm">Sin plan asignado.</p>
            <Button size="sm" @click="router.push({ name: 'admin-meal-plan', params: { id: user!.id } })">
              {{ plan ? 'Ver plan' : 'Crear plan' }}
            </Button>
          </section>

          <!-- Seguimiento -->
          <section class="border rounded-md p-4 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-medium">Seguimiento</h2>
              <Button size="sm" variant="outline"
                @click="router.push({ name: 'admin-tracking', params: { id: user!.id } })">
                Ver todo
              </Button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ChartPeso :data="chartPesoData.length ? chartPesoData : undefined" />
              <ChartCintura :data="chartCinturaData.length ? chartCinturaData : undefined" />
              <ChartComposicion :fatPct="lastFatPct" :musclePct="lastMusclePct" />
            </div>
          </section>
        </template>
      </div>
    </div>



  </div>
</template>
