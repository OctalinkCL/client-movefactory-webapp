import type { NavigationGuard } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export const authGuard: NavigationGuard = (to) => {
  const authStore = useAuthStore();

  if (to.path.startsWith("/admin") && !authStore.isAuthenticated) {
    return { name: "login" };
  }
  if (to.name === "login" && authStore.isAuthenticated) {
    return { name: "admin-dashboard" };
  }
};
