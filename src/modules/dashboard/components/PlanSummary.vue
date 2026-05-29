<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'

const props = defineProps<{ userId: string }>()

const { plan, fetchPlan } = useMealPlan()

onMounted(() => fetchPlan(props.userId))

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const coveredDays = computed(() => {
  const days = new Set<number>()
  plan.value?.meal_plan_moments?.forEach(m => m.days.forEach(d => days.add(d)))
  return days
})
</script>

<template>
  <div class="border rounded-xl p-4">
    <h5 class="text-sm uppercase text-muted-foreground font-medium">Mi Plan</h5>
    <!-- plan -->
    <div v-if="plan">
      <div class="flex gap-1">
        <span v-for="(label, i) in DAY_LABELS" :key="i"
          class="w-9 h-9 rounded-md text-sm font-medium flex items-center justify-center"
          :class="coveredDays.has(i + 1) ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'">{{ label
          }}</span>
      </div>
      {{ plan?.updated_at }}
    </div>
    <!-- sin_plan -->
    <div v-else>
      <p class="font-medium">Aun no tenemos plan asignado para ti.</p>
    </div>
  </div>
</template>
