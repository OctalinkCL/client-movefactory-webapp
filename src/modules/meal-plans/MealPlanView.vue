<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/modules/users/composables/useUser'
import { useMealPlan } from './composables/useMealPlan'
import { useMoments } from './composables/useMoments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const { user } = useUser(userId)
const { plan, loading, error, fetchOrCreatePlan, addMoment, removeMoment, addItem, removeItem } = useMealPlan()
const { moments } = useMoments()

onMounted(() => fetchOrCreatePlan(userId))

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function momentsByDay(day: number) {
  return plan.value?.meal_plan_moments?.filter(m => m.day === day) ?? []
}

// Add moment form state
const addingDay = ref<number | null>(null)
const momentForm = reactive({ momentId: '', note: '' })

async function submitMoment(day: number) {
  if (!momentForm.momentId || !plan.value) return
  await addMoment(plan.value.id, day, momentForm.momentId, momentForm.note)
  momentForm.momentId = ''
  momentForm.note = ''
  addingDay.value = null
}

// Add item form state
const addingItemFor = ref<string | null>(null)
const itemForm = reactive({ foodType: '', portion: '', isFreeChoice: false })

async function submitItem(planMomentId: string) {
  if (!itemForm.foodType) return
  await addItem(planMomentId, { ...itemForm })
  itemForm.foodType = ''
  itemForm.portion = ''
  itemForm.isFreeChoice = false
  addingItemFor.value = null
}
</script>

<template>
  <div class="p-6 space-y-6">
    <button class="text-sm text-muted-foreground hover:underline" @click="router.back()">
      ← Volver
    </button>

    <div class="space-y-1">
      <h1 class="text-2xl font-semibold">Plan de alimentación</h1>
      <p v-if="user" class="text-muted-foreground text-sm">{{ user.full_name }}</p>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    <p v-if="loading" class="text-sm text-muted-foreground">Cargando...</p>

    <div v-if="plan" class="space-y-4">
      <section
        v-for="(dayName, index) in DAYS"
        :key="index"
        class="border rounded-md p-4 space-y-3"
      >
        <h2 class="font-medium">{{ dayName }}</h2>

        <!-- Moments of this day -->
        <div
          v-for="m in momentsByDay(index + 1)"
          :key="m.id"
          class="border-l-2 pl-3 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm">{{ m.moment?.name }}</span>
            <button class="text-xs text-destructive hover:underline" @click="removeMoment(m.id)">
              Eliminar
            </button>
          </div>
          <p v-if="m.note" class="text-xs text-muted-foreground">{{ m.note }}</p>

          <!-- Items -->
          <ul class="space-y-1">
            <li
              v-for="item in m.meal_plan_items"
              :key="item.id"
              class="flex items-center justify-between text-sm"
            >
              <span>
                {{ item.is_free_choice ? '🟢 Libre elección' : `${item.portion} ${item.food_type}` }}
              </span>
              <button class="text-xs text-destructive hover:underline" @click="removeItem(item.id, m.id)">
                ×
              </button>
            </li>
          </ul>

          <!-- Add item form -->
          <div v-if="addingItemFor === m.id" class="flex flex-col gap-2 pt-1">
            <Input v-model="itemForm.foodType" placeholder="Tipo de alimento (ej: Proteína)" />
            <Input v-if="!itemForm.isFreeChoice" v-model="itemForm.portion" placeholder="Porción (ej: 250g)" />
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="itemForm.isFreeChoice" />
              Libre elección
            </label>
            <div class="flex gap-2">
              <Button size="sm" @click="submitItem(m.id)">Agregar</Button>
              <Button size="sm" variant="outline" @click="addingItemFor = null">Cancelar</Button>
            </div>
          </div>
          <button
            v-else
            class="text-xs text-muted-foreground hover:underline"
            @click="addingItemFor = m.id"
          >
            + Agregar ítem
          </button>
        </div>

        <!-- Add moment form -->
        <div v-if="addingDay === index + 1" class="flex flex-col gap-2">
          <select
            v-model="momentForm.momentId"
            class="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="" disabled>Seleccionar momento</option>
            <option v-for="m in moments" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <Input v-model="momentForm.note" placeholder="Nota (opcional)" />
          <div class="flex gap-2">
            <Button size="sm" @click="submitMoment(index + 1)">Agregar</Button>
            <Button size="sm" variant="outline" @click="addingDay = null">Cancelar</Button>
          </div>
        </div>
        <Button v-else size="sm" variant="outline" @click="addingDay = index + 1">
          + Momento
        </Button>
      </section>
    </div>
  </div>
</template>
