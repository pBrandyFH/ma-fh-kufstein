import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Tabs,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Grid,
  Paper,
  Loader,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  IconTrophy,
  IconUsers,
  IconUserCheck,
  IconBuilding,
  IconChartBar,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { getAllCompetitions } from "../services/competitionService";
import { getAthletes } from "../services/athleteService";
import type { Competition, Athlete } from "../types";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    competitions: 0,
    athletes: 0,
    officials: 0,
    clubs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch competitions
        const competitionsResponse = await getAllCompetitions();
        if (competitionsResponse.success) {
          setStats((prev) => ({
            ...prev,
            competitions: competitionsResponse.data?.length ?? 0,
          }));
        }

        // Fetch athletes
        const athletesResponse = await getAthletes();
        if (athletesResponse.success) {
          setStats((prev) => ({
            ...prev,
            athletes: athletesResponse.data?.length ?? 0,
          }));
        }

        // For now, we'll use placeholder data for officials and clubs
        setStats((prev) => ({
          ...prev,
          officials: 0,
          clubs: 0,
        }));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to determine which tabs should be visible based on user role
  const getVisibleTabs = () => {
    if (!user) {
      console.log("No user found");
      return [];
    }

    console.log("Current user role:", user.role);

    const tabs = [
      { value: "overview", label: t("dashboard.overview"), icon: IconChartBar },
    ];

    // All roles can see competitions
    tabs.push({
      value: "competitions",
      label: t("dashboard.competitions"),
      icon: IconTrophy,
    });

    // Athletes can see their results
    if (user.role === "athlete") {
      tabs.push({
        value: "myResults",
        label: t("dashboard.myResults"),
        icon: IconChartBar,
      });
    }

    // Coaches and admins can see athletes
    if (
      [
        "coach",
        "clubAdmin",
        "federalStateAdmin",
        "stateAdmin",
        "continentalAdmin",
        "internationalAdmin",
      ].includes(user.role)
    ) {
      tabs.push({
        value: "athletes",
        label: t("dashboard.athletes"),
        icon: IconUsers,
      });
    }

    // Officials and admins can see officials
    if (
      [
        "official",
        "clubAdmin",
        "federalStateAdmin",
        "stateAdmin",
        "continentalAdmin",
        "internationalAdmin",
      ].includes(user.role)
    ) {
      tabs.push({
        value: "officials",
        label: t("dashboard.officials"),
        icon: IconUserCheck,
      });
    }

    // Admins can see clubs
    if (
      [
        "clubAdmin",
        "federalStateAdmin",
        "stateAdmin",
        "continentalAdmin",
        "internationalAdmin",
      ].includes(user.role)
    ) {
      tabs.push({
        value: "clubs",
        label: t("dashboard.clubs"),
        icon: IconBuilding,
      });
    }

    console.log("Visible tabs:", tabs);
    return tabs;
  };

  const visibleTabs = getVisibleTabs();

  if (!user) {
    return (
      <Container size="xl">
        <Stack spacing="xl">
          <Title order={1}>{t("dashboard.title")}</Title>
          <Text>{t("dashboard.loginRequired")}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Title order={1}>{t("dashboard.title")}</Title>

        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            {visibleTabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                icon={<tab.icon size={14} />}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <Grid>
              <Grid.Col span={12} md={6} lg={3}>
                <Card withBorder>
                  <Group position="apart" mb="xs">
                    <Text size="sm" color="dimmed">
                      {t("dashboard.totalCompetitions")}
                    </Text>
                    <IconTrophy size={16} />
                  </Group>
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <Text size="xl" weight={500}>
                      {stats.competitions}
                    </Text>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={6} lg={3}>
                <Card withBorder>
                  <Group position="apart" mb="xs">
                    <Text size="sm" color="dimmed">
                      {t("dashboard.totalAthletes")}
                    </Text>
                    <IconUsers size={16} />
                  </Group>
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <Text size="xl" weight={500}>
                      {stats.athletes}
                    </Text>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={6} lg={3}>
                <Card withBorder>
                  <Group position="apart" mb="xs">
                    <Text size="sm" color="dimmed">
                      {t("dashboard.totalOfficials")}
                    </Text>
                    <IconUserCheck size={16} />
                  </Group>
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <Text size="xl" weight={500}>
                      {stats.officials}
                    </Text>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={6} lg={3}>
                <Card withBorder>
                  <Group position="apart" mb="xs">
                    <Text size="sm" color="dimmed">
                      {t("dashboard.totalClubs")}
                    </Text>
                    <IconBuilding size={16} />
                  </Group>
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <Text size="xl" weight={500}>
                      {stats.clubs}
                    </Text>
                  )}
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="competitions" pt="xl">
            <Card withBorder>
              <Text>Competitions content will go here</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="athletes" pt="xl">
            <Card withBorder>
              <Text>Athletes content will go here</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="officials" pt="xl">
            <Card withBorder>
              <Text>Officials content will go here</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="clubs" pt="xl">
            <Card withBorder>
              <Text>Clubs content will go here</Text>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="myResults" pt="xl">
            <Card withBorder>
              <Text>My Results content will go here</Text>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
