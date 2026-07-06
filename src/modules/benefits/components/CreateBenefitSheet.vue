<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, ImagePlus } from 'lucide-vue-next'
import { useCreateBenefit } from '../composables/useCreateBenefit'

const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const form = reactive({ title: '', description: '', benefit: '', endDate: '' })
const photo = ref<File | null>(null)
const logo = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const logoPreview = ref<string | null>(null)

const { createBenefit, loading, error } = useCreateBenefit()

const canSubmit = computed(() =>
  form.title.trim() && form.benefit.trim() && photo.value && logo.value
)

function onPhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  photo.value = input.files?.[0] ?? null
  photoPreview.value = photo.value ? URL.createObjectURL(photo.value) : null
}

function onLogoChange(e: Event) {
  const input = e.target as HTMLInputElement
  logo.value = input.files?.[0] ?? null
  logoPreview.value = logo.value ? URL.createObjectURL(logo.value) : null
}

function reset() {
  form.title = ''
  form.description = ''
  form.benefit = ''
  form.endDate = ''
  photo.value = null
  logo.value = null
  photoPreview.value = null
  logoPreview.value = null
}

async function submit() {
  if (!canSubmit.value || !photo.value || !logo.value) return
  try {
    await createBenefit({ ...form }, photo.value, logo.value)
    open.value = false
    reset()
    emit('created')
  } catch {
    // error ref set by composable
  }
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <Button>
        <Plus class="size-4" />
        Nuevo beneficio
      </Button>
    </SheetTrigger>

    <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm flex flex-col gap-6 overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Nuevo beneficio</SheetTitle>
        <SheetDescription class="sr-only">Formulario para crear un beneficio para los usuarios</SheetDescription>
      </SheetHeader>

      <form @submit.prevent="submit" class="px-4 flex flex-col gap-5 flex-1">

        <!-- Foto -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Foto</label>
          <label
            class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
            :class="photo ? 'border-primary/40 bg-primary/5' : 'border-border'"
          >
            <img v-if="photoPreview" :src="photoPreview" class="h-28 w-full object-cover rounded-md" />
            <template v-else>
              <ImagePlus class="size-6 text-muted-foreground" />
              <span class="text-sm text-muted-foreground text-center">Haz clic para seleccionar una foto</span>
            </template>
            <input type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
          </label>
        </div>

        <!-- Logo -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Logo</label>
          <label
            class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            :class="logo ? 'border-primary/40 bg-primary/5' : 'border-border'"
          >
            <img v-if="logoPreview" :src="logoPreview" class="h-16 object-contain" />
            <template v-else>
              <ImagePlus class="size-5 text-muted-foreground" />
              <span class="text-xs text-muted-foreground text-center">Haz clic para seleccionar un logo</span>
            </template>
            <input type="file" accept="image/*" class="hidden" @change="onLogoChange" />
          </label>
        </div>

        <!-- Titulo -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Título</label>
          <Input v-model="form.title" placeholder="Ej: Jeró Bistró" />
        </div>

        <!-- Beneficio -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Beneficio</label>
          <Input v-model="form.benefit" placeholder="Ej: 20% descuento" />
        </div>

        <!-- Descripcion -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Descripción</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Ej: Viernes - Maitencillo"
            class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-3 md:text-sm w-full outline-none placeholder:text-muted-foreground resize-none"
          />
        </div>

        <!-- Fecha termino -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Fecha término</label>
          <Input v-model="form.endDate" type="date" />
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <SheetFooter class="mt-auto">
          <Button type="submit" class="w-full" :disabled="loading || !canSubmit">
            {{ loading ? 'Creando...' : 'Crear beneficio' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
