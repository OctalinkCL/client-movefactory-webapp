<script setup lang="ts">
import { onMounted } from 'vue'
import { useMealPlan } from '@/modules/meal-plans/composables/useMealPlan'

const props = defineProps<{ userId: string }>()

const { plan, fetchOrCreatePlan } = useMealPlan()

onMounted(() => fetchOrCreatePlan(props.userId))
</script>

<template>
  <div>
    <span v-if="plan">Tiene plan</span>
    <span v-else>Sin plan</span>
    <p>{{ plan?.updated_at }}</p>

    <pre>
      {{ plan }}
    </pre>
  </div>
</template>
