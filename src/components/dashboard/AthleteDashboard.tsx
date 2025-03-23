"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, List, ThemeIcon, Divider, SimpleGrid } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Calendar, Medal, TrendingUp, Award, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { EmptyState } from "../common/EmptyState"

interface AthleteDashboardProps {
  athleteId: string
}

export function AthleteDashboard({ athleteId }: AthleteDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [athlete, setAthlete] = useState<any>(null)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<any[]>([])
  const [recentResults, setRecentResults] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API calls
        // const athleteResponse = await getAthleteById(athleteId)
        // if (athleteResponse.success && athleteResponse.data) {
        //   setAthlete(athleteResponse.data)
        // }
        // const performanceResponse = await getAthletePerformance(athleteId)
        // if (performanceResponse.success && performanceResponse.data) {
        //   setPerformanceData(performanceResponse.data)
        // }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (athleteId) {
      fetchData()
    }
  }, [athleteId])

  if (loading) {
    return (
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder p="xl">
            <Group position="center">
              <Text>Loading...</Text>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    )
  }

  if (!athlete) {
    return (
      <Grid gutter="md">
        <Grid.Col span={12}>
          <EmptyState
            title={t("common.emptyState.noData")}
            description={t("common.emptyState.noDataDescription")}
            icon="users"
          />
        </Grid.Col>
      </Grid>
    )
  }

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
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title={t("common.emptyState.noResults")}
              description={t("common.emptyState.noResultsDescription")}
              icon="award"
            />
          )}
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

