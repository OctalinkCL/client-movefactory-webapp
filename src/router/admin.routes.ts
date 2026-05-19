import AdminLayout from "@/layouts/AdminLayout.vue";
import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/modules/dashboard/AdminDashboard.vue"),
      },
      {
        path: "staff",
        name: "admin-staff",
        meta: { roles: ["admin"] },
        component: () => import("@/modules/users/StaffView.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/users/UsersView.vue"),
      },
      {
        path: "users/:id/detail",
        name: "admin-users-detail",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/users/UserDetailView.vue"),
      }
    ],
  },
];
