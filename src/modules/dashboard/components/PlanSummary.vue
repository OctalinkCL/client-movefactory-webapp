<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { formatDate } from '@/lib/utils'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'

const props = defineProps<{ userId: string }>()

const { plan, fetchPlan } = useMealPlan()

const dateUpdatePlan = computed(() =>
  plan.value ? formatDate(plan.value.updated_at) : ''
)

onMounted(() => fetchPlan(props.userId))
</script>

<template>
  <div class="border rounded-xl p-4">
    <h5 class="text-sm uppercase text-muted-foreground font-medium">Mi Plan</h5>
    <div v-if="plan">
      <p class="font-medium">Plan asignado</p>
      <p class="text-sm text-muted-foreground">Última actualización: {{ dateUpdatePlan }}</p>
    </div>
    <div v-else>
      <p class="font-medium">Aun no tenemos plan asignado para ti.</p>
    </div>
  </div>
</template>
