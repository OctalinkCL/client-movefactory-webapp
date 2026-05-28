<script setup lang="ts">
import { onMounted } from 'vue'
import { useFoods } from './composables/useFoods'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const { foods, loading, fetchFoods } = useFoods()

onMounted(fetchFoods)
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Alimentos</h1>
        <p class="text-sm text-muted-foreground">Listado maestro de alimentos y porciones.</p>
      </div>
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
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
