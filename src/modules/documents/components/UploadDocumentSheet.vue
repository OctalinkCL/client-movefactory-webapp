<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Globe, Users, Search, Check } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUploadDocument } from '../composables/useUploadDocument'
import { useUsers } from '@/modules/users/composables/useUsers'
import { getInitials } from '@/lib/utils'

const emit = defineEmits<{ uploaded: [] }>()

const open = ref(false)
const form = reactive({ name: '' })
const file = ref<File | null>(null)
const visibility = ref<'public' | 'private'>('public')
const selectedUsers = ref<string[]>([])
const userSearch = ref('')

const { uploadDocument, loading, error } = useUploadDocument()
const { users } = useUsers('user')

const filteredUsers = computed(() =>
  users.value.filter(u =>
    u.full_name.toLowerCase().includes(userSearch.value.toLowerCase())
  )
)

const canSubmit = computed(() => {
  if (!file.value || !form.name.trim()) return false
  if (visibility.value === 'private' && selectedUsers.value.length === 0) return false
  return true
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
  if (file.value && !form.name) {
    form.name = file.value.name.replace(/\.[^.]+$/, '')
  }
}

function toggleUser(id: string) {
  const idx = selectedUsers.value.indexOf(id)
  if (idx === -1) selectedUsers.value.push(id)
  else selectedUsers.value.splice(idx, 1)
}

function reset() {
  form.name = ''
  file.value = null
  visibility.value = 'public'
  selectedUsers.value = []
  userSearch.value = ''
}

async function submit() {
  if (!file.value || !form.name.trim()) return
  try {
    await uploadDocument(form.name.trim(), file.value, visibility.value, selectedUsers.value)
    open.value = false
    reset()
    emit('uploaded')
  } catch {
    // error ref set by composable
  }
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <Button>
        <Upload class="size-4" />
        Subir documento
      </Button>
    </SheetTrigger>

    <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm flex flex-col gap-6 overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Subir documento</SheetTitle>
        <SheetDescription class="sr-only">Formulario para subir un documento y asignarlo a usuarios</SheetDescription>
      </SheetHeader>

      <form @submit.prevent="submit" class="px-4 flex flex-col gap-5 flex-1">

        <!-- Nombre -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Nombre</label>
          <Input v-model="form.name" placeholder="Ej: Reglamento del gimnasio" />
        </div>

        <!-- Archivo -->
        <div class="grid gap-1.5">
          <label class="text-sm font-medium">Archivo</label>
          <label
            class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors"
            :class="file ? 'border-primary/40 bg-primary/5' : 'border-border'"
          >
            <Upload class="size-6 text-muted-foreground" />
            <span class="text-sm text-center" :class="file ? 'text-foreground font-medium' : 'text-muted-foreground'">
              {{ file ? file.name : 'Haz clic para seleccionar un archivo' }}
            </span>
            <span v-if="file" class="text-xs text-muted-foreground">
              {{ (file.size / 1024).toFixed(0) }} KB
            </span>
            <input type="file" class="hidden" @change="onFileChange" />
          </label>
        </div>

        <!-- Visibilidad -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">Visibilidad</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-colors hover:bg-muted/40"
              :class="visibility === 'public' ? 'border-primary bg-primary/5' : 'border-border'"
              @click="visibility = 'public'"
            >
              <Globe class="size-4" :class="visibility === 'public' ? 'text-primary' : 'text-muted-foreground'" />
              <span class="text-sm font-medium">Público</span>
              <span class="text-xs text-muted-foreground leading-tight">Todos los usuarios lo ven</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-colors hover:bg-muted/40"
              :class="visibility === 'private' ? 'border-primary bg-primary/5' : 'border-border'"
              @click="visibility = 'private'"
            >
              <Users class="size-4" :class="visibility === 'private' ? 'text-primary' : 'text-muted-foreground'" />
              <span class="text-sm font-medium">Específico</span>
              <span class="text-xs text-muted-foreground leading-tight">Solo usuarios que elijas</span>
            </button>
          </div>
        </div>

        <!-- Lista de usuarios (solo si privado) -->
        <div v-if="visibility === 'private'" class="grid gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Usuarios</label>
            <span v-if="selectedUsers.length > 0" class="text-xs text-primary font-medium">
              {{ selectedUsers.length }} seleccionado{{ selectedUsers.length > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="relative">
            <Search class="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input v-model="userSearch" placeholder="Buscar usuario..." class="pl-8 h-9 text-sm" />
          </div>

          <div class="border rounded-lg divide-y max-h-52 overflow-y-auto">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              :class="selectedUsers.includes(user.id) ? 'bg-primary/5' : ''"
              @click="toggleUser(user.id)"
            >
              <Avatar class="size-7 shrink-0">
                <AvatarImage :src="user.avatar_url ?? ''" :alt="user.full_name" />
                <AvatarFallback class="text-xs">{{ getInitials(user.full_name) }}</AvatarFallback>
              </Avatar>
              <span class="text-sm flex-1">{{ user.full_name }}</span>
              <Check
                v-if="selectedUsers.includes(user.id)"
                class="size-4 text-primary shrink-0"
              />
            </div>
            <div v-if="filteredUsers.length === 0" class="px-3 py-4 text-sm text-muted-foreground text-center">
              Sin resultados
            </div>
          </div>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <SheetFooter class="mt-auto">
          <Button type="submit" class="w-full" :disabled="loading || !canSubmit">
            {{ loading ? 'Subiendo...' : 'Subir documento' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
