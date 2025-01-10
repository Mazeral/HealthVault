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

	// Refs for form inputs
	const name = ref('');
	const email = ref('');
	const password = ref('');
	const role = ref('ADMIN'); // Default role in uppercase
	const roles = ref(['ADMIN', 'DOCTOR', 'NURSE']); // Roles available for selection
	const router = useRouter();

	// Registration handler
const handleRegister = async () => {
  // Prepare the data
  const data = {
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value.toUpperCase(),
  };

  console.log('Data being sent:', data); // Debugging: Check the data

  try {
    // Send POST request to register user
    const response = await api.post('/users', data)

    // Handle success
    alert('Registration successful!');
    router.push({ name: 'login' });
  } catch (error) {
    // Handle error
    console.error('Error details:', error); // Debugging: Log the full error
    alert('Registration failed: ' + (error.response?.data?.error || error.message));
  }
};
</script>
