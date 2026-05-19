<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/modules/users/composables/useUser'
import { useMealPlan } from './composables/useMealPlan'
import { useMoments } from './composables/useMoments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const { user } = useUser(userId)
const { plan, loading, error, fetchOrCreatePlan, removeMoment, removeItem, createMomentForDays } = useMealPlan()
const { moments } = useMoments()

onMounted(() => fetchOrCreatePlan(userId))

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const selectedDay = ref(1)

function momentsByDay(day: number) {
  return plan.value?.meal_plan_moments?.filter(m => m.day === day) ?? []
}

// New moment form
const dialogOpen = ref(false)
const form = reactive({
  momentId: '',
  note: '',
  days: [] as number[],
  items: [] as { foodType: string; portion: string; isFreeChoice: boolean }[],
})
const newItem = reactive({ foodType: '', portion: '', isFreeChoice: false })

function addItemToForm() {
  if (!newItem.foodType) return
  form.items.push({ ...newItem })
  newItem.foodType = ''
  newItem.portion = ''
  newItem.isFreeChoice = false
}

function removeItemFromForm(index: number) {
  form.items.splice(index, 1)
}

function resetForm() {
  form.momentId = ''
  form.note = ''
  form.days = []
  form.items = []
  dialogOpen.value = false
}

async function submitForm() {
  if (!form.momentId || !form.days.length || !plan.value) return
  await createMomentForDays(plan.value.id, form.days, form.momentId, form.note, form.items)
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
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>+ Nuevo momento</Button>
        </DialogTrigger>
        <DialogContent :aria-describedby="undefined" class="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo momento</DialogTitle>
          </DialogHeader>

          <div class="space-y-4 py-2">
            <select v-model="form.momentId" class="w-full border rounded-md px-3 py-2 text-sm bg-background">
              <option value="" disabled>Seleccionar tipo de momento</option>
              <option v-for="m in moments" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>

            <Input v-model="form.note" placeholder="Nota (opcional)" />

            <!-- Items -->
            <div class="space-y-2">
              <p class="text-sm font-medium">Ítems</p>
              <ul class="space-y-1">
                <li v-for="(item, i) in form.items" :key="i" class="flex items-center justify-between text-sm">
                  <span>{{ item.isFreeChoice ? '🟢 Libre elección' : `${item.portion} ${item.foodType}` }}</span>
                  <button class="text-xs text-destructive hover:underline" @click="removeItemFromForm(i)">×</button>
                </li>
              </ul>
              <div class="flex flex-col gap-2">
                <Input v-model="newItem.foodType" placeholder="Tipo de alimento (ej: Proteína)" />
                <Input v-if="!newItem.isFreeChoice" v-model="newItem.portion" placeholder="Porción (ej: 250g)" />
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="newItem.isFreeChoice" />
                  Libre elección
                </label>
                <Button size="sm" variant="outline" @click="addItemToForm">+ Agregar ítem</Button>
              </div>
            </div>

            <!-- Day checkboxes -->
            <div class="space-y-2">
              <p class="text-sm font-medium">Aplicar en los días</p>
              <div class="flex flex-wrap gap-3">
                <label v-for="(dayName, di) in DAYS" :key="di" class="flex items-center gap-1 text-sm">
                  <input type="checkbox" :value="di + 1" v-model="form.days" />
                  {{ dayName.slice(0, 3) }}
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="resetForm">Cancelar</Button>
            <Button @click="submitForm" :disabled="!form.momentId || !form.days.length">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    <p v-if="loading" class="text-sm text-muted-foreground">Cargando...</p>

    <!-- Day tabs -->
    <div v-if="plan" class="space-y-4">
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="(dayName, di) in DAYS"
          :key="di"
          class="px-3 py-1 rounded-md text-sm border transition-colors"
          :class="selectedDay === di + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="selectedDay = di + 1"
        >
          {{ dayName.slice(0, 3) }}
        </button>
      </div>

      <!-- Selected day content -->
      <div class="space-y-3">
        <p v-if="momentsByDay(selectedDay).length === 0" class="text-sm text-muted-foreground">
          Sin momentos para este día.
        </p>
        <div
          v-for="m in momentsByDay(selectedDay)"
          :key="m.id"
          class="border rounded-md p-3 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm">{{ m.moment?.name }}</span>
            <button class="text-xs text-destructive hover:underline" @click="removeMoment(m.id)">
              Eliminar
            </button>
          </div>
          <p v-if="m.note" class="text-xs text-muted-foreground">{{ m.note }}</p>
          <ul class="space-y-1">
            <li
              v-for="item in m.meal_plan_items"
              :key="item.id"
              class="flex items-center justify-between text-sm"
            >
              <span>{{ item.is_free_choice ? '🟢 Libre elección' : `${item.portion} ${item.food_type}` }}</span>
              <button class="text-xs text-destructive hover:underline" @click="removeItem(item.id, m.id)">×</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
