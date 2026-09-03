<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { HTMLAttributes } from "vue";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarVariants,
} from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type LoadingStatus = "idle" | "loading" | "loaded" | "error";

const props = defineProps<{
  /** Foto real del usuario. Si no viene, se usa un avatar generado. */
  src?: string | null;
  /** Nombre del usuario: se usa para las iniciales y el alt. */
  name?: string | null;
  /**
   * Semilla del avatar generado. Debe ser estable por usuario (id o email)
   * para que cada usuario siempre tenga el mismo avatar. Si no se pasa,
   * se usa el nombre.
   */
  seed?: string | null;
  size?: AvatarVariants["size"];
  class?: HTMLAttributes["class"];
}>();

// Avatar aleatorio pero determinista: misma semilla => mismo avatar siempre.
const generatedUrl = computed(() => {
  const seed = props.seed || props.name || "anon";
  return `https://api.dicebear.com/10.x/critters/svg?seed=${encodeURIComponent(seed)}`;
});

// Si la foto real falla al cargar, caemos al avatar generado.
const srcFailed = ref(false);
watch(
  () => props.src,
  () => {
    srcFailed.value = false;
  },
);

const imageSrc = computed(() =>
  props.src && !srcFailed.value ? props.src : generatedUrl.value,
);

const initials = computed(() => (props.name ? getInitials(props.name) : "?"));

function onStatusChange(status: LoadingStatus) {
  if (status === "error") srcFailed.value = true;
}
</script>

<template>
  <Avatar :size="size" :class="props.class">
    <AvatarImage
      :src="imageSrc"
      :alt="name ?? ''"
      @loading-status-change="onStatusChange"
    />
    <AvatarFallback class="text-xs font-medium">{{ initials }}</AvatarFallback>
  </Avatar>
</template>
