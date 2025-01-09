<template>
  <v-container>
    <v-card class="mx-auto" max-width="500">
      <v-card-title>Register</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="name"
            label="Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
          ></v-text-field>
          <v-select
            v-model="role"
            :items="roles"
            label="Role"
            required
          ></v-select>
          <v-btn type="submit" color="primary">Register</v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="$router.push({ name: 'login' })">Already have an account? Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('user'); // Default role
const roles = ref(['user', 'admin']); // Roles available for selection
const router = useRouter();

const handleRegister = async () => {
  try {
    const response = await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });
    alert('Registration successful!');
    router.push({ name: 'login' }); // Redirect to login after registration
  } catch (error) {
    alert('Registration failed: ' + error.response?.data?.error || error.message);
  }
};
</script>
