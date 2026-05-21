<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/modules/users/composables/useUser'
import { useMealPlan } from './composables/useMealPlan'
import { useMoments } from './composables/useMoments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MealPlanMoment } from '@/types/meal-plan'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const { user } = useUser(userId)
const { plan, loading, error, fetchOrCreatePlan, createMoment, updateMoment, removeMoment, removeItem } = useMealPlan()
const { moments } = useMoments()

onMounted(() => fetchOrCreatePlan(userId))

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAY_NAMES  = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

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

// Sheet form
const dialogOpen = ref(false)
const editingMomentId = ref<string | null>(null)
const isEditing = computed(() => editingMomentId.value !== null)

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
function setWeekend()  { form.days = [6, 7] }
function setAll()      { form.days = [1, 2, 3, 4, 5, 6, 7] }

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
  if (isEditing.value) {
    await updateMoment(editingMomentId.value!, form.name || null, form.momentId, form.days, form.note, filledItems)
  } else {
    await createMoment(plan.value.id, form.name || null, form.momentId, form.days, form.note, filledItems)
  }
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
          <div
            v-for="(name, di) in DAY_NAMES"
            :key="di"
            class="flex flex-col items-center gap-1"
          >
            <span class="text-xs font-medium">{{ name }}</span>
            <span class="text-xs text-muted-foreground">{{ momentsCountForDay(di + 1) }}</span>
          </div>
        </div>
      </div>

      <!-- Moment cards -->
      <div class="space-y-3">
        <div
          v-for="m in plan.meal_plan_moments"
          :key="m.id"
          class="border rounded-md p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs border rounded-full px-2 py-0.5 font-medium">{{ m.moment?.name }}</span>
              </div>
              <p v-if="m.name" class="font-semibold text-sm">{{ m.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ m.meal_plan_items?.length ?? 0 }} tipos ·
                {{ m.meal_plan_items?.filter(i => i.portion).length ?? 0 }} porciones
              </p>
            </div>
            <!-- Day indicators -->
            <div class="flex gap-1 flex-shrink-0">
              <span
                v-for="(label, di) in DAY_LABELS"
                :key="di"
                class="w-6 h-6 rounded text-xs flex items-center justify-center font-medium"
                :class="m.days.includes(di + 1)
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'"
              >{{ label }}</span>
            </div>
          </div>

          <!-- Item chips -->
          <div v-if="m.meal_plan_items?.length" class="flex flex-wrap gap-2">
            <span
              v-for="item in m.meal_plan_items"
              :key="item.id"
              class="flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs"
            >
              {{ item.food_type }}
              <span class="text-muted-foreground">×{{ portionLabel(item.portion) }}</span>
              <button class="text-destructive hover:text-destructive/70 ml-0.5" @click="removeItem(item.id, m.id)">×</button>
            </span>
          </div>

          <p v-if="m.note" class="text-xs text-muted-foreground italic">{{ m.note }}</p>

          <div class="flex gap-3">
            <button class="text-xs text-muted-foreground hover:underline" @click="openEdit(m)">
              Editar
            </button>
            <button class="text-xs text-destructive hover:underline" @click="removeMoment(m.id)">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Create moment dialog -->
      <Sheet v-model:open="dialogOpen">
        <SheetTrigger as-child>
          <button class="w-full border border-dashed rounded-md py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            + Crear otro momento
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{{ isEditing ? 'Editar momento' : 'Nuevo momento' }}</SheetTitle>
          </SheetHeader>

          <div class="space-y-5 py-2">
            <!-- Nombre -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Nombre</label>
              <Input v-model="form.name" placeholder="Ej: Desayuno Semanal" />
            </div>

            <!-- Tipo de momento -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Tipo de momento <span class="text-destructive">*</span></label>
              <select v-model="form.momentId" class="w-full border rounded-md px-3 py-2 text-sm bg-background">
                <option value="" disabled>Selecciona un momento...</option>
                <option v-for="m in moments" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>

            <!-- Composición -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Composición</label>
                <span class="text-xs text-muted-foreground">
                  {{ form.items.filter(i => i.foodType).length }} tipos ·
                  {{ form.items.filter(i => i.foodType && i.portion && i.portion !== 'libre').length }} porciones
                </span>
              </div>

              <div class="space-y-1.5">
                <div
                  v-for="(item, i) in form.items"
                  :key="i"
                  class="flex gap-2"
                >
                  <select v-model="item.foodType" class="flex-1 border rounded-md px-2 py-1.5 text-sm bg-background">
                    <option value="" disabled>Selecciona un tipo...</option>
                    <option v-for="ft in FOOD_TYPES" :key="ft" :value="ft">{{ ft }}</option>
                  </select>
                  <select v-model="item.portion" class="w-36 border rounded-md px-2 py-1.5 text-sm bg-background">
                    <option value="" disabled>Porciones</option>
                    <option v-for="p in PORTION_OPTIONS" :key="p.value" :value="p.value">{{ p.label }}</option>
                  </select>
                  <button
                    class="border rounded-md px-2.5 text-muted-foreground hover:text-destructive transition-colors"
                    @click="removeItemFromForm(i)"
                  >×</button>
                </div>
              </div>

              <button
                class="w-full border border-dashed rounded-md py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                @click="addRow"
              >
                + Agregar tipo de comida
              </button>
            </div>

            <hr />

            <!-- Días asignados -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Días asignados <span class="text-destructive">*</span></label>
                <div class="flex gap-2 text-xs text-muted-foreground">
                  <button class="hover:text-foreground" @click="setWeekdays">L–V</button>
                  <button class="hover:text-foreground" @click="setWeekend">Finde</button>
                  <button class="hover:text-foreground" @click="setAll">Todos</button>
                </div>
              </div>
              <div class="flex gap-1.5">
                <button
                  v-for="(label, di) in DAY_LABELS"
                  :key="di"
                  class="w-9 h-9 rounded-md text-sm font-medium border transition-colors"
                  :class="form.days.includes(di + 1)
                    ? 'bg-foreground text-background border-foreground'
                    : 'hover:bg-muted'"
                  @click="toggleDay(di + 1)"
                >{{ label }}</button>
              </div>
              <p v-if="!form.days.length" class="text-xs text-muted-foreground">Selecciona al menos un día.</p>
            </div>

            <hr />

            <!-- Notas -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Notas para el paciente <span class="text-muted-foreground text-xs font-normal">(opcional)</span></label>
              <textarea
                v-model="form.note"
                rows="3"
                placeholder="Ej: Preferir pescado o pollo. Evitar fritos."
                class="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" @click="resetForm">Cancelar</Button>
            <Button @click="submitForm" :disabled="!form.momentId || !form.days.length">
              {{ isEditing ? 'Guardar cambios' : 'Guardar' }}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</template>
