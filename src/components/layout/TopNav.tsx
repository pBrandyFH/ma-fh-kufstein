import { Group, ActionIcon, Menu, Avatar, Text, ColorSchemeProvider } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Sun, Moon, LogOut, User, Settings, Globe } from "lucide-react"
import { useState } from "react"

export function TopNav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light")

  const toggleColorScheme = (value?: "light" | "dark") =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/login")
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <Group position="apart" px="md">
        <Group>
          <Text size="xl" weight={700}>
            GoodLift
          </Text>
        </Group>

        <Group>
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            size={30}
          >
            {colorScheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </ActionIcon>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="default" size={30}>
                <Globe size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item>English</Menu.Item>
              <Menu.Item>Deutsch</Menu.Item>
              <Menu.Item>Français</Menu.Item>
              <Menu.Item>Italiano</Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Group spacing={7}>
                <Avatar radius="xl" size={30} />
                <Text size="sm" weight={500}>
                  John Doe
                </Text>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t("navigation.account")}</Menu.Label>
              <Menu.Item icon={<User size={14} />} onClick={() => navigate("/profile")}>
                {t("navigation.myAccount")}
              </Menu.Item>
              <Menu.Item icon={<Settings size={14} />} onClick={() => navigate("/settings")}>
                {t("navigation.settings")}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" icon={<LogOut size={14} />} onClick={handleLogout}>
                {t("navigation.logout")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </ColorSchemeProvider>
  )
} 