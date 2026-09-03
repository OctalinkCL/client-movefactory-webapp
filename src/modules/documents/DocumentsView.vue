<script setup lang="ts">
import { ref } from 'vue'
import EmptyItem from '@/components/shared/EmptyItem.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Pencil, ExternalLink, Trash2 } from 'lucide-vue-next'
import UploadDocumentSheet from './components/UploadDocumentSheet.vue'
import EditDocumentSheet from './components/EditDocumentSheet.vue'
import { useDocuments } from './composables/useDocuments'
import { formatDate } from '@/lib/utils'
import type { Document } from './composables/useDocuments'

const { documents, loading, fetchDocuments, openDocument, deleteDocument } = useDocuments()

const editOpen = ref(false)
const selectedDocument = ref<Document | null>(null)

function openEdit(doc: Document) {
  selectedDocument.value = doc
  editOpen.value = true
}

async function onDelete(doc: Document) {
  if (!confirm(`¿Eliminar el documento "${doc.name}"? Esta acción no se puede deshacer.`)) return
  await deleteDocument(doc)
}
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
              <div class="flex items-center justify-end gap-1">
                <Button size="sm" variant="ghost" @click="openDocument(doc.file_path)">
                  <ExternalLink class="size-4" />
                  Ver
                </Button>
                <Button size="sm" variant="ghost" @click="openEdit(doc)">
                  <Pencil class="size-4" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  class="text-destructive hover:text-destructive"
                  @click="onDelete(doc)"
                >
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

  <EditDocumentSheet
    v-model:open="editOpen"
    :document="selectedDocument"
    @updated="fetchDocuments"
  />
</template>
