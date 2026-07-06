<script setup lang="ts">
import { FileText, Download } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useUserDocuments } from './composables/useUserDocuments'
import { formatDate } from '@/lib/utils'

const { documents, loading, openDocument } = useUserDocuments()
</script>

<template>
  <div class="grid gap-4">
    <div class="leading-tight">
      <h1 class="text-xl font-medium">Documentos</h1>
      <p class="text-sm text-muted-foreground">Documentos compartidos contigo por el equipo.</p>
    </div>

    <div v-if="loading" class="grid gap-3">
      <Skeleton class="h-16 rounded-xl" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="documents.length === 0" class="flex flex-col items-center gap-2 mt-20 text-center">
      <FileText class="size-10 text-muted-foreground/40" />
      <p class="text-sm font-medium">Sin documentos por ahora</p>
      <p class="text-xs text-muted-foreground">El equipo aún no ha compartido ningún documento</p>
    </div>

    <div v-else class="grid gap-3">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="flex items-center gap-3 p-4 border rounded-xl bg-card"
      >
        <div class="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
          <FileText class="size-5 text-muted-foreground" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">{{ doc.name }}</p>
          <p class="text-xs text-muted-foreground">{{ formatDate(doc.created_at) }}</p>
        </div>
        <Button size="sm" variant="ghost" class="shrink-0" @click="openDocument(doc.file_path)">
          <Download class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
