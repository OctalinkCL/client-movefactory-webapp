<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useMealPlan } from './composables/useMealPlan'
import { useUserFoodSelections } from './composables/useUserFoodSelections'
import { useItemSplits } from './composables/useItemSplits'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import FoodPickerDrawer from './components/FoodPickerDrawer.vue'
import RepeatMomentDrawer from './components/RepeatMomentDrawer.vue'
import type { MealPlanMoment, MealPlanItem } from '@/types/meal-plan'
import type { Food } from '@/types/food'
import type { UserFoodSelection } from '@/types/food-selection'

const router = useRouter()
const { profile } = storeToRefs(useAuthStore())
const { plan, loading, fetchPlan } = useMealPlan()
const { fetchAll, getSelection, saveSelection, clearSlotsFrom, copySelectionsForMoment } = useUserFoodSelections()
const { isSplit, fetchSplits, splitItem, unsplitItem } = useItemSplits()

onMounted(() => {
  if (!profile.value) return
  fetchPlan(profile.value.id)
  fetchAll(profile.value.id)
  fetchSplits(profile.value.id)
})

const DAYS = [
  { short: 'L', full: 'Lunes', n: 1 },
  { short: 'M', full: 'Martes', n: 2 },
  { short: 'M', full: 'Miércoles', n: 3 },
  { short: 'J', full: 'Jueves', n: 4 },
  { short: 'V', full: 'Viernes', n: 5 },
  { short: 'S', full: 'Sábado', n: 6 },
  { short: 'D', full: 'Domingo', n: 7 },
]

const MOMENT_ICONS: Record<string, string> = {
  'Desayuno': '🌟',
  'Media mañana': '☕',
  'Almuerzo': '🥗',
  'Media tarde': '🍎',
  'Cena': '🌙',
  'Post Entrenamiento': '💪',
}

function todayDayNumber(): number {
  const d = new Date().getDay()
  return d === 0 ? 7 : d
}

const selectedDay = ref(todayDayNumber())

const coveredDays = computed(() => {
  const days = new Set<number>()
  plan.value?.meal_plan_moments?.forEach(m => m.days.forEach(d => days.add(d)))
  return days
})

const momentsForDay = computed(() => {
  if (!plan.value?.meal_plan_moments) return []
  return plan.value.meal_plan_moments
    .filter(m => m.days.includes(selectedDay.value))
    .sort((a, b) => (a.moment?.sort_order ?? 0) - (b.moment?.sort_order ?? 0))
})

// Slots que hay que completar para un ítem: 1 si está combinado (o tiene
// una sola porción), o tantos como porciones si el alumno lo dividió.
function slotsForItem(item: MealPlanItem): number[] {
  if (item.portion === null) return []
  const total = Number(item.portion) || 1
  if (total <= 1 || !isSplit(item.id)) return [0]
  return Array.from({ length: total }, (_, i) => i)
}

function dayIsComplete(dayN: number): boolean {
  if (!coveredDays.value.has(dayN)) return false
  const moments = plan.value?.meal_plan_moments?.filter(m => m.days.includes(dayN)) ?? []
  return moments.length > 0 && moments.every(m => {
    const required = (m.meal_plan_items ?? []).filter(i => i.portion !== null)
    return required.length > 0 && required.every(i =>
      slotsForItem(i).every(slot => getSelection(i.id, dayN, slot) !== null)
    )
  })
}

function momentName(m: MealPlanMoment): string {
  return m.name || m.moment?.name || 'Momento'
}

function momentIcon(m: MealPlanMoment): string {
  return MOMENT_ICONS[momentName(m)] ?? '🍽️'
}

function momentIsComplete(moment: MealPlanMoment): boolean {
  const required = (moment.meal_plan_items ?? []).filter(i => i.portion !== null)
  if (!required.length) return true
  return required.every(i =>
    slotsForItem(i).every(slot => getSelection(i.id, selectedDay.value, slot) !== null)
  )
}

function getSelectionsForMoment(moment: MealPlanMoment): UserFoodSelection[] {
  return (moment.meal_plan_items ?? []).flatMap(i =>
    slotsForItem(i)
      .map(slot => getSelection(i.id, selectedDay.value, slot))
      .filter(Boolean)
  ) as UserFoodSelection[]
}

async function handleSelect(mealPlanItemId: string, food: Food, slotIndex = 0) {
  if (!profile.value) return
  await saveSelection(profile.value.id, mealPlanItemId, food.id, selectedDay.value, slotIndex)
}

async function handleSplit(itemId: string) {
  if (!profile.value) return
  await splitItem(profile.value.id, itemId)
}

const unsplitting = ref<{ id: string; foodType: string } | null>(null)

function askUnsplit(item: MealPlanItem) {
  unsplitting.value = { id: item.id, foodType: item.food_type }
}

async function confirmUnsplit() {
  if (!profile.value || !unsplitting.value) return
  const itemId = unsplitting.value.id
  await unsplitItem(profile.value.id, itemId)
  await clearSlotsFrom(profile.value.id, itemId, 1)
  unsplitting.value = null
}

const allDaysComplete = computed(() => {
  if (!coveredDays.value.size) return false
  return [...coveredDays.value].every(d => dayIsComplete(d))
})

async function handleCopy(moment: MealPlanMoment, targetDays: number[]) {
  if (!profile.value) return
  const itemIds = (moment.meal_plan_items ?? []).map(i => i.id)
  await copySelectionsForMoment(profile.value.id, itemIds, getSelectionsForMoment(moment), targetDays)
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="leading-tight">
      <h1 class="text-xl font-medium">Mi plan</h1>
      <p class="text-sm text-muted-foreground">Tu pauta de alimentación semanal.</p>
    </header>

    <div v-if="loading" class="grid gap-3">
      <Skeleton class="h-20 rounded-xl" />
      <Skeleton class="h-28 rounded-xl" v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="!plan" class="border rounded-xl p-10 text-center grid gap-1">
      <p class="font-medium">Aún no tienes un plan asignado</p>
      <p class="text-sm text-muted-foreground">Tu nutricionista configurará tu plan pronto.</p>
    </div>

    <template v-else>
      <!-- Botón lista de compras -->
      <button
        v-if="allDaysComplete"
        @click="router.push({ name: 'user-shopping' })"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-medium transition-colors hover:bg-foreground/90"
      >
        🛒 Lista de compras
      </button>

      <!-- Selector de días -->
      <div class="border rounded-xl p-3 grid gap-2">
        <div class="flex gap-1">
          <button
            v-for="day in DAYS"
            :key="day.n"
            @click="selectedDay = day.n"
            class="flex-1 h-10 rounded-lg text-sm font-medium transition-colors"
            :class="selectedDay === day.n
              ? 'bg-foreground text-background'
              : dayIsComplete(day.n)
                ? 'bg-green-500 text-white hover:bg-green-600'
                : coveredDays.has(day.n)
                  ? 'bg-muted text-foreground hover:bg-muted/70'
                  : 'text-muted-foreground hover:bg-muted/50'"
          >{{ day.short }}</button>
        </div>
        <p class="text-sm text-muted-foreground px-1">
          {{ DAYS.find(d => d.n === selectedDay)?.full }} · {{ momentsForDay.length }} momentos
        </p>
      </div>

      <!-- Sin momentos en el día -->
      <div v-if="momentsForDay.length === 0" class="border rounded-xl p-8 text-center text-muted-foreground">
        <p class="text-sm">Sin momentos para este día.</p>
      </div>

      <!-- Momentos del día -->
      <div v-else class="grid gap-3">
        <div v-for="moment in momentsForDay" :key="moment.id" class="border rounded-xl overflow-hidden">

          <!-- Header del momento -->
          <div class="flex items-center gap-3 p-4">
            <span class="text-2xl leading-none">{{ momentIcon(moment) }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium">{{ momentName(moment) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ moment.meal_plan_items?.length ?? 0 }}
                {{ (moment.meal_plan_items?.length ?? 0) === 1 ? 'tipo' : 'tipos' }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <RepeatMomentDrawer
                :moment-name="momentName(moment)"
                :moment-days="moment.days"
                :current-day="selectedDay"
                :disabled="!momentIsComplete(moment)"
                @copy="(days) => handleCopy(moment, days)"
              />
              <span
                class="text-xs font-medium"
                :class="momentIsComplete(moment) ? 'text-green-600' : 'text-muted-foreground'"
              >
                {{ momentIsComplete(moment) ? 'Listo' : 'Pendiente' }}
              </span>
            </div>
          </div>

          <!-- Ítems -->
          <div v-if="moment.meal_plan_items?.length" class="border-t divide-y">
            <div v-for="item in moment.meal_plan_items" :key="item.id">
              <!-- Libre elección -->
              <div v-if="!item.portion" class="flex items-center justify-between px-4 py-3 gap-4">
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ item.food_type }}</p>
                  <p class="text-xs text-muted-foreground">Libre elección</p>
                </div>
                <span class="text-xs text-muted-foreground shrink-0">Libre</span>
              </div>

              <!-- Dividido: un selector por porción -->
              <template v-else-if="isSplit(item.id) && Number(item.portion) > 1">
                <div
                  v-for="slot in slotsForItem(item)"
                  :key="slot"
                  class="flex items-center justify-between px-4 py-3 gap-4"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-medium">{{ item.food_type }} {{ slot + 1 }}</p>
                    <p class="text-xs text-muted-foreground">1 porción</p>
                  </div>
                  <FoodPickerDrawer
                    :food-type="item.food_type"
                    :label="`${item.food_type} ${slot + 1}`"
                    portion="1"
                    :selection="getSelection(item.id, selectedDay, slot)"
                    @select="(food) => handleSelect(item.id, food, slot)"
                  />
                </div>
                <button
                  class="w-full text-left px-4 pb-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click="askUnsplit(item)"
                >
                  Combinar en un solo alimento
                </button>
              </template>

              <!-- Combinado: un selector escalado x N (default) -->
              <template v-else>
                <div class="flex items-center justify-between px-4 py-3 gap-4">
                  <div class="min-w-0">
                    <p class="text-sm font-medium">{{ item.food_type }}</p>
                    <p class="text-xs text-muted-foreground">{{ item.portion }}</p>
                  </div>
                  <FoodPickerDrawer
                    :food-type="item.food_type"
                    :portion="item.portion"
                    :selection="getSelection(item.id, selectedDay, 0)"
                    @select="(food) => handleSelect(item.id, food, 0)"
                  />
                </div>
                <button
                  v-if="Number(item.portion) > 1"
                  class="w-full text-left px-4 pb-3 text-xs text-primary hover:underline"
                  @click="handleSplit(item.id)"
                >
                  Dividir en {{ item.portion }} alimentos distintos
                </button>
              </template>
            </div>
          </div>

          <!-- Nota -->
          <div v-if="moment.note" class="px-4 py-3 bg-muted/50 border-t">
            <p class="text-xs text-muted-foreground">📝 {{ moment.note }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Confirmación al combinar un ítem dividido -->
    <Dialog :open="!!unsplitting" @update:open="v => { if (!v) unsplitting = null }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Combinar en un solo alimento?</DialogTitle>
          <DialogDescription>
            Vas a volver a elegir un único alimento para
            <span class="font-medium text-foreground">{{ unsplitting?.foodType }}</span>.
            Las selecciones adicionales que hiciste se van a perder.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="unsplitting = null">Cancelar</Button>
          <Button variant="destructive" @click="confirmUnsplit">Sí, combinar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
