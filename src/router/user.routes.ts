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
      {
        path: "plan",
        name: "user-plan",
        meta: { roles: ["user"] },
        component: () => import("@/modules/meal-plans/UserPlanView.vue"),
      },
      {
        path: "profile",
        name: "user-profile",
        meta: { roles: ["user"] },
        component: () => import("@/modules/profile/ProfileView.vue"),
      },
    ],
  },
];
