import { createRouter, createWebHistory } from "vue-router";
import { authRoutes } from "./auth.routes";
import { adminRoutes } from "./admin.routes";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: { name: "login" },
    },
    ...authRoutes,
    ...adminRoutes,
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/modules/shared/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  const requiresAuth = to.path.startsWith("/admin");
  const isAuthRoute = to.name === "login";

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }
  if (isAuthRoute && authStore.isAuthenticated) {
    return { name: "admin-dashboard" };
  }
});

export default router;
