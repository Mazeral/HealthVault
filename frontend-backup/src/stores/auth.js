import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null); // Store user details (id, role, etc.)
  const isAuthenticated = ref(false); // Track authentication status

  /**
   * Login
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   */
  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        { user: username, password },
        {
          withCredentials: true, // Include cookies in the request
        },
      );

      if (response.data.login === "success") {
        // Fetch user details after successful login
        await checkAuth();
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true, // Include cookies in the request
      });

      if (response.data.logout === "success") {
        user.value = null;
        isAuthenticated.value = false;
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  /**
   * Check Authentication
   */
  const checkAuth = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/check-auth",
        {},
        {
          withCredentials: true, // Include cookies in the request
        },
      );

      if (response.data.userId && response.data.role) {
        user.value = {
          id: response.data.userId,
          role: response.data.role,
        };
        isAuthenticated.value = true;
      } else {
        throw new Error("Not authenticated");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      user.value = null;
      isAuthenticated.value = false;
      throw error;
    }
  };

  return { user, isAuthenticated, login, logout, checkAuth };
});
