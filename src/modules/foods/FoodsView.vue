<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useFoods } from './composables/useFoods'
import type { Food } from '@/types/food'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet'

const { foods, categories, loading, fetchFoods, fetchCategories, createFood, updateFood } = useFoods()

onMounted(() => { fetchFoods(); fetchCategories() })

const sheetOpen = ref(false)
const editingId = ref<string | null>(null)
const isEditing = computed(() => editingId.value !== null)

const form = reactive({
  name: '',
  category_id: '',
  portion_grams: '',
  portion_grams_cooked: '',
  household_measure: '',
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.category_id = ''
  form.portion_grams = ''
  form.portion_grams_cooked = ''
  form.household_measure = ''
  sheetOpen.value = true
}

function openEdit(food: Food) {
  editingId.value = food.id
  form.name = food.name
  form.category_id = food.category_id
  form.portion_grams = food.portion_grams.toString()
  form.portion_grams_cooked = food.portion_grams_cooked?.toString() ?? ''
  form.household_measure = food.household_measure ?? ''
  sheetOpen.value = true
}

async function submit() {
  const fields = {
    name: form.name,
    category_id: form.category_id,
    portion_grams: parseFloat(form.portion_grams),
    portion_grams_cooked: form.portion_grams_cooked ? parseFloat(form.portion_grams_cooked) : null,
    household_measure: form.household_measure || null,
  }
  const ok = isEditing.value
    ? await updateFood(editingId.value!, fields)
    : await createFood(fields)
  if (ok) sheetOpen.value = false
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Alimentos</h1>
        <p class="text-sm text-muted-foreground">Listado maestro de alimentos y porciones.</p>
      </div>
      <Button size="sm" @click="openCreate">Agregar alimento</Button>
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 6" :key="i" />
    </div>

    <div class="border rounded-lg overflow-hidden" v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alimento</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead class="text-right">Porción (g)</TableHead>
            <TableHead class="text-right">Cocido (g)</TableHead>
            <TableHead>Medida casera</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="food in foods" :key="food.id">
            <TableCell class="font-medium">{{ food.name }}</TableCell>
            <TableCell>
              <span class="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                {{ food.category?.name }}
              </span>
            </TableCell>
            <TableCell class="text-right">{{ food.portion_grams }}</TableCell>
            <TableCell class="text-right text-muted-foreground">{{ food.portion_grams_cooked ?? '—' }}</TableCell>
            <TableCell class="text-muted-foreground">{{ food.household_measure ?? '—' }}</TableCell>
            <TableCell class="text-right">
              <button class="text-xs text-muted-foreground hover:underline" @click="openEdit(food)">
                Editar
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Sheet v-model:open="sheetOpen">
      <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm">
        <SheetHeader>
          <SheetTitle>{{ isEditing ? 'Editar alimento' : 'Nuevo alimento' }}</SheetTitle>
          <SheetDescription class="sr-only">Formulario para {{ isEditing ? 'editar' : 'agregar' }} un alimento al listado maestro</SheetDescription>
        </SheetHeader>

        <div class="px-4 space-y-4 py-2 overflow-y-auto flex-1">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Nombre <span class="text-destructive">*</span></label>
            <Input v-model="form.name" placeholder="Ej: Pechuga de pollo" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Categoría <span class="text-destructive">*</span></label>
            <NativeSelect v-model="form.category_id">
              <option value="" disabled>Selecciona una categoría...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </NativeSelect>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Porción en gramos <span class="text-destructive">*</span></label>
            <Input v-model="form.portion_grams" type="number" step="0.1" placeholder="100" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Porción cocida (g) <span class="text-muted-foreground text-xs font-normal">(opcional)</span></label>
            <Input v-model="form.portion_grams_cooked" type="number" step="0.1" placeholder="150" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Medida casera <span class="text-muted-foreground text-xs font-normal">(opcional)</span></label>
            <Input v-model="form.household_measure" placeholder="Ej: 1 palma de la mano" />
          </div>
        </div>

        <SheetFooter class="grid grid-cols-2 gap-4">
          <Button size="lg" variant="outline" @click="sheetOpen = false">Cancelar</Button>
          <Button size="lg" @click="submit" :disabled="!form.name || !form.category_id || !form.portion_grams">
            {{ isEditing ? 'Guardar cambios' : 'Guardar' }}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
