<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditBenefit } from '../composables/useEditBenefit'
import { getBenefitPublicUrl } from '../lib/benefitStorage'
import type { Benefit } from '@/types/benefit'

const props = defineProps<{ benefit: Benefit | null }>()
const emit = defineEmits<{ updated: []; 'update:open': [boolean] }>()

const open = defineModel<boolean>('open', { default: false })

const form = reactive({ title: '', description: '', benefit: '', endDate: '' })
const photo = ref<File | null>(null)
const logo = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const logoPreview = ref<string | null>(null)

const { updateBenefit, loading, error } = useEditBenefit()

watch(open, (val) => {
  if (val && props.benefit) {
    form.title = props.benefit.title
    form.description = props.benefit.description ?? ''
    form.benefit = props.benefit.benefit
    form.endDate = props.benefit.end_date ?? ''
    photo.value = null
    logo.value = null
    photoPreview.value = null
    logoPreview.value = null
  }
})

const canSubmit = computed(() => form.title.trim() && form.benefit.trim())

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

async function submit() {
  if (!props.benefit || !canSubmit.value) return
  try {
    await updateBenefit(props.benefit, { ...form }, photo.value, logo.value)
    open.value = false
    emit('updated')
  } catch {
    // error ref set by composable
  }
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm flex flex-col gap-6 overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Editar beneficio</SheetTitle>
        <SheetDescription class="sr-only">Editar los datos de un beneficio</SheetDescription>
      </SheetHeader>

      <form @submit.prevent="submit" class="px-4 flex flex-col gap-5 flex-1">

        <!-- Foto -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Foto</label>
          <label
            class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
            :class="photo ? 'border-primary/40 bg-primary/5' : 'border-border'"
          >
            <img
              :src="photoPreview ?? (benefit ? getBenefitPublicUrl(benefit.photo_path) : '')"
              class="h-28 w-full object-cover rounded-md"
            />
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
            <img
              :src="logoPreview ?? (benefit ? getBenefitPublicUrl(benefit.logo_path) : '')"
              class="h-16 object-contain"
            />
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

        <SheetFooter class="grid grid-cols-2 gap-4 px-0 py-4 mt-auto">
          <Button type="button" size="lg" variant="outline" @click="open = false">Cancelar</Button>
          <Button type="submit" size="lg" :disabled="loading || !canSubmit">
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
