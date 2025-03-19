"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, List, ThemeIcon, Divider, SimpleGrid } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Calendar, Medal, TrendingUp, Award, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AthleteDashboardProps {
  athlete: any
}

export function AthleteDashboard({ athlete }: AthleteDashboardProps) {
  const { t } = useTranslation()
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<any[]>([])
  const [recentResults, setRecentResults] = useState<any[]>([])

  useEffect(() => {
    // Mock data - in a real app, these would be API calls
    setPerformanceData([
      { date: "2022-01", total: 500 },
      { date: "2022-03", total: 520 },
      { date: "2022-06", total: 535 },
      { date: "2022-09", total: 550 },
      { date: "2022-12", total: 560 },
      { date: "2023-03", total: 575 },
    ])

    setUpcomingCompetitions([
      {
        id: "1",
        name: "2023 National Championships",
        date: "2023-07-15",
        location: "Vienna, Austria",
        status: "confirmed",
      },
      {
        id: "2",
        name: "2023 European Championships",
        date: "2023-09-22",
        location: "Berlin, Germany",
        status: "pending",
      },
    ])

    setRecentResults([
      {
        id: "1",
        competition: "2023 Regional Cup",
        date: "2023-02-18",
        place: 1,
        total: 565,
        wilks: 350.2,
      },
      {
        id: "2",
        competition: "2022 National Championships",
        date: "2022-12-10",
        place: 2,
        total: 560,
        wilks: 347.5,
      },
    ])
  }, [])

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart">
            <div>
              <Title order={2}>
                {t("dashboard.welcome")}, {athlete.firstName}!
              </Title>
              <Text color="dimmed">{t("dashboard.athleteDashboardSubtitle")}</Text>
            </div>
            <Badge size="lg">{athlete.weightCategory}</Badge>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col md={8}>
        <Card withBorder p="xl" h="100%">
          <Title order={3} mb="md">
            {t("dashboard.performance")}
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid.Col>

      <Grid.Col md={4}>
        <Card withBorder p="xl" h="100%">
          <Title order={3} mb="md">
            {t("dashboard.quickLinks")}
          </Title>
          <List spacing="md">
            <List.Item
              icon={
                <ThemeIcon color="blue" size={24} radius="xl">
                  <Calendar size={16} />
                </ThemeIcon>
              }
            >
              <Button variant="subtle" rightIcon={<ChevronRight size={16} />} compact>
                {t("dashboard.viewCompetitionCalendar")}
              </Button>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon color="green" size={24} radius="xl">
                  <Medal size={16} />
                </ThemeIcon>
              }
            >
              <Button variant="subtle" rightIcon={<ChevronRight size={16} />} compact>
                {t("dashboard.viewMyResults")}
              </Button>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon color="orange" size={24} radius="xl">
                  <TrendingUp size={16} />
                </ThemeIcon>
              }
            >
              <Button variant="subtle" rightIcon={<ChevronRight size={16} />} compact>
                {t("dashboard.viewRankings")}
              </Button>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon color="grape" size={24} radius="xl">
                  <Award size={16} />
                </ThemeIcon>
              }
            >
              <Button variant="subtle" rightIcon={<ChevronRight size={16} />} compact>
                {t("dashboard.updateProfile")}
              </Button>
            </List.Item>
          </List>
        </Card>
      </Grid.Col>

      <Grid.Col md={6}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.upcomingCompetitions")}
          </Title>
          {upcomingCompetitions.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {upcomingCompetitions.map((comp) => (
                <Card key={comp.id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{comp.name}</Text>
                      <Text size="sm" color="dimmed">
                        {comp.date} • {comp.location}
                      </Text>
                    </div>
                    <Badge color={comp.status === "confirmed" ? "green" : "yellow"}>
                      {comp.status === "confirmed" ? t("nominations.confirmed") : t("nominations.pending")}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noUpcomingCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col md={6}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.recentResults")}
          </Title>
          {recentResults.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {recentResults.map((result) => (
                <Card key={result.id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{result.competition}</Text>
                      <Text size="sm" color="dimmed">
                        {result.date}
                      </Text>
                    </div>
                    <Badge
                      color={
                        result.place === 1
                          ? "gold"
                          : result.place === 2
                            ? "silver"
                            : result.place === 3
                              ? "bronze"
                              : "gray"
                      }
                    >
                      {result.place}
                      {result.place === 1 ? "st" : result.place === 2 ? "nd" : result.place === 3 ? "rd" : "th"}
                    </Badge>
                  </Group>
                  <Divider my="sm" />
                  <Group position="apart">
                    <Text size="sm">
                      {t("results.total")}: {result.total}kg
                    </Text>
                    <Text size="sm">
                      {t("results.wilks")}: {result.wilks}
                    </Text>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noRecentResults")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

