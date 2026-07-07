<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUserFoodSelections } from './composables/useUserFoodSelections'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-vue-next'
import type { Food } from '@/types/food'

const { profile } = storeToRefs(useAuthStore())
const { selections, fetchAll } = useUserFoodSelections()
const router = useRouter()

const loading = computed(() => !selections.value.length)

onMounted(() => {
  if (profile.value) fetchAll(profile.value.id)
})

interface ShoppingItem { food: Food; totalGrams: number; totalUnits: number }
interface ShoppingCategory { name: string; items: ShoppingItem[]; totalGrams: number }

const shoppingList = computed((): ShoppingCategory[] => {
  const byFood = new Map<string, ShoppingItem>()

  for (const sel of selections.value) {
    if (!sel.food) continue
    const portions = Number(sel.meal_plan_item?.portion ?? 1)
    const existing = byFood.get(sel.food_id) ?? { food: sel.food, totalGrams: 0, totalUnits: 0 }
    if (sel.food.is_unit_based) {
      existing.totalUnits += portions * (sel.food.units_per_portion ?? 1)
    } else {
      existing.totalGrams += portions * sel.food.portion_grams
    }
    byFood.set(sel.food_id, existing)
  }

  const byCategory = new Map<string, ShoppingCategory>()
  for (const item of byFood.values()) {
    const catId = item.food.category_id
    const catName = item.food.category?.name ?? 'Otros'
    if (!byCategory.has(catId)) byCategory.set(catId, { name: catName, items: [], totalGrams: 0 })
    const cat = byCategory.get(catId)!
    cat.items.push(item)
    cat.totalGrams += item.totalGrams
  }

  return [...byCategory.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(cat => ({
      ...cat,
      items: cat.items.sort((a, b) => b.totalGrams - a.totalGrams),
    }))
})

const stats = computed(() => ({
  foods: shoppingList.value.reduce((n, c) => n + c.items.length, 0),
  categories: shoppingList.value.length,
  totalGrams: shoppingList.value.reduce((n, c) => n + c.totalGrams, 0),
}))

function formatWeight(grams: number): string {
  return grams >= 1000
    ? (grams / 1000).toFixed(2) + ' kg'
    : grams + ' g'
}

function formatQuantity(item: ShoppingItem): string {
  if (!item.food.is_unit_based) return formatWeight(item.totalGrams)
  const units = Math.ceil(item.totalUnits)
  return `${units} ${units === 1 ? 'unidad' : 'unidades'}`
}
</script>

<template>
  <div class="grid gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="size-5" />
      </button>
      <div>
        <h1 class="text-xl font-medium">Lista de compras</h1>
        <p class="text-sm text-muted-foreground">Gramos totales para la semana.</p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid gap-3">
      <Skeleton class="h-20 rounded-xl" />
      <Skeleton class="h-40 rounded-xl" v-for="i in 3" :key="i" />
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2">
        <div class="border rounded-xl p-3 text-center">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Alimentos</p>
          <p class="text-2xl font-semibold mt-0.5">{{ stats.foods }}</p>
        </div>
        <div class="border rounded-xl p-3 text-center">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Categorías</p>
          <p class="text-2xl font-semibold mt-0.5">{{ stats.categories }}</p>
        </div>
        <div class="border rounded-xl p-3 text-center">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p class="text-2xl font-semibold mt-0.5">{{ formatWeight(stats.totalGrams) }}</p>
        </div>
      </div>

      <!-- Lista por categoría -->
      <div class="grid gap-4">
        <div v-for="cat in shoppingList" :key="cat.name">
          <!-- Categoría header -->
          <div class="flex items-baseline justify-between mb-2 px-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {{ cat.name }} · {{ cat.items.length }}
            </p>
            <p class="text-xs text-muted-foreground">{{ formatWeight(cat.totalGrams) }}</p>
          </div>

          <!-- Alimentos -->
          <div class="border rounded-xl divide-y overflow-hidden">
            <div
              v-for="item in cat.items"
              :key="item.food.id"
              class="flex items-center justify-between px-4 py-3.5"
            >
              <p class="text-sm font-medium">{{ item.food.name }}</p>
              <p class="text-sm font-semibold">{{ formatQuantity(item) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
