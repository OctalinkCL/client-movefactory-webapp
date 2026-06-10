<script setup lang="ts">
import EmptyItem from '@/components/shared/EmptyItem.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import UploadDocumentSheet from './components/UploadDocumentSheet.vue'
import { useDocuments } from './composables/useDocuments'
import { formatDate } from '@/lib/utils'

const { documents, loading, fetchDocuments } = useDocuments()
</script>

<template>
  <div class="grid gap-4 lg:gap-6">
    <header class="flex items-start justify-between lg:items-center">
      <div class="leading-tight">
        <h1 class="text-xl font-medium">Documentos</h1>
        <p class="text-sm text-muted-foreground">Sube y administra documentos para los usuarios del gimnasio.</p>
      </div>
      <UploadDocumentSheet @uploaded="fetchDocuments" />
    </header>

    <div v-if="loading" class="grid gap-2">
      <Skeleton class="h-9" v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="documents.length === 0" class="mt-24">
      <EmptyItem section="documents" />
    </div>

    <div class="border rounded-lg overflow-hidden" v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Visibilidad</TableHead>
            <TableHead>Subido por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="doc in documents" :key="doc.id">
            <TableCell class="font-medium">{{ doc.name }}</TableCell>
            <TableCell>
              <span
                class="text-xs px-2 py-0.5 rounded-full border"
                :class="doc.visibility === 'public'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border'"
              >
                {{ doc.visibility === 'public' ? 'Público' : `${doc.document_assignments.length} usuario${doc.document_assignments.length !== 1 ? 's' : ''}` }}
              </span>
            </TableCell>
            <TableCell>{{ doc.profiles?.full_name ?? '—' }}</TableCell>
            <TableCell>{{ formatDate(doc.created_at) }}</TableCell>
            <TableCell class="text-right">
              <Button size="sm" variant="ghost">Ver</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
