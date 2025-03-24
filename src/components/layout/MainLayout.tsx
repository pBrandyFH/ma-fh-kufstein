import {
  AppShell,
  Header,
  Group,
  Button,
  Title,
  Container,
  ScrollArea,
  MantineProvider,
  Text,
  Menu,
  ActionIcon,
  Box,
  Portal,
  Navbar,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu as MenuIcon } from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  authenticated: boolean;
  onLogout: () => void;
}

export function MainLayout({
  children,
  authenticated,
  onLogout,
}: MainLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const publicNavItems = [
    { label: t("results.title"), path: "/results" },
    { label: t("nominations.title"), path: "/nominations" },
    { label: t("rankings.title"), path: "/rankings" },
    { label: t("records.title"), path: "/records" },
  ];

  const protectedNavItems = [
    { label: t("dashboard.title"), path: "/dashboard" },
    { label: t("athletes.title"), path: "/athletes" },
    { label: t("competitions.title"), path: "/competitions" },
    { label: t("federations.title"), path: "/federations" },
    { label: t("clubs.title"), path: "/clubs" },
    { label: t("invitations.title"), path: "/invitations" },
    { label: t("account.title"), path: "/account" },
  ];

  const navItems = authenticated
    ? [...protectedNavItems, ...publicNavItems]
    : publicNavItems;

  const handleLogout = () => {
    onLogout();
  };

  return (
    <MantineProvider
      theme={{ colorScheme: "light" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <AppShell
        padding="md"
        navbar={
          <MediaQuery largerThan="md" styles={{ display: "none" }}>
            <Navbar
              p="md"
              hidden={!opened}
              position={{ top: 0, left: 0 }}
              style={{
                position: "fixed",
                zIndex: 1000,
                backgroundColor: theme.white,
                borderRight: `1px solid ${theme.colors.gray[3]}`,
              }}
            >
              <Navbar.Section grow mt="xs">
                <ScrollArea>
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      variant={
                        location.pathname.startsWith(item.path)
                          ? "filled"
                          : "subtle"
                      }
                      fullWidth
                      mb="xs"
                      onClick={() => setOpened(false)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </ScrollArea>
              </Navbar.Section>

              <Navbar.Section>
                {authenticated ? (
                  <Button
                    variant="subtle"
                    fullWidth
                    color="red"
                    onClick={() => {
                      handleLogout();
                      setOpened(false);
                    }}
                  >
                    {t("auth.logout")}
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/login"
                    variant={
                      location.pathname === "/login" ? "filled" : "subtle"
                    }
                    fullWidth
                    onClick={() => setOpened(false)}
                  >
                    {t("auth.signIn")}
                  </Button>
                )}
              </Navbar.Section>
            </Navbar>
          </MediaQuery>
        }
        header={
          <Header height={60} p="xs" withBorder>
            <Group position="apart" h="100%" px="md">
              <Group>
                <MediaQuery largerThan="md" styles={{ display: "none" }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="md"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </MediaQuery>
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Group spacing="xs">
                    {/* <img src="/logo.png" alt="Logo" style={{ height: 32 }} /> */}
                    <Text size="xl" weight={700} color="blue">
                      GoodLift
                    </Text>
                  </Group>
                </Link>
              </Group>

              <MediaQuery smallerThan="md" styles={{ display: "none" }}>
                <Group spacing="xs">
                  {authenticated && (
                    <>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button
                            variant={
                              location.pathname.startsWith("/competitions") ||
                              location.pathname.startsWith("/nominations")
                                ? "filled"
                                : "subtle"
                            }
                            size="sm"
                            compact
                          >
                            {t("navigation.competitions")}
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            component={Link}
                            to="/competitions"
                            onClick={() => setOpened(false)}
                          >
                            {t("competitions.title")}
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            to="/nominations"
                            onClick={() => setOpened(false)}
                          >
                            {t("nominations.title")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button
                            variant={
                              location.pathname.startsWith("/federations") ||
                              location.pathname.startsWith("/clubs")
                                ? "filled"
                                : "subtle"
                            }
                            size="sm"
                            compact
                          >
                            {t("navigation.organizations")}
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            component={Link}
                            to="/federations"
                            onClick={() => setOpened(false)}
                          >
                            {t("federations.title")}
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            to="/clubs"
                            onClick={() => setOpened(false)}
                          >
                            {t("clubs.title")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button
                            variant={
                              location.pathname.startsWith("/athletes") ||
                              location.pathname.startsWith("/invitations")
                                ? "filled"
                                : "subtle"
                            }
                            size="sm"
                            compact
                          >
                            {t("navigation.users")}
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            component={Link}
                            to="/athletes"
                            onClick={() => setOpened(false)}
                          >
                            {t("athletes.title")}
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            to="/invitations"
                            onClick={() => setOpened(false)}
                          >
                            {t("invitations.title")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button
                            variant={
                              location.pathname.startsWith("/dashboard") ||
                              location.pathname.startsWith("/account")
                                ? "filled"
                                : "subtle"
                            }
                            size="sm"
                            compact
                          >
                            {t("navigation.account")}
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            component={Link}
                            to="/dashboard"
                            onClick={() => setOpened(false)}
                          >
                            {t("dashboard.title")}
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            to="/account"
                            onClick={() => setOpened(false)}
                          >
                            {t("account.title")}
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            onClick={() => {
                              handleLogout();
                              setOpened(false);
                            }}
                          >
                            {t("auth.logout")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </>
                  )}
                  {publicNavItems.map((item) => (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      variant={
                        location.pathname.startsWith(item.path)
                          ? "filled"
                          : "subtle"
                      }
                      size="sm"
                      compact
                    >
                      {item.label}
                    </Button>
                  ))}
                </Group>
              </MediaQuery>

              <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                <Group spacing="xs">
                  {authenticated ? (
                    <Button
                      variant="subtle"
                      size="sm"
                      compact
                      onClick={handleLogout}
                    >
                      {t("auth.logout")}
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to="/login"
                      variant={
                        location.pathname === "/login" ? "filled" : "subtle"
                      }
                      size="sm"
                      compact
                    >
                      {t("auth.signIn")}
                    </Button>
                  )}
                </Group>
              </MediaQuery>
            </Group>
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor: theme.white,
          },
          navbar: {
            [theme.fn.smallerThan("sm")]: {
              width: 0,
              margin: 0,
            },
          },
        })}
      >
        <Container size="xl">{children}</Container>
      </AppShell>
    </MantineProvider>
  );
}
