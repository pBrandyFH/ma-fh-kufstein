"use client"

import type React from "react"
import { useState } from "react"
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  ActionIcon,
  Menu,
  UnstyledButton,
  Avatar,
  Divider,
  ScrollArea,
  NavLink,
  Select,
  Box,
} from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Sun,
  Moon,
  Globe,
  Mail,
  Medal,
  ClipboardList,
} from "lucide-react"

// Add onLogout to the props interface
interface MainLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

// Update the component signature to include onLogout
export function MainLayout({ children, onLogout }: MainLayoutProps) {
  const theme = useMantineTheme()
  const [opened, setOpened] = useState(false)
  const { t, i18n } = useTranslation()
  const location = useLocation()

  // Add the handleLogout function
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  const navItems = [
    { icon: Home, label: t("navigation.dashboard"), link: "/dashboard" },
    { icon: ClipboardList, label: t("navigation.nominations"), link: "/nominations" },
    { icon: Trophy, label: t("navigation.results"), link: "/results" },
    { icon: TrendingUp, label: t("navigation.rankings"), link: "/rankings" },
    { icon: Medal, label: t("navigation.records"), link: "/records" },
  ]

  const adminItems = [
    { icon: Calendar, label: t("navigation.competitions"), link: "/competitions" },
    { icon: Users, label: t("navigation.athletes"), link: "/athletes" },
    { icon: Mail, label: t("navigation.invitations"), link: "/invitations" },
  ]

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 250, lg: 300 }}>
          <Navbar.Section mt="xs">
            <Text size="xl" weight={700} align="center" mb="lg">
              GoodLift
            </Text>
          </Navbar.Section>

          <Divider my="sm" />

          <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.link}
                label={item.label}
                icon={<item.icon size={20} />}
                component={Link}
                to={item.link}
                mb="xs"
                active={location.pathname === item.link}
              />
            ))}

            <Divider my="sm" label={t("navigation.admin")} labelPosition="center" />

            {adminItems.map((item) => (
              <NavLink
                key={item.link}
                label={item.label}
                icon={<item.icon size={20} />}
                component={Link}
                to={item.link}
                mb="xs"
                active={location.pathname === item.link}
              />
            ))}
          </Navbar.Section>

          <Divider my="sm" />

          <Navbar.Section>
            <UnstyledButton
              sx={{
                display: "block",
                width: "100%",
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
                "&:hover": {
                  backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                },
              }}
            >
              <Group>
                <Avatar radius="xl" color="blue">
                  JD
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    John Doe
                  </Text>
                  <Text color="dimmed" size="xs">
                    john.doe@example.com
                  </Text>
                </Box>
                <Menu position="top-end">
                  <Menu.Target>
                    <ActionIcon>
                      <ChevronDown size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item component={Link} to="/account" icon={<User size={14} />}>
                      {t("navigation.myAccount")}
                    </Menu.Item>
                    <Menu.Item icon={<Settings size={14} />}>{t("navigation.settings")}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item icon={<LogOut size={14} />} color="red" onClick={handleLogout}>
                      {t("auth.logout")}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </UnstyledButton>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="md">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <Group>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm" color={theme.colors.gray[6]} />
              </MediaQuery>
              <Text size="lg" weight={700}>
                GoodLift
              </Text>
            </Group>

            <Group>
              <Select
                value={i18n.language}
                onChange={(value) => changeLanguage(value || "en")}
                data={[
                  { value: "en", label: "English" },
                  { value: "de", label: "Deutsch" },
                  { value: "fr", label: "Français" },
                  { value: "it", label: "Italiano" },
                ]}
                icon={<Globe size={16} />}
                size="xs"
                styles={{ input: { width: 120 } }}
              />

              <ActionIcon variant="default" size={30}>
                {theme.colorScheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </ActionIcon>
            </Group>
          </div>
        </Header>
      }
      footer={
        <Footer height={60} p="md">
          <Group position="apart">
            <Text size="sm" color="dimmed">
              © 2024 GoodLift. {t("common.allRightsReserved")}
            </Text>
            <Group spacing="xs">
              <ActionIcon size="lg" variant="default" radius="xl">
                {theme.colorScheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </ActionIcon>
            </Group>
          </Group>
        </Footer>
      }
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  )
}

