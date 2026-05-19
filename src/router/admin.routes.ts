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
      {
        path: "staff",
        name: "admin-staff",
        component: () => import("@/modules/users/StaffView.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("@/modules/users/UsersView.vue"),
      },
    ],
  },
];
