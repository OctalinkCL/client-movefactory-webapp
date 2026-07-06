<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import EmptyItem from '@/components/shared/EmptyItem.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-vue-next'
import CreateBenefitSheet from './components/CreateBenefitSheet.vue'
import EditBenefitSheet from './components/EditBenefitSheet.vue'
import { useBenefits } from './composables/useBenefits'
import { getBenefitPublicUrl } from './lib/benefitStorage'
import { formatDate } from '@/lib/utils'
import type { Benefit } from '@/types/benefit'

const { role } = storeToRefs(useAuthStore())
const { benefits, loading, fetchBenefits, deleteBenefit } = useBenefits()

const editOpen = ref(false)
const selectedBenefit = ref<Benefit | null>(null)

function openEdit(benefit: Benefit) {
  selectedBenefit.value = benefit
  editOpen.value = true
}

async function onDelete(benefit: Benefit) {
  if (!confirm(`¿Eliminar el beneficio "${benefit.title}"?`)) return
  await deleteBenefit(benefit)
}
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Beneficios</h1>
        <p class="text-sm text-muted-foreground">Convenios y descuentos disponibles para los usuarios del gimnasio.</p>
      </div>
      <CreateBenefitSheet v-if="role === 'admin'" @created="fetchBenefits" />
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="benefits.length === 0" class="mt-24">
      <EmptyItem section="benefits" />
    </div>

    <div class="border rounded-lg overflow-hidden" v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Beneficio</TableHead>
            <TableHead>Fecha término</TableHead>
            <TableHead v-if="role === 'admin'" class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in benefits" :key="item.id">
            <TableCell>
              <img :src="getBenefitPublicUrl(item.photo_path)" class="size-10 rounded-md object-cover" />
            </TableCell>
            <TableCell class="font-medium">{{ item.title }}</TableCell>
            <TableCell>{{ item.benefit }}</TableCell>
            <TableCell>{{ item.end_date ? formatDate(item.end_date) : '—' }}</TableCell>
            <TableCell v-if="role === 'admin'" class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button size="sm" variant="ghost" @click="openEdit(item)">
                  <Pencil class="size-4" />
                  Editar
                </Button>
                <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" @click="onDelete(item)">
                  <Trash2 class="size-4" />
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>

  <EditBenefitSheet
    v-if="role === 'admin'"
    v-model:open="editOpen"
    :benefit="selectedBenefit"
    @updated="fetchBenefits"
  />
</template>
