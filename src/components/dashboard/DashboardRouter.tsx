import { useEffect, useState } from "react"
import { Navigate, Routes, Route } from "react-router-dom"
import { Loader, Center } from "@mantine/core"
import type { User } from "../../types"
import { getCurrentUser } from "../../services/authService"
import { AthleteDashboard } from "./AthleteDashboard"
import { ClubAdminDashboard } from "./ClubAdminDashboard"
import { FederalStateAdminDashboard } from "./FederalStateAdminDashboard"
import { StateAdminDashboard } from "./StateAdminDashboard"
import { ContinentalAdminDashboard } from "./ContinentalAdminDashboard"
import { InternationalAdminDashboard } from "./InternationalAdminDashboard"
import { CoachDashboard } from "./CoachDashboard"
import { OfficialDashboard } from "./OfficialDashboard"

export function DashboardRouter() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case "athlete":
        return <AthleteDashboard athleteId={user.athleteId || ""} />
      case "coach":
        return <CoachDashboard userId={user._id} />
      case "official":
        return <OfficialDashboard userId={user._id} />
      case "clubAdmin":
        return <ClubAdminDashboard clubId={user.clubId || ""} />
      case "federalStateAdmin":
        return <FederalStateAdminDashboard federationId={user.federationId || ""} />
      case "stateAdmin":
        return <StateAdminDashboard federationId={user.federationId || ""} />
      case "continentalAdmin":
        return <ContinentalAdminDashboard federationId={user.federationId || ""} />
      case "internationalAdmin":
        return <InternationalAdminDashboard federationId={user.federationId || ""} />
      default:
        return <Navigate to="/login" />
    }
  }

  return (
    <Routes>
      <Route index element={renderDashboard()} />
    </Routes>
  )
}

