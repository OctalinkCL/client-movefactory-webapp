<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { formatDate } from "@/lib/utils";
import { useMealPlan } from "@/modules/meal-plans/composables/useMealPlan";

const props = defineProps<{ userId: string }>();

const router = useRouter();
const { plan, fetchPlan } = useMealPlan();

const dateUpdatePlan = computed(() =>
  plan.value ? formatDate(plan.value.updated_at) : "",
);

const hasPlan = computed(
  () => !!plan.value && (plan.value.meal_plan_moments?.length ?? 0) > 0,
);

const DAYS = [
  { short: "L", n: 1 },
  { short: "M", n: 2 },
  { short: "M", n: 3 },
  { short: "J", n: 4 },
  { short: "V", n: 5 },
  { short: "S", n: 6 },
  { short: "D", n: 7 },
];

function todayDayNumber(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

const weekDays = computed(() => {
  const today = new Date();
  const todayNumber = todayDayNumber();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (todayNumber - 1));

  return DAYS.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      ...day,
      date: date.getDate(),
      isToday: day.n === todayNumber,
    };
  });
});

function goToPlan() {
  router.push("/plan");
}

onMounted(() => fetchPlan(props.userId));
</script>

<template>
  <div class="rounded-xl bg-white">
    <h5 class="text-sm uppercase text-muted-foreground font-medium">Mi Plan</h5>
    <div v-if="hasPlan">
      <p class="font-medium">Plan asignado</p>
      <p class="text-sm text-muted-foreground">
        Última actualización: {{ dateUpdatePlan }}
      </p>
    </div>
    <div v-else>
      <p class="font-medium">Aun no tenemos plan asignado para ti.</p>
    </div>

    <ul class="grid grid-cols-7">
      <li
        v-for="day in weekDays"
        :key="day.n"
        :class="{ 'bg-black text-white': day.isToday }"
        @click="goToPlan"
      >
        <span>{{ day.short }}</span>
        <span>{{ day.date }}</span>
      </li>
    </ul>
  </div>
</template>
