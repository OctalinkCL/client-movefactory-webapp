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
  { short: "Lun", n: 1 },
  { short: "Mar", n: 2 },
  { short: "Mie", n: 3 },
  { short: "Jue", n: 4 },
  { short: "Vie", n: 5 },
  { short: "Sab", n: 6 },
  { short: "Dom", n: 7 },
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
  router.push("/app/plan");
}

onMounted(() => fetchPlan(props.userId));
</script>

<template>
  <div class="rounded-xl bg-white p-3">
    <ul v-if="hasPlan" class="grid grid-cols-7 gap-2" @click="goToPlan">
      <li
        v-for="day in weekDays"
        :key="day.n"
        class="font-title uppercase grid text-center rounded leading-4 py-1"
        :class="{
          'bg-amber-400 text-white': day.isToday,
          'bg-zinc-100 ': !day.isToday,
        }"
        @click="goToPlan"
      >
        <span class="text-sm opacity-60">{{ day.short }}</span>
        <span class="text-xl font-medium">{{ day.date }}</span>
      </li>
    </ul>
    <p v-if="hasPlan" class="font-title text-xs text-muted-foreground mt-2">
      Última actualización del plan de alimentación: {{ dateUpdatePlan }}
    </p>
    <p v-if="!hasPlan" class="font-medium text-sm font-title">
      Aun no tenemos plan asignado para ti.
    </p>
  </div>
</template>
