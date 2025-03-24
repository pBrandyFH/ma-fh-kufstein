import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:6000/api"

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    console.log("Token from localStorage:", token) // Debug log
    if (token) {
      // Ensure no extra whitespace in the Authorization header
      config.headers.Authorization = `Bearer ${token.trim()}`
      console.log("Request headers:", config.headers) // Debug log
      console.log("Request URL:", config.url) // Debug log
    } else {
      console.log("No token found in localStorage") // Debug log
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      console.log("401 error for URL:", error.config.url) // Debug log
      console.log("Request headers:", error.config.headers) // Debug log
      console.log("Error response:", error.response.data) // Debug log
      
      // Only handle 401s for protected routes
      const protectedRoutes = [
        "/api/dashboard",
        "/api/nominations",
        "/api/competitions",
        "/api/invitations",
        "/api/athletes",
        "/api/clubs",
        "/api/federations",
        "/api/users",
      ]
      
      const isProtectedRoute = protectedRoutes.some(route => 
        error.config.url?.includes(route)
      )

      if (isProtectedRoute) {
        console.log("Protected route 401, logging out...") // Debug log
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

