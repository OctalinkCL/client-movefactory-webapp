<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/modules/users/composables/useUser'
import { useMealPlan } from './composables/useMealPlan'
import { useMoments } from './composables/useMoments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { NativeSelect } from '@/components/ui/native-select'
import type { MealPlanMoment } from '@/types/meal-plan'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
// icon
import { XIcon, PlusIcon, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const { user } = useUser(userId)
const { plan, loading, error, fetchOrCreatePlan, createMoment, updateMoment, removeMoment } = useMealPlan()
const { moments } = useMoments()

onMounted(() => fetchOrCreatePlan(userId))

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const FOOD_TYPES = ['Proteína', 'Carbohidrato', 'Grasa', 'Verdura', 'Fruta', 'Lácteo']
const PORTION_OPTIONS = [
  { value: '1', label: '1 porción' },
  { value: '2', label: '2 porciones' },
  { value: '3', label: '3 porciones' },
  { value: '4', label: '4 porciones' },
  { value: '5', label: '5 porciones' },
  { value: '6', label: '6 porciones' },
  { value: 'libre', label: 'Libre elección' },
]

function portionLabel(value: string | null) {
  if (!value || value === 'libre') return 'Libre elección'
  return PORTION_OPTIONS.find(p => p.value === value)?.label ?? value
}

function momentsCountForDay(day: number) {
  return plan.value?.meal_plan_moments?.filter(m => m.days.includes(day)).length ?? 0
}

// Delete confirmation
const deletingMoment = ref<MealPlanMoment | null>(null)

async function confirmDelete() {
  if (!deletingMoment.value) return
  await removeMoment(deletingMoment.value.id)
  deletingMoment.value = null
}

// Sheet form
const dialogOpen = ref(false)
const editingMomentId = ref<string | null>(null)
const isEditing = computed(() => editingMomentId.value !== null)
const isLoading = ref(false)

const form = reactive({
  name: '',
  momentId: '',
  note: '',
  days: [] as number[],
  items: [{ foodType: '', portion: '' }] as { id?: string; foodType: string; portion: string }[],
})

function openEdit(m: MealPlanMoment) {
  editingMomentId.value = m.id
  form.name = m.name ?? ''
  form.momentId = m.moment_id
  form.note = m.note ?? ''
  form.days = [...m.days]
  form.items = m.meal_plan_items?.length
    ? m.meal_plan_items.map(i => ({ id: i.id, foodType: i.food_type, portion: i.portion ?? 'libre' }))
    : [{ foodType: '', portion: '' }]
  dialogOpen.value = true
}

function toggleDay(day: number) {
  const i = form.days.indexOf(day)
  if (i === -1) form.days.push(day)
  else form.days.splice(i, 1)
}

function setWeekdays() { form.days = [1, 2, 3, 4, 5] }
function setWeekend() { form.days = [6, 7] }
function setAll() { form.days = [1, 2, 3, 4, 5, 6, 7] }

function addRow() {
  form.items.push({ foodType: '', portion: '' })
}

function removeItemFromForm(index: number) {
  form.items.splice(index, 1)
}

function resetForm() {
  form.name = ''
  form.momentId = ''
  form.note = ''
  form.days = []
  form.items = [{ foodType: '', portion: '' }]
  editingMomentId.value = null
  dialogOpen.value = false
}

async function submitForm() {
  if (!form.momentId || !form.days.length || !plan.value) return
  const filledItems = form.items.filter(i => i.foodType)
  isLoading.value = true
  if (isEditing.value) {
    await updateMoment(editingMomentId.value!, form.name || null, form.momentId, form.days, form.note, filledItems)
  } else {
    await createMoment(plan.value.id, form.name || null, form.momentId, form.days, form.note, filledItems)
  }
  isLoading.value = false
  resetForm()
}
</script>

<template>
  <div id="meal-plan-view" class="space-y-4">
    <!-- header -->
    <header>
      <button class="text-sm flex gap-2 items-center text-muted-foreground cursor-pointer" @click="router.back()">
        <ArrowLeft :size="15" />
        Volver al Paciente
      </button>
    </header>

    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">Plan de alimentación</h1>
        <p v-if="user" class="text-muted-foreground text-sm">{{ user.full_name }}</p>
      </div>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    <p v-if="loading" class="text-sm text-muted-foreground">Cargando...</p>

    <div v-if="plan" class="space-y-4">
      <!-- Weekly coverage header -->
      <div class="border rounded-md p-3">
        <p class="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cobertura semanal</p>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="(name, di) in DAY_NAMES" :key="di" class="flex flex-col items-center gap-1">
            <span class="text-xs font-medium">{{ name }}</span>
            <span class="text-xs text-muted-foreground">{{ momentsCountForDay(di + 1) }}</span>
          </div>
        </div>
      </div>

      <!-- Moment cards -->
      <div class="space-y-3">
        <div v-for="m in plan.meal_plan_moments" :key="m.id" class="border rounded-md p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs border rounded-full px-2 py-0.5 font-medium">{{ m.moment?.name }}</span>
              </div>
              <p v-if="m.name" class="font-semibold text-sm">{{ m.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ m.meal_plan_items?.length ?? 0 }} tipos ·
                {{m.meal_plan_items?.filter(i => i.portion).length ?? 0}} porciones
              </p>
            </div>
            <!-- Day indicators -->
            <div class="flex gap-1 shrink-0">
              <span v-for="(label, di) in DAY_LABELS" :key="di"
                class="w-6 h-6 rounded text-xs flex items-center justify-center font-medium" :class="m.days.includes(di + 1)
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'">{{ label }}</span>
            </div>
          </div>

          <!-- Item chips -->
          <div v-if="m.meal_plan_items?.length" class="flex flex-wrap gap-2">
            <span v-for="item in m.meal_plan_items" :key="item.id" class="border rounded-full px-2 py-0.5 text-xs">
              {{ item.food_type }}
              <span class="text-muted-foreground">×{{ portionLabel(item.portion) }}</span>
            </span>
          </div>

          <p v-if="m.note" class="text-xs text-muted-foreground italic">{{ m.note }}</p>

          <div class="flex gap-3">
            <button class="text-xs text-muted-foreground hover:underline" @click="openEdit(m)">
              Editar
            </button>
            <button class="text-xs text-destructive hover:underline" @click="deletingMoment = m">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Create moment dialog -->
      <Sheet v-model:open="dialogOpen">
        <SheetTrigger as-child>
          <button
            class="w-full border border-dashed rounded-md py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            + Crear otro momento
          </button>
        </SheetTrigger>
        <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm">
          <SheetHeader>
            <SheetTitle>{{ isEditing ? 'Editar momento' : 'Nuevo momento' }}</SheetTitle>
            <SheetDescription class="sr-only">Formulario para {{ isEditing ? 'editar' : 'crear' }} un momento del plan
              de alimentación</SheetDescription>
          </SheetHeader>

          <div class="px-4 space-y-5 py-2 flex-1 overflow-y-auto">
            <!-- Nombre -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Nombre</label>
              <Input v-model="form.name" placeholder="Ej: Desayuno Semanal" />
            </div>

            <!-- Tipo de momento -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Tipo de momento <span class="text-destructive">*</span></label>
              <NativeSelect v-model="form.momentId">
                <option value="" disabled>Selecciona un momento...</option>
                <option v-for="m in moments" :key="m.id" :value="m.id">{{ m.name }}</option>
              </NativeSelect>
            </div>

            <!-- Composición -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Composición</label>
                <span class="text-xs text-muted-foreground">
                  {{form.items.filter(i => i.foodType).length}} tipos ·
                  {{form.items.filter(i => i.foodType && i.portion && i.portion !== 'libre').length}} porciones
                </span>
              </div>

              <div class="space-y-1.5">
                <div v-for="(item, i) in form.items" :key="i" class="flex gap-2">
                  <div class="flex-1">
                    <NativeSelect v-model="item.foodType">
                      <option value="" disabled>Selecciona un tipo...</option>
                      <option v-for="ft in FOOD_TYPES" :key="ft" :value="ft">{{ ft }}</option>
                    </NativeSelect>
                  </div>
                  <div class="w-36">
                    <NativeSelect v-model="item.portion">
                      <option value="" disabled>Porciones</option>
                      <option v-for="p in PORTION_OPTIONS" :key="p.value" :value="p.value">{{ p.label }}</option>
                    </NativeSelect>
                  </div>
                  <Button size="icon" variant="destructive" @click="removeItemFromForm(i)">
                    <XIcon :size="15" />
                  </Button>
                </div>
              </div>

              <Button class="w-full" size="lg" variant="secondary" @click="addRow">
                <PlusIcon :size="15" />
                Agregar tipo de comida
              </Button>
            </div>

            <!-- Días asignados -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Días asignados <span class="text-destructive">*</span></label>
                <div class="gap-2 text-xs text-muted-foreground hidden">
                  <button class="hover:text-foreground" @click="setWeekdays">L–V</button>
                  <button class="hover:text-foreground" @click="setWeekend">Finde</button>
                  <button class="hover:text-foreground" @click="setAll">Todos</button>
                </div>
              </div>
              <div class="grid grid-cols-7 gap-3">
                <Button v-for="(label, di) in DAY_LABELS" :key="di" @click="toggleDay(di + 1)"
                  :variant="form.days.includes(di + 1) ? 'default' : 'secondary'">
                  {{ label }}
                </Button>
              </div>
              <p v-if="!form.days.length" class="text-xs text-muted-foreground italic">Selecciona al menos un día.</p>
            </div>

            <!-- Notas -->
            <div class="grid gap-1.5">
              <label class="text-sm font-medium">Notas para el paciente <span
                  class="text-muted-foreground text-xs font-normal">(opcional)</span></label>
              <textarea v-model="form.note" rows="3" placeholder="Ej: Preferir pescado o pollo. Evitar fritos."
                class="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <SheetFooter class="grid grid-cols-2 gap-4 border-t">
            <Button size="lg" variant="outline" @click="resetForm" :disabled="isLoading">Cancelar</Button>
            <Button size="lg" @click="submitForm" :disabled="!form.momentId || !form.days.length || isLoading">
              <Spinner v-if="isLoading" />
              {{ isEditing ? 'Guardar cambios' : 'Guardar' }}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <!-- Delete confirmation dialog -->
      <Dialog :open="!!deletingMoment" @update:open="v => { if (!v) deletingMoment = null }">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este momento?</DialogTitle>
            <DialogDescription>
              <span class="font-medium text-foreground">{{ deletingMoment?.name ?? deletingMoment?.moment?.name
                }}</span>
              · {{ deletingMoment?.days.length }} día(s) afectado(s)
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Días afectados</p>
            <div class="flex gap-1.5">
              <span v-for="(label, di) in DAY_LABELS" :key="di"
                class="w-8 h-8 rounded text-xs flex items-center justify-center font-medium transition-opacity" :class="deletingMoment?.days.includes(di + 1)
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-muted text-muted-foreground opacity-30'">{{ label }}</span>
            </div>
            <p class="text-xs text-muted-foreground">
              Estos días quedarán sin momento de "{{ deletingMoment?.moment?.name }}" hasta que asignes otro.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="deletingMoment = null">Cancelar</Button>
            <Button variant="destructive" @click="confirmDelete">Sí, eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
