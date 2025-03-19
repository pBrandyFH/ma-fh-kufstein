"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, ActionIcon, Menu, Loader } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail } from "lucide-react"
import type { Federation, Competition, Club } from "../../types"
import { getFederationById } from "../../services/federationService"
import { getCompetitionsByFederation } from "../../services/competitionService"
import { getClubsByFederation } from "../../services/clubService"

interface FederalStateAdminDashboardProps {
  federationId: string
}

export function FederalStateAdminDashboard({ federationId }: FederalStateAdminDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch federation details
        const fedResponse = await getFederationById(federationId)
        if (fedResponse.success && fedResponse.data) {
          setFederation(fedResponse.data)
        }

        // Fetch competitions
        const compsResponse = await getCompetitionsByFederation(federationId)
        if (compsResponse.success && compsResponse.data) {
          setCompetitions(compsResponse.data)
        }

        // Fetch clubs
        const clubsResponse = await getClubsByFederation(federationId)
        if (clubsResponse.success && clubsResponse.data) {
          setClubs(clubsResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (federationId) {
      fetchData()
    }
  }, [federationId])

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
                {federation?.name} {t("dashboard.federalStateAdminDashboardSubtitle")}
              </Text>
            </div>
            <Group>
              <Button leftIcon={<Plus size={16} />} component="a" href="/competitions/create">
                {t("competitions.create")}
              </Button>
              <Button leftIcon={<Plus size={16} />} component="a" href="/clubs/create">
                {t("dashboard.addClub")}
              </Button>
            </Group>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.nationalCompetitions")}
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
                      <Button size="xs" component="a" href={`/competitions/${comp._id}/edit`}>
                        {t("common.edit")}
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noNationalCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart" mb="md">
            <Title order={3}>{t("dashboard.clubManagement")}</Title>
            <Button leftIcon={<Plus size={16} />} component="a" href="/clubs/create">
              {t("dashboard.addClub")}
            </Button>
          </Group>

          {clubs.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {clubs.map((club) => (
                <Card key={club._id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{club.name}</Text>
                      <Text size="sm" color="dimmed">
                        {club.city}, {club.country}
                      </Text>
                    </div>
                    <Group>
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon>
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item icon={<Edit size={14} />} component="a" href={`/clubs/${club._id}/edit`}>
                            {t("common.edit")}
                          </Menu.Item>
                          <Menu.Item icon={<Mail size={14} />}>{t("dashboard.contactAdmin")}</Menu.Item>
                          <Menu.Item icon={<Trash size={14} />} color="red">
                            {t("common.delete")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noClubs")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

