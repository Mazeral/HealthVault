import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import PatientView from "../views/PatientView.vue";
import RegisterView from "../views/RegisterView.vue";
import LabView from "../views/LabView.vue";
import NewLabResultView from "../views/NewLabResultView.vue";
import RecordView from "../views/RecordView.vue";
import NewMedicalRecordView from "../views/NewMedicalRecordView.vue";
import PrescriptionView from "../views/PrescriptionView.vue";
import NewPrescriptionView from "../views/NewPrescriptionView.vue";
import DashboardView from "../views/DashboardView.vue";
import EditPatientView from "../views/EditPatientView.vue";
import NewPatientView from "../views/NewPatientView.vue";
import AdminView from "../views/AdminView.vue"; // Import the new AdminView
import MyPatientsView from "../views/MyPatientsView.vue"
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/about",
      name: "about",
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
      path: "/lab/new",
      name: "new-lab-result",
      component: NewLabResultView,
    },
    {
      path: "/record",
      name: "record",
      component: RecordView,
    },
    {
      path: "/record/new",
      name: "new-medical-record",
      component: NewMedicalRecordView,
    },
    {
      path: "/prescription",
      name: "prescription",
      component: PrescriptionView,
    },
    {
      path: "/prescription/new",
      name: "new-prescription",
      component: NewPrescriptionView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/patient/:id/",
      name: "edit-patient",
      component: EditPatientView,
      props: true, // Pass route params as props
    },
    {
      path: "/patients/new-patient",
      name: "new-patient",
      component: NewPatientView,
    },
    {
      path: "/staff",
      name: "admin",
      component: AdminView,
      meta: { requiresAdmin: true }, // Add meta field for admin-only access
    },
  {
    path: '/my-patients',
    name: 'my-patients',
    component: MyPatientsView,
    meta: { requiresAuth: true, role: 'DOCTOR' } // Ensure only authenticated DOCTORs can access
  },
	{
	  path: '/my-lab-results',
	  name: 'my-lab-results',
	  component: () => import('@/views/MyLabResultsView.vue'),
    meta: { requiresAuth: true, role: 'DOCTOR' } // Ensure only authenticated DOCTORs can access
	},
	{
	  path: '/my-health-records',
	  name: 'my-health-records',
	  component: () => import('@/views/MyHealthRecordsView.vue'),
    meta: { requiresAuth: true, role: 'DOCTOR' } // Ensure only authenticated DOCTORs can access
	},
	{
	  path: '/my-prescriptions',
	  name: 'my-prescriptions',
	  component: () => import('@/views/MyPrescriptionsView.vue'),
    meta: { requiresAuth: true, role: 'DOCTOR' } // Ensure only authenticated DOCTORs can access
	},
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Define routes that do not require authentication
  const publicRoutes = ["login", "register"];

  // Check if the route requires authentication
  const isAuthRequired = !publicRoutes.includes(to.name);

  // Redirect to login if authentication is required and the user is not authenticated
  if (isAuthRequired && !authStore.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAdmin && authStore.user?.role !== "ADMIN") {
    // Redirect to home or another page if the user is not an ADMIN
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
