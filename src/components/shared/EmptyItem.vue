<script setup lang="ts">
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'

defineProps<{ section?: string }>()
</script>

<template>
    <div>
        <Empty v-if="section === 'users'">
            <EmptyHeader>
                <EmptyMedia variant="default">
                    <div class="*:ring-background flex -space-x-2 *:size-12 *:ring-2 *:grayscale">
                        <Avatar>
                            <AvatarImage src="https://github.com/ace-of-aces.png" alt="@ace-of-aces" />
                            <AvatarFallback>AA</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://github.com/sadeghbarati.png" alt="@sadeghbarati" />
                            <AvatarFallback>SB</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://github.com/zernonia.png" alt="@zernonia" />
                            <AvatarFallback>ZN</AvatarFallback>
                        </Avatar>
                    </div>
                </EmptyMedia>
                <EmptyTitle>No hay usuarios</EmptyTitle>
                <EmptyDescription>
                    Crea un usuario para poder comenzar
                </EmptyDescription>
            </EmptyHeader>
        </Empty>

        <Empty v-else-if="section === 'documents'">
            <EmptyHeader>
                <EmptyMedia variant="default">
                    <div class="flex items-center justify-center size-12 rounded-full bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                </EmptyMedia>
                <EmptyTitle>No hay documentos</EmptyTitle>
                <EmptyDescription>
                    Sube un documento para que los usuarios puedan verlo
                </EmptyDescription>
            </EmptyHeader>
        </Empty>

        <div v-else>
            vacío genérico
        </div>
    </div>
</template>
