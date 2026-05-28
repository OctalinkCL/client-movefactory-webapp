<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Food } from '@/types/food'
import type { UserFoodSelection } from '@/types/food-selection'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight, Check } from 'lucide-vue-next'

const props = defineProps<{
  foodType: string
  portion: string
  selection: UserFoodSelection | null
}>()

const emit = defineEmits<{
  select: [food: Food]
}>()

const open = ref(false)
const search = ref('')
const foods = ref<Food[]>([])
const loading = ref(false)

const filtered = computed(() =>
  search.value
    ? foods.value.filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
    : foods.value
)

watch(open, async (val) => {
  if (!val || foods.value.length) return
  loading.value = true
  const { data: cat } = await supabase
    .from('food_categories')
    .select('id')
    .eq('name', props.foodType)
    .single()

  if (cat) {
    const { data } = await supabase
      .from('foods')
      .select('*')
      .eq('category_id', cat.id)
      .order('name')
    foods.value = data ?? []
  }
  loading.value = false
})

function select(food: Food) {
  emit('select', food)
  open.value = false
  search.value = ''
}
</script>

<template>
  <Drawer v-model:open="open">
    <DrawerTrigger as-child>
      <button class="flex items-center gap-0.5 text-sm shrink-0">
        <template v-if="selection?.food">
          <span class="font-medium">{{ selection.food.name }}</span>
          <span class="text-muted-foreground ml-1">· {{ selection.food.portion_grams }}g</span>
        </template>
        <span v-else class="text-primary font-medium">Elegir</span>
        <ChevronRight class="size-4 text-muted-foreground" />
      </button>
    </DrawerTrigger>

    <DrawerContent class="max-h-[82vh] flex flex-col">
      <DrawerHeader class="pb-3">
        <DrawerTitle>Elegir {{ foodType.toLowerCase() }}</DrawerTitle>
        <p class="text-sm text-muted-foreground">{{ portion }} · selecciona 1 alimento</p>
      </DrawerHeader>

      <div class="px-4 pb-3 shrink-0">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            v-model="search"
            class="pl-9"
            :placeholder="`Buscar ${foodType.toLowerCase()}...`"
          />
        </div>
      </div>

      <div class="overflow-y-auto flex-1 px-4 pb-8">
        <div v-if="loading" class="py-10 text-center text-sm text-muted-foreground">Cargando...</div>
        <div v-else-if="!filtered.length" class="py-10 text-center text-sm text-muted-foreground">Sin resultados</div>
        <div v-else class="divide-y">
          <button
            v-for="food in filtered"
            :key="food.id"
            @click="select(food)"
            class="w-full flex items-center justify-between py-3.5 text-left"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium">{{ food.name }}</p>
              <p class="text-xs text-muted-foreground">
                1 porción ≈ {{ food.portion_grams }}g
                <span v-if="food.household_measure"> · {{ food.household_measure }}</span>
              </p>
            </div>
            <Check v-if="selection?.food_id === food.id" class="size-4 text-primary shrink-0 ml-3" />
          </button>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
