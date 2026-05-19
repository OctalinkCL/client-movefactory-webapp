import { createRouter, createWebHistory } from "vue-router";
import { authRoutes } from "./auth.routes";
import { adminRoutes } from "./admin.routes";
import { authGuard } from "./guards";

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

router.beforeEach(authGuard);

export default router;
