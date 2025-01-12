<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth'; // Import the auth store
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Computed property to get the user's role
const userRole = computed(() => authStore.user?.role);

const drawer = ref(true); // Controls the visibility of the sidebar

const logout = () => {
  authStore.logout();
  router.push({ name: 'login' }); // Redirect to the login page
};
</script>

<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <!-- Unauthenticated Links -->
        <template v-if="!isAuthenticated">
          <v-list-item to="/login" prepend-icon="mdi-login" color="light-green" title="Login" />
          <v-list-item to="/register" prepend-icon="mdi-account-plus" color="light-green" title="Register"/>
        </template>

        <!-- Authenticated Links -->
        <template v-if="isAuthenticated">
          <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" color="light-green" title="Dashboard"/>
          <v-list-item to="/patients" prepend-icon="mdi-account-group" title="Patients" color="light-green"/>
          <v-list-item to="/lab" prepend-icon="mdi-flask" title="Lab" />
          <v-list-item to="/record" prepend-icon="mdi-file-document" color="light-green" title="Records"/>
          <v-list-item to="/prescription" prepend-icon="mdi-pill" title="Prescriptions" color="light-green"/>

          <!-- Conditional Buttons Based on Role -->
          <template v-if="userRole === 'DOCTOR'">
            <v-list-item to="/my-patients" prepend-icon="mdi-account-heart" title="My Patients" color="light-green" />
          </template>
          <template v-if="userRole === 'ADMIN'">
            <v-list-item to="/staff" prepend-icon="mdi-account-supervisor" title="Staff" color="light-green" />
          </template>
        </template>
      </v-list>

      <!-- Logout Button -->
      <template v-if="isAuthenticated" v-slot:append>
        <v-list>
          <v-list-item @click="logout" prepend-icon="mdi-logout" title="Logout" color="light-green" />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>My Application</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
/* Optional: Add custom styles for the sidebar */
.v-navigation-drawer {
  background-color: #f5f5f5; /* Light gray background */
}
</style>
