<script setup lang="ts">
// ui
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// props
const props = defineProps<{ user: any }>()
</script>

<template>
    <div class="border rounded-lg p-1.5 overflow-hidden">
        <!-- banner -->
        <div class="h-20 bg-yellow-400 rounded"></div>
        <!-- avatar -->
        <Avatar class="size-24 -mt-12 mx-auto  border-3 border-white">
            <AvatarImage v-if="props.user?.avatar_url" :src="props.user?.full_name" class="" />
            <AvatarFallback v-else>{{ props.user?.full_name.charAt(0).toUpperCase() }}
            </AvatarFallback>
        </Avatar>

        <!--  -->
        <div class="text-center mb-6">
            <h1 class="text-xl font-medium">{{ props.user?.full_name }}</h1>
            <p class="text-sm text-muted-foreground">{{ props.user?.email }}</p>
        </div>

        <div class="border rounded">
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            F. Nacimiento
                        </TableCell>
                        <TableCell class="text-right">{{ props.user?.birth_date }}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Sexo
                        </TableCell>
                        <TableCell class="text-right">{{ props.user?.sex }}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Estatura
                        </TableCell>
                        <TableCell class="text-right">{{ props.user?.height }} cm</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>