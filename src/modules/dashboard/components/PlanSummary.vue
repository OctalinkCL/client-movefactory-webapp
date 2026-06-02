<script setup lang="ts">
import { onMounted } from 'vue'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'

const props = defineProps<{ userId: string }>()

const { plan, fetchPlan } = useMealPlan()

onMounted(() => fetchPlan(props.userId))
</script>

<template>
  <div class="border rounded-xl p-4">
    <h5 class="text-sm uppercase text-muted-foreground font-medium">Mi Plan</h5>
    <div v-if="plan">
      <p class="font-medium">Plan asignado</p>
      <p class="text-sm text-muted-foreground">Última actualización: {{ plan.updated_at }}</p>
    </div>
    <div v-else>
      <p class="font-medium">Aun no tenemos plan asignado para ti.</p>
    </div>
  </div>
</template>
