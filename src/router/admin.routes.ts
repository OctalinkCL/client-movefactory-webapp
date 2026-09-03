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
        path: "users/:id",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/users/UserDetailLayout.vue"),
        children: [
          {
            path: "detail",
            redirect: (to) => ({ name: "admin-summary", params: to.params }),
          },
          {
            path: "summary",
            name: "admin-summary",
            component: () => import("@/modules/tracking/SummaryView.vue"),
          },
          {
            path: "meal-plan",
            name: "admin-meal-plan",
            component: () => import("@/modules/meal-plans/MealPlanView.vue"),
          },
          {
            path: "tracking",
            name: "admin-tracking",
            component: () => import("@/modules/tracking/TrackingView.vue"),
          },
        ],
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
      // Benefits
      {
        path: "benefits",
        name: "admin-benefits",
        meta: { roles: ["admin", "nutritionist"] },
        component: () => import("@/modules/benefits/BenefitsView.vue"),
      },
    ],
  },
];
