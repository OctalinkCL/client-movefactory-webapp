<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useMealPlan } from './composables/useMealPlan'
import { useUserFoodSelections } from './composables/useUserFoodSelections'
import { Skeleton } from '@/components/ui/skeleton'
import FoodPickerDrawer from './components/FoodPickerDrawer.vue'
import type { MealPlanMoment } from '@/types/meal-plan'
import type { Food } from '@/types/food'

const { profile } = storeToRefs(useAuthStore())
const { plan, loading, fetchPlan } = useMealPlan()
const { fetchForDay, getSelection, saveSelection } = useUserFoodSelections()

onMounted(() => {
  if (profile.value) fetchPlan(profile.value.id)
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

watch(selectedDay, (day) => {
  if (profile.value) fetchForDay(profile.value.id, day)
}, { immediate: true })

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

function momentName(m: MealPlanMoment): string {
  return m.name || m.moment?.name || 'Momento'
}

function momentIcon(m: MealPlanMoment): string {
  return MOMENT_ICONS[momentName(m)] ?? '🍽️'
}

async function handleSelect(mealPlanItemId: string, food: Food) {
  if (!profile.value) return
  await saveSelection(profile.value.id, mealPlanItemId, food.id, selectedDay.value)
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

    <div
      v-else-if="!plan"
      class="border rounded-xl p-10 text-center grid gap-1"
    >
      <p class="font-medium">Aún no tienes un plan asignado</p>
      <p class="text-sm text-muted-foreground">Tu nutricionista configurará tu plan pronto.</p>
    </div>

    <template v-else>
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
      <div
        v-if="momentsForDay.length === 0"
        class="border rounded-xl p-8 text-center text-muted-foreground"
      >
        <p class="text-sm">Sin momentos para este día.</p>
      </div>

      <!-- Momentos del día -->
      <div v-else class="grid gap-3">
        <div
          v-for="moment in momentsForDay"
          :key="moment.id"
          class="border rounded-xl overflow-hidden"
        >
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
          </div>

          <!-- Ítems -->
          <div v-if="moment.meal_plan_items?.length" class="border-t divide-y">
            <div
              v-for="item in moment.meal_plan_items"
              :key="item.id"
              class="flex items-center justify-between px-4 py-3 gap-4"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ item.food_type }}</p>
                <p class="text-xs text-muted-foreground">{{ item.portion ?? 'Libre elección' }}</p>
              </div>

              <span v-if="!item.portion" class="text-xs text-muted-foreground shrink-0">Libre</span>
              <FoodPickerDrawer
                v-else
                :food-type="item.food_type"
                :portion="item.portion"
                :selection="getSelection(item.id)"
                @select="(food) => handleSelect(item.id, food)"
              />
            </div>
          </div>

          <!-- Nota -->
          <div v-if="moment.note" class="px-4 py-3 bg-muted/50 border-t">
            <p class="text-xs text-muted-foreground">📝 {{ moment.note }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
