<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  momentName: string
  momentDays: number[]
  currentDay: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  copy: [targetDays: number[]]
}>()

const DAYS = [
  { n: 1, full: 'Lunes' },
  { n: 2, full: 'Martes' },
  { n: 3, full: 'Miércoles' },
  { n: 4, full: 'Jueves' },
  { n: 5, full: 'Viernes' },
  { n: 6, full: 'Sábado' },
  { n: 7, full: 'Domingo' },
]

const open = ref(false)
const selected = ref<number[]>([])

const currentDayName = computed(
  () => DAYS.find(d => d.n === props.currentDay)?.full.toLowerCase() ?? ''
)

const availableDays = computed(() =>
  DAYS.filter(d => props.momentDays.includes(d.n))
)

watch(open, (val) => {
  if (!val) selected.value = []
})

function toggle(day: number) {
  if (day === props.currentDay) return
  const idx = selected.value.indexOf(day)
  if (idx === -1) selected.value.push(day)
  else selected.value.splice(idx, 1)
}

function handleCopy() {
  emit('copy', [...selected.value])
  open.value = false
}
</script>

<template>
  <Drawer v-model:open="open">
    <DrawerTrigger as-child>
      <button
        class="p-1 transition-colors"
        :class="disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'"
        :disabled="disabled"
      >
        <Copy class="size-4" />
      </button>
    </DrawerTrigger>

    <DrawerContent class="flex flex-col">
      <DrawerHeader class="pb-2">
        <DrawerTitle>Repetir {{ momentName.toLowerCase() }}</DrawerTitle>
        <p class="text-sm text-muted-foreground">
          Copia tu selección del {{ currentDayName }} a otros días donde este momento existe.
        </p>
      </DrawerHeader>

      <div class="flex-1 overflow-y-auto px-4 pb-2">
        <div class="divide-y border rounded-xl overflow-hidden">
          <button
            v-for="day in availableDays"
            :key="day.n"
            @click="toggle(day.n)"
            class="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
            :class="day.n === currentDay ? 'cursor-default' : 'hover:bg-muted/40'"
          >
            <span class="text-sm font-medium" :class="day.n === currentDay ? 'text-muted-foreground' : ''">
              {{ day.full }}
            </span>
            <div class="flex items-center gap-2">
              <span v-if="day.n === currentDay" class="text-xs text-muted-foreground">origen</span>
              <div
                class="size-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="day.n === currentDay || selected.includes(day.n)
                  ? 'bg-foreground border-foreground'
                  : 'border-muted-foreground/40'"
              >
                <Check
                  v-if="day.n === currentDay || selected.includes(day.n)"
                  class="size-3 text-background"
                />
              </div>
            </div>
          </button>
        </div>
      </div>

      <DrawerFooter>
        <Button class="w-full" :disabled="!selected.length" @click="handleCopy">
          <Copy class="size-4" />
          Copiar a {{ selected.length }} {{ selected.length === 1 ? 'día' : 'días' }}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
