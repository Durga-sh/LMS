// Debug utility to check environment configuration
export const debugEnvironment = () => {
  console.log("=== ENVIRONMENT DEBUG INFO ===");
  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
  console.log("MODE:", import.meta.env.MODE);
  console.log("NODE_ENV:", import.meta.env.NODE_ENV);
  console.log("Current location:", window.location.href);
  console.log("User agent:", navigator.userAgent);
  console.log("Cookies enabled:", navigator.cookieEnabled);
  console.log("Current cookies:", document.cookie);
  console.log("===============================");
};

// Call this in development to verify configuration
if (import.meta.env.MODE === "development") {
  debugEnvironment();
}
