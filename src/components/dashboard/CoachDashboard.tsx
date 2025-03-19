"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, ActionIcon, Menu, Loader } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { MoreVertical, Users, TrendingUp } from "lucide-react"
import type { User, Athlete, Competition } from "../../types"
import { getUserById } from "../../services/userService"
import { getAthletesByCoach } from "../../services/athleteService"
import { getUpcomingCompetitions } from "../../services/competitionService"

interface CoachDashboardProps {
  userId: string
}

export function CoachDashboard({ userId }: CoachDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user details
        const userResponse = await getUserById(userId)
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }

        // Fetch athletes
        const athletesResponse = await getAthletesByCoach(userId)
        if (athletesResponse.success && athletesResponse.data) {
          setAthletes(athletesResponse.data)
        }

        // Fetch upcoming competitions
        const compsResponse = await getUpcomingCompetitions()
        if (compsResponse.success && compsResponse.data) {
          setCompetitions(compsResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  if (loading) {
    return (
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder p="xl">
            <Group position="center">
              <Loader />
            </Group>
          </Card>
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
              <Title order={2}>{t("dashboard.welcome")}</Title>
              <Text color="dimmed">
                {user?.firstName} {user?.lastName} {t("dashboard.coachDashboardSubtitle")}
              </Text>
            </div>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.myAthletes")}
          </Title>
          {athletes.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {athletes.map((athlete) => (
                <Card key={athlete._id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>
                        {athlete.firstName} {athlete.lastName}
                      </Text>
                      <Text size="sm" color="dimmed">
                        {athlete.weightCategory}
                      </Text>
                    </div>
                    <Group>
                      <Badge>{athlete.gender === "male" ? t("athletes.male") : t("athletes.female")}</Badge>
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon>
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item icon={<Users size={14} />} component="a" href={`/athletes/${athlete._id}`}>
                            {t("athletes.profile")}
                          </Menu.Item>
                          <Menu.Item
                            icon={<TrendingUp size={14} />}
                            component="a"
                            href={`/athletes/${athlete._id}/performance`}
                          >
                            {t("athletes.performance")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noAthletes")}</Text>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.upcomingCompetitions")}
          </Title>
          {competitions.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {competitions.map((comp) => (
                <Card key={comp._id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{comp.name}</Text>
                      <Text size="sm" color="dimmed">
                        {new Date(comp.startDate).toLocaleDateString()} • {comp.city}, {comp.country}
                      </Text>
                      <Text size="xs" color="dimmed" mt={5}>
                        {t("competitions.nominationDeadline")}: {new Date(comp.nominationDeadline).toLocaleDateString()}
                      </Text>
                    </div>
                    <Group>
                      <Badge color={comp.status === "upcoming" ? "green" : "red"}>
                        {comp.status === "upcoming" ? t("competitions.open") : t("competitions.closed")}
                      </Badge>
                      <Button size="xs" component="a" href={`/competitions/${comp._id}`}>
                        {t("common.view")}
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noUpcomingCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

