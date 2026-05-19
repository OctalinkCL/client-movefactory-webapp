import type { NavigationGuard } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export const authGuard: NavigationGuard = (to) => {
  const authStore = useAuthStore();

  if (
    to.matched.some((r) => r.meta.requiresAuth) &&
    !authStore.isAuthenticated
  ) {
    return { name: "login" };
  }
  if (to.name === "login" && authStore.isAuthenticated) {
    return { name: "admin-dashboard" };
  }
  if (to.meta.roles && !to.meta.roles.includes(authStore.role!)) {
    console.debug(to.meta);
    return { name: "admin-dashboard" };
  }
};
