import AdminLayout from "@/layouts/AdminLayout.vue";
import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: "dashboard",
        name: "admin-dashboard",
        meta: { roles: ["admin"] },
        component: () => import("@/modules/dashboard/AdminDashboard.vue"),
      },
      // Staff
      {
        path: "staff",
        name: "admin-staff",
        meta: { roles: ["admin"] },
        component: () => import("@/modules/users/StaffView.vue"),
      },
      // Users
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
      },
      // Meal_Plan
      {
        path: "users/:id/meal-plan",
        name: "admin-meal-plan",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/meal-plans/MealPlanView.vue"),
      },
      // Foods
      {
        path: "foods",
        name: "admin-foods",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/foods/FoodsView.vue"),
      },
      // Documents
      {
        path: "documents",
        name: "admin-documents",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/documents/DocumentsView.vue"),
      },
      // Tracking
      {
        path: "users/:id/tracking",
        name: "admin-tracking",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/tracking/TrackingView.vue"),
      },
    ],
  },
];
