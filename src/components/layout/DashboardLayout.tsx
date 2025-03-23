import { AppShell, Navbar, Header } from "@mantine/core"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Sidebar />
        </Navbar>
      }
      header={
        <Header height={60} p="xs">
          <TopNav />
        </Header>
      }
    >
      {children}
    </AppShell>
  )
} 