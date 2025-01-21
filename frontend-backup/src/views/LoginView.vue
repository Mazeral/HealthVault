<template>
  <v-container>
    <v-card class="mx-auto" max-width="500">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <!-- Error Alert -->
        <v-alert v-if="errorMessage" type="error" dismissible @input="errorMessage = ''">
          {{ errorMessage }}
        </v-alert>

        <!-- Login Form -->
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="Username"
            :rules="[required]"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[required]"
            required
          ></v-text-field>
          <v-btn
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="goToRegister">Don't have an account? Register</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

// Validation rule
const required = (value) => !!value || 'This field is required.';

const handleLogin = async () => {
  // Reset error message
  errorMessage.value = '';

  // Basic form validation
  if (!username.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  // Set loading state
  isLoading.value = true;

  try {
    // Call the login method from the auth store
    await authStore.login(username.value, password.value);

    // Check the user's role and redirect accordingly
    if (authStore.user?.role === 'ADMIN') {
      router.push({ name: 'admin' }); // Redirect admins to the dashboard
    } else if (authStore.user?.role === 'DOCTOR') {
      router.push({ name: 'dashboard' }); // Redirect doctors to the staff page
    } else {
      // Default fallback (e.g., for other roles or unhandled cases)
      router.push({ name: 'dashboard' });
    }
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = 'Login failed. Please check your credentials.'; // User-friendly error message
  } finally {
    // Reset loading state
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push({ name: 'register' }); // Redirect to the registration page
};
</script>
