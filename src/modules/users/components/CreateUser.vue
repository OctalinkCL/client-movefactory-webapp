<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateUser } from "../composables/useCreateUser";

const props = defineProps<{
  role: "nutritionist" | "user";
}>()

const emit = defineEmits<{ created: [] }>()

const label = computed(() =>
  props.role === "nutritionist" ? "Staff" : "Usuario",
);

const open = ref(false);
const form = reactive({ full_name: "", email: "", password: "" });
const { createUser, loading, error } = useCreateUser();

async function submit() {
  try {
    await createUser({ ...form, role: props.role });
    open.value = false;
    Object.assign(form, { full_name: "", email: "", password: "" });
    emit("created");
  } catch {
    // error ref is set by composable
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>Agregar {{ label }}</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md" :aria-describedby="undefined">
      <DialogHeader>
        <DialogTitle>Nuevo {{ label }}</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="submit" class="flex flex-col gap-4 pt-4">
        <Input v-model="form.full_name" placeholder="Nombre completo" />
        <Input v-model="form.email" type="email" placeholder="Email" />
        <Input v-model="form.password" type="password" placeholder="Contraseña temporal" autocomplete="off" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <DialogFooter>
          <Button type="submit" :disabled="loading">
            {{ loading ? "Creando..." : "Crear" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
