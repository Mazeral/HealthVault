<template>
  <v-container>
    <h1>Welcome, {{ authStore.user?.name }}</h1>
    <v-btn @click="authStore.logout">Logout</v-btn>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>
