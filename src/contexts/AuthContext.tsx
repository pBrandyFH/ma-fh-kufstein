import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import * as authService from "../services/authService"
import type { User, LoginFormValues } from "../types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (data: LoginFormValues) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const login = async (data: LoginFormValues) => {
    const response = await authService.login(data)
    if (response.success && response.data) {
      setUser(response.data.user)
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: authService.isAuthenticated(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 