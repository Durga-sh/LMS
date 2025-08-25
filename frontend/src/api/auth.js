
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class AuthAPI {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Registration API error:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Logout API error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get current user API error:", error);
      throw error;
    }
  }

  async refreshTokens() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Refresh tokens API error:", error);
      throw error;
    }
  }
}

export default new AuthAPI();
