import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import PatientView from "../views/PatientView.vue";
import RegisterView from "../views/RegisterView.vue";
import LabView from "../views/LabView.vue";
import RecordView from "../views/RecordView.vue";
import PrescriptionView from "../views/PrescriptionView.vue";
import DashboardView from "../views/DashboardView.vue";
import EditPatientView from "../views/EditPatientView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/patients",
      name: "patients",
      component: PatientView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/lab",
      name: "lab",
      component: LabView,
    },
    {
      path: "/record",
      name: "record",
      component: RecordView,
    },
    {
      path: "/prescription",
      name: "prescription",
      component: PrescriptionView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/patients/:id/edit",
      name: "edit-patient",
      component: EditPatientView,
      props: true, // Pass route params as props
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Define routes that do not require authentication
  const publicRoutes = ['login', 'register'];

  // Check if the route requires authentication
  const isAuthRequired = !publicRoutes.includes(to.name);

  // Redirect to login if authentication is required and the user is not authenticated
  if (isAuthRequired && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
