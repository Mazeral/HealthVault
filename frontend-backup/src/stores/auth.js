import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { user: username, password });
      user.value = response.data.user;
      isAuthenticated.value = true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      user.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/check');
      user.value = response.data.user;
      isAuthenticated.value = true;
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  };

  return { user, isAuthenticated, login, logout, checkAuth };
});
