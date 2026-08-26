<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useTracking } from "@/modules/tracking/composables/useTracking";
import WeightTrendCard from "./WeightTrendCard.vue";
import CompositionRings from "./CompositionRings.vue";

const props = defineProps<{ userId: string }>();

const { sessions, fetchSessions } = useTracking();

onMounted(async () => {
  await fetchSessions(props.userId);
});

function getMeasurement(
  session: (typeof sessions.value)[number],
  metric: string,
) {
  return session.measurements?.find((m) => m.metric === metric)?.value ?? null;
}

const pesoSessions = computed(() =>
  [...sessions.value]
    .reverse()
    .filter((s) => getMeasurement(s, "weight") !== null)
    .slice(-6),
);

const weightData = computed(() =>
  pesoSessions.value.map((s) => ({
    fecha: s.date.slice(0, 10),
    valor: getMeasurement(s, "weight") as number,
  })),
);

const weightSecondarySeries = [
  { key: "fatPct", label: "% Masa grasa", color: "#ea580c" },
  { key: "musclePct", label: "% Masa muscular", color: "#7c3aed" },
];

const weightSecondaryData = computed(() =>
  pesoSessions.value.map((s) => ({
    fatPct: getMeasurement(s, "fat_pct") ?? undefined,
    musclePct: getMeasurement(s, "muscle_pct") ?? undefined,
  })),
);

function formatSessionDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const lastWeight = computed(() =>
  sessions.value[0] ? getMeasurement(sessions.value[0], "weight") : null,
);
const lastSessionDate = computed(() =>
  sessions.value[0] ? formatSessionDate(sessions.value[0].date) : null,
);

const lastFatPct = computed(() =>
  sessions.value[0]
    ? (getMeasurement(sessions.value[0], "fat_pct") ?? undefined)
    : undefined,
);
const lastMusclePct = computed(() =>
  sessions.value[0]
    ? (getMeasurement(sessions.value[0], "muscle_pct") ?? undefined)
    : undefined,
);
</script>

<template>
  <div class="grid gap-4 min-w-0">
    <div
      class="bg-white rounded-lg p-3 font-title flex justify-between items-center"
    >
      <div>
        <h3 class="font-semibold uppercase text-basr">Peso último control</h3>
        <p class="font-medium text-sm text-muted-foreground">
          {{ lastSessionDate ?? "Sin registros" }}
        </p>
      </div>
      <h5 class="text-4xl space-x-1">
        <span class="font-semibold">{{
          lastWeight != null ? String(lastWeight) : "--"
        }}</span>
        <small class="text-muted-foreground">{{
          lastWeight != null ? "kg" : undefined
        }}</small>
      </h5>
    </div>

    <section>
      <h3 class="text-base mb-1 font-medium text-muted-foreground uppercase">
        Tendencias de Peso <small>kg</small>
      </h3>
      <WeightTrendCard
        :data="weightData.length ? weightData : undefined"
        :secondary-series="weightSecondarySeries"
        :secondary-data="weightData.length ? weightSecondaryData : undefined"
      />
    </section>

    <CompositionRings :fatPct="lastFatPct" :musclePct="lastMusclePct" />
  </div>
</template>
