import { NavLink, Stack } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Medal,
  Target,
  Settings,
  UserCircle,
  Bell,
} from "lucide-react"

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: t("navigation.dashboard"), path: "/dashboard" },
    { icon: Users, label: t("navigation.athletes"), path: "/athletes" },
    { icon: Trophy, label: t("navigation.competitions"), path: "/competitions" },
    { icon: Medal, label: t("navigation.results"), path: "/results" },
    { icon: Target, label: t("navigation.rankings"), path: "/rankings" },
    { icon: Bell, label: t("navigation.records"), path: "/records" },
    { icon: UserCircle, label: t("navigation.myAccount"), path: "/profile" },
    { icon: Settings, label: t("navigation.settings"), path: "/settings" },
  ]

  return (
    <Stack spacing="xs">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          component={Link}
          to={item.path}
          label={item.label}
          icon={<item.icon size={20} />}
          active={location.pathname === item.path}
          variant="filled"
          color="blue"
        />
      ))}
    </Stack>
  )
} 