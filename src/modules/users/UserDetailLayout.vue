<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUser } from "./composables/useUser";
import { formatDateDisplay, sexLabel, calcAge } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const route = useRoute();
const router = useRouter();
const userId = route.params.id as string;
const { user, loading, updateProfile } = useUser(userId);

const activeTab = computed(() => route.name as string);

const hasFixedData = () =>
  !!(user.value?.birth_date || user.value?.sex || user.value?.height);

const profileSheetOpen = ref(false);
const profileForm = reactive({
  birth_date: "",
  sex: "" as "male" | "female" | "",
  height: "",
  phone: "",
});

function openProfileSheet() {
  profileForm.birth_date = user.value?.birth_date ?? "";
  profileForm.sex = user.value?.sex ?? "";
  profileForm.height = user.value?.height?.toString() ?? "";
  profileForm.phone = user.value?.phone ?? "";
  profileSheetOpen.value = true;
}

async function saveProfile() {
  await updateProfile({
    birth_date: profileForm.birth_date || null,
    sex: profileForm.sex || null,
    height: profileForm.height ? parseFloat(profileForm.height) : null,
    phone: profileForm.phone || null,
  });
  profileSheetOpen.value = false;
}
</script>

<template>
  <div class="space-y-4">
    <header>
      <button class="text-sm flex gap-2 items-center text-muted-foreground cursor-pointer"
        @click="router.push({ name: 'admin-users' })">
        <ArrowLeft :size="15" />
        Volver a lista de usuarios
      </button>
    </header>

    <div class="flex flex-col gap-4 | lg:flex-row lg:gap-6">
      <!-- aside: siempre visible -->
      <aside class="w-full lg:w-75 lg:shrink-0">
        <div class="border rounded-xl">
          <!-- basic -->
          <section class="px-4 py-6 text-center space-y-3">
            <div>
              <Skeleton v-if="loading" class="size-18 rounded-full mx-auto" />
              <Avatar v-else class="mx-auto size-18">
                <AvatarImage v-if="user?.avatar_url" :src="user.avatar_url" />
                <AvatarImage v-else src="https://github.com/shadcn.png" />
              </Avatar>
            </div>
            <div>
              <div v-if="!loading">
                <h1 class="text-xl font-semibold">{{ user?.full_name }}</h1>
                <p v-if="user?.birth_date" class="text-sm text-muted-foreground">
                  {{ formatDateDisplay(user?.birth_date) }}
                </p>
              </div>
              <div v-else class="flex flex-col items-center space-y-1">
                <Skeleton class="h-7 w-[190px]" />
                <Skeleton class="h-5 w-[120px]" />
                <Skeleton class="h-6 w-[100px] mt-1.5" />
              </div>
            </div>
            <Sheet v-if="!loading" v-model:open="profileSheetOpen">
              <SheetTrigger as-child>
                <Button size="xs" variant="outline" @click="openProfileSheet">
                  {{ hasFixedData() ? "Editar datos" : "Completar datos" }}
                </Button>
              </SheetTrigger>
              <SheetContent @open-auto-focus.prevent class="min-w-full md:min-w-sm">
                <SheetHeader>
                  <SheetTitle>Datos del paciente</SheetTitle>
                </SheetHeader>
                <div class="px-4 space-y-4">
                  <div class="space-y-1.5 overflow-hidden">
                    <label class="text-sm font-medium">Fecha de nacimiento</label>
                    <Input v-model="profileForm.birth_date" type="date" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Sexo</label>
                    <NativeSelect v-model="profileForm.sex">
                      <option value="">Sin especificar</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                    </NativeSelect>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Estatura (cm)</label>
                    <Input v-model="profileForm.height" type="number" step="0.1" placeholder="170" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Teléfono</label>
                    <Input v-model="profileForm.phone" type="tel" placeholder="+56 9 1234 5678" />
                  </div>
                </div>
                <SheetFooter class="grid grid-cols-2 gap-4">
                  <Button size="lg" variant="outline" @click="profileSheetOpen = false">Cancelar</Button>
                  <Button size="lg" @click="saveProfile">Guardar</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </section>

          <!-- info -->
          <section class="border-t p-4">
            <h5 class="text-sm font-medium text-muted-foreground">
              Datos del Paciente
            </h5>
            <ul class="text-sm mt-4 grid grid-cols-2 gap-4">
              <li>
                <h4 class="text-muted-foreground">Edad</h4>
                <Skeleton class="h-4 w-25" v-if="loading" />
                <p v-else class="font-medium">
                  {{
                    user?.birth_date
                      ? `${calcAge(user.birth_date)} años`
                      : "Sin especificar"
                  }}
                </p>
              </li>
              <li>
                <h4 class="text-muted-foreground">Sexo</h4>
                <Skeleton class="h-4 w-25" v-if="loading" />
                <p v-else class="font-medium">
                  {{ user?.sex ? sexLabel(user?.sex) : "Sin especificar" }}
                </p>
              </li>
              <li>
                <h4 class="text-muted-foreground">Estatura</h4>
                <Skeleton class="h-4 w-25" v-if="loading" />
                <p v-else class="font-medium">
                  {{ user?.height ? `${user?.height} cm` : "Sin especificar" }}
                </p>
              </li>
            </ul>
          </section>

          <!-- contact -->
          <section class="border-t p-4">
            <h5 class="text-sm font-medium text-muted-foreground">
              Información de Contacto
            </h5>
            <ul class="text-sm mt-4 grid gap-4">
              <li>
                <h4 class="text-muted-foreground">Teléfono / Whatsapp</h4>
                <Skeleton class="h-4 w-40" v-if="loading" />
                <a v-else :href="`https://wa.me/${user?.phone}`" target="_blank" class="font-medium">
                  {{ user?.phone ? `+56 ${user?.phone}` : "Sin especificar" }}
                </a>
              </li>
              <li>
                <h4 class="text-muted-foreground">Correo Electrónico</h4>
                <Skeleton class="h-4 w-40" v-if="loading" />
                <a v-else :href="`mailto:${user?.email}`" target="_blank" class="font-medium">
                  {{ user?.email || "Sin especificar" }}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </aside>

      <!-- contenido dinámico -->
      <div class="flex-1 min-w-0 space-y-4">
        <!-- navigation -->
        <section class="bg-zinc-100 rounded-lg p-1">
          <div class="flex gap-2">
            <button class="px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer" :class="activeTab === 'admin-summary'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              " @click="
                router.push({ name: 'admin-summary', params: { id: userId } })
                ">
              Resumen
            </button>
            <button class="px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer" :class="activeTab === 'admin-tracking'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              " @click="
                router.push({ name: 'admin-tracking', params: { id: userId } })
                ">
              Seguimiento
            </button>
            <button class="px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer" :class="activeTab === 'admin-meal-plan'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              " @click="
                router.push({ name: 'admin-meal-plan', params: { id: userId } })
                ">
              Plan de alimentación
            </button>
          </div>
        </section>

        <RouterView />
      </div>
    </div>
  </div>
</template>
