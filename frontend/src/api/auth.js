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
      console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      // Log successful login for debugging
      if (data.success) {
        console.log("Login successful, checking cookies...");
        // Check if cookies are being set by making a test request
        setTimeout(async () => {
          try {
            const testResponse = await fetch(`${API_BASE_URL}/auth/me`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            const testData = await testResponse.json();
            console.log(
              "Post-login auth check:",
              testData.success ? "SUCCESS" : "FAILED"
            );
          } catch (err) {
            console.log("Post-login auth check failed:", err.message);
          }
        }, 50);
      }

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
      console.log("Getting current user from:", `${API_BASE_URL}/auth/me`);

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      // If access token expired, try to refresh
      if (!response.ok && data.code === "TOKEN_EXPIRED") {
        console.log("Access token expired, attempting refresh...");
        const refreshResult = await this.refreshTokens();

        if (refreshResult.success) {
          // Retry the original request after refresh
          const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          return await retryResponse.json();
        }
      }

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
