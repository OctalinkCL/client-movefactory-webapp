import UserLayout from "@/layouts/UserLayout.vue";
import type { RouteRecordRaw } from "vue-router";

export const userRoutes: RouteRecordRaw[] = [
  {
    path: "/app",
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "user-dashboard",
        meta: { roles: ["user"] },
        component: () => import("@/modules/dashboard/UserDashboard.vue"),
      },
    ],
  },
];
