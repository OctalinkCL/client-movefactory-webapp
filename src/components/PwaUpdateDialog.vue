<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const { needRefresh, updateServiceWorker } = useRegisterSW()

function dismiss() {
  needRefresh.value = false
}

function reload() {
  updateServiceWorker(true)
}
</script>

<template>
  <Dialog :open="needRefresh" @update:open="(value) => !value && dismiss()">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nueva versión disponible</DialogTitle>
        <DialogDescription>
          Hay una actualización de Move Factory lista para instalar. Recargá para aplicar los últimos cambios.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="dismiss">
          Más tarde
        </Button>
        <Button @click="reload">
          Actualizar ahora
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
