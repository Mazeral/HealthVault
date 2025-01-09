<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth'; // Import the auth store
import { computed } from 'vue'; // Import computed for reactive properties

const authStore = useAuthStore();

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/login">Login</RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/register">Register</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/dashboard">Dashboard</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/patients">Patients</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/lab">Lab</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/record">Records</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/prescription">Prescriptions</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/dashboard">Dashboard</RouterLink>

		 <!-- Routes for dev purposed -->
        <RouterLink  to="/patients">Patients</RouterLink>
        <RouterLink  to="/lab">Lab</RouterLink>
        <RouterLink  to="/record">Records</RouterLink>
        <RouterLink  to="/prescription">Prescriptions</RouterLink>
        <RouterLink  to="/dashboard">Dashboard</RouterLink>
        <button v-if="isAuthenticated" @click="authStore.logout">Logout</button>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

button {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0 1rem;
}

button:hover {
  text-decoration: underline;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
