<script setup lang="ts">
import { computed } from "vue";
import { VisSingleContainer, VisDonut } from "@unovis/vue";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const props = defineProps<{ fatPct?: number; musclePct?: number }>();

const config: ChartConfig = {
  valor: { label: "Composición corporal" },
};

const LIME = "#84cc16";

const value = (d: { valor: number }) => d.valor;
const color = (_: unknown, i: number) => (i === 0 ? LIME : "var(--muted)");

const rings = computed(() => [
  { label: "% Masa grasa", pct: props.fatPct },
  { label: "% Masa muscular", pct: props.musclePct },
]);

function ringData(pct: number) {
  return [{ valor: pct }, { valor: 100 - pct }];
}
</script>

<template>
  <div class="border rounded-xl p-4 bg-card min-w-0">
    <p class="text-sm font-medium mb-3">Composición corporal actual</p>
    <template v-if="props.fatPct != null || props.musclePct != null">
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="ring in rings"
          :key="ring.label"
          class="flex flex-col items-center gap-2"
        >
          <template v-if="ring.pct != null">
            <div class="size-28">
              <ChartContainer :config="config">
                <template #default="{ id }">
                  <VisSingleContainer :data="ringData(ring.pct)" :id="id">
                    <VisDonut
                      :value="value"
                      :color="color"
                      :arcWidth="10"
                      :cornerRadius="6"
                      :padAngle="0.02"
                      :centralLabel="`${ring.pct}%`"
                    />
                  </VisSingleContainer>
                </template>
              </ChartContainer>
            </div>
            <p class="text-xs text-muted-foreground text-center">
              {{ ring.label }}
            </p>
          </template>
          <template v-else>
            <div class="size-28 flex items-center justify-center">
              <p class="text-xs text-muted-foreground">Sin dato</p>
            </div>
            <p class="text-xs text-muted-foreground text-center">
              {{ ring.label }}
            </p>
          </template>
        </div>
      </div>
    </template>
    <div v-else class="h-28 flex items-center justify-center">
      <p class="text-xs text-muted-foreground">Aún no hay registros</p>
    </div>
  </div>
</template>
