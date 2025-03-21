import { Group, Container, Button, ActionIcon, useMantineColorScheme } from "@mantine/core"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Sun, Moon, Globe } from "lucide-react"
import { Logo } from "./Logo"

export function TopNav() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const navItems = [
    { path: "/results", label: t("navigation.results") },
    { path: "/rankings", label: t("navigation.rankings") },
    { path: "/records", label: t("navigation.records") },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <Container size="100%" px="md" py="md" style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)" }}>
      <Group position="apart" noWrap>
        <Logo size="sm" />

        <Group spacing="md" noWrap>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? "filled" : "subtle"}
              color="white"
            >
              {item.label}
            </Button>
          ))}
        </Group>

        <Group spacing="xs" noWrap>
          <ActionIcon
            variant="subtle"
            color="white"
            onClick={() => changeLanguage(i18n.language === "en" ? "de" : "en")}
          >
            <Globe size={20} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="white" onClick={() => toggleColorScheme()}>
            {colorScheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </ActionIcon>
          <Button component={Link} to="/login" variant="light" color="white">
            {t("navigation.signIn")}
          </Button>
        </Group>
      </Group>
    </Container>
  )
} 