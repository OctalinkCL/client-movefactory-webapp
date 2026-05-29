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

        <div v-else>
            vacío genérico
        </div>
    </div>
</template>
