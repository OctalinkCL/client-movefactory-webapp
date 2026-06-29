<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from './composables/useUser'
import { useTracking } from '@/modules/tracking/composables/useTracking'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'

import { Input } from '@/components/ui/input'
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
import { Avatar, AvatarImage } from '@/components/ui/avatar'


const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const { user, loading, updateProfile } = useUser(userId)
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
    <!-- header -->
    <header>
      <button class="text-sm flex gap-2 items-center text-muted-foreground cursor-pointer" @click="router.back()">
        <ArrowLeft :size="15" />
        Volver al Directorio de usuario
      </button>
    </header>

    <!-- body -->
    <div class="flex flex-col gap-4 | lg:flex-row lg:gap-6">
      <!-- aside -->
      <aside class="w-full lg:w-[300px]">
        <div class="border rounded-xl">
          <!-- basic -->
          <section class="px-4 py-6 text-center space-y-3">
            <Avatar class="mx-auto size-18">
              <AvatarImage v-if="user?.avatar_url" :src="user.avatar_url" />
              <AvatarImage v-else src="https://github.com/shadcn.png" />
            </Avatar>

            <div>
              <h1 class="text-xl font-semibold">{{ user?.full_name }}</h1>
              <p v-if="user?.birth_date" class="text-sm text-muted-foreground">{{ formatDate(user?.birth_date) }}</p>
            </div>

            <Sheet v-model:open="profileSheetOpen">
              <SheetTrigger as-child>
                <Button size="xs" variant="outline" @click="openProfileSheet">
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
          </section>

          <!-- info -->
          <section class="border-t p-4">
            <h5 class="text-sm font-medium text-muted-foreground">Datos del Paciente</h5>
            <ul class="text-sm mt-4 grid grid-cols-2 gap-4">
              <!-- item -->
              <li>
                <div>
                  <h4 class="text-muted-foreground">Sexo</h4>
                  <p class="font-medium">lajsklskjslsjal</p>
                </div>
              </li>
              <!-- item -->
              <li v-if="user?.sex">
                <div>
                  <h4 class="text-muted-foreground">Sexo</h4>
                  <p class="font-medium">{{ sexLabel(user.sex) }}</p>
                </div>
              </li>
              <!-- item -->
              <li v-if="user?.height">
                <div>
                  <h4 class="text-muted-foreground">Estatura</h4>
                  <p class="font-medium">{{ user.height }} cm</p>
                </div>
              </li>
            </ul>
          </section>

          <!-- contact -->
          <section class="border-t p-4">
            <h5 class="text-sm font-medium text-muted-foreground">Información de Contacto</h5>
            <ul class="text-sm mt-4 grid gap-4">
              <li v-if="user?.phone">
                <div>
                  <h4 class="text-muted-foreground">Teléfono / Whatsapp</h4>
                  <a :href="`https://wa.me/${user?.phone}`" target="_blank" class="font-medium">
                    +56 {{ user?.phone }}
                  </a>
                </div>
              </li>

              <li v-if="user?.email">
                <div>
                  <h4 class="text-muted-foreground">Correo Electrónico</h4>
                  <a :href="`mailto:${user?.email}`" target="_blank" class="font-medium">
                    {{ user?.email }}
                  </a>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </aside>

      <!-- content -->
      <div class="flex-1 space-y-4">
        <div v-if="loading" class="text-muted-foreground text-sm">Cargando...</div>

        <template v-else-if="user">


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
