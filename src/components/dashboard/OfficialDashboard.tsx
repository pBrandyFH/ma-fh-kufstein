"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, Loader } from "@mantine/core"
import { useTranslation } from "react-i18next"
import type { User, Competition } from "../../types"
import { getUserById } from "../../services/userService"
import { getAssignedCompetitions } from "../../services/competitionService"

interface OfficialDashboardProps {
  userId: string
}

export function OfficialDashboard({ userId }: OfficialDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [assignedCompetitions, setAssignedCompetitions] = useState<Competition[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user details
        const userResponse = await getUserById(userId)
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }

        // Fetch assigned competitions
        const compsResponse = await getAssignedCompetitions(userId)
        if (compsResponse.success && compsResponse.data) {
          setAssignedCompetitions(compsResponse.data)
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
                {user?.firstName} {user?.lastName} {t("dashboard.officialDashboardSubtitle")}
              </Text>
            </div>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.assignedCompetitions")}
          </Title>
          {assignedCompetitions.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {assignedCompetitions.map((comp) => (
                <Card key={comp._id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{comp.name}</Text>
                      <Text size="sm" color="dimmed">
                        {new Date(comp.startDate).toLocaleDateString()} • {comp.city}, {comp.country}
                      </Text>
                    </div>
                    <Group>
                      <Badge color={comp.status === "upcoming" ? "blue" : comp.status === "ongoing" ? "green" : "gray"}>
                        {comp.status === "upcoming"
                          ? t("competitions.upcoming")
                          : comp.status === "ongoing"
                            ? t("competitions.ongoing")
                            : t("competitions.completed")}
                      </Badge>
                      <Button size="xs" component="a" href={`/competitions/${comp._id}`}>
                        {t("common.view")}
                      </Button>
                      {comp.status === "ongoing" && (
                        <Button size="xs" component="a" href={`/competitions/${comp._id}/scoring`} color="green">
                          {t("competitions.enterScores")}
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noAssignedCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

