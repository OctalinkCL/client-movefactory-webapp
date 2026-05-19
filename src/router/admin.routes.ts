import AdminLayout from "@/layouts/AdminLayout.vue";
import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/modules/dashboard/AdminDashboard.vue"),
      },
    ],
  },
];
