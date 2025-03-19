"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, ActionIcon, Menu, Loader } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail } from "lucide-react"
import type { Federation, Competition } from "../../types"
import { getFederationById, getFederationsByParent } from "../../services/federationService"
import { getCompetitionsByFederation } from "../../services/competitionService"

interface ContinentalAdminDashboardProps {
  federationId: string
}

export function ContinentalAdminDashboard({ federationId }: ContinentalAdminDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [nationalFederations, setNationalFederations] = useState<Federation[]>([])

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

        // Fetch national federations
        const natlFedsResponse = await getFederationsByParent(federationId)
        if (natlFedsResponse.success && natlFedsResponse.data) {
          setNationalFederations(natlFedsResponse.data)
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
                {federation?.name} {t("dashboard.continentalAdminDashboardSubtitle")}
              </Text>
            </div>
            <Group>
              <Button leftIcon={<Plus size={16} />} component="a" href="/competitions/create">
                {t("competitions.create")}
              </Button>
              <Button leftIcon={<Plus size={16} />} component="a" href="/federations/create">
                {t("federations.create")}
              </Button>
            </Group>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.continentalCompetitions")}
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
            <Text color="dimmed">{t("dashboard.noContinentalCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart" mb="md">
            <Title order={3}>{t("dashboard.nationalFederations")}</Title>
            <Button leftIcon={<Plus size={16} />} component="a" href="/federations/create">
              {t("federations.create")}
            </Button>
          </Group>

          {nationalFederations.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {nationalFederations.map((fed) => (
                <Card key={fed._id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{fed.name}</Text>
                      <Text size="sm" color="dimmed">
                        {fed.abbreviation}
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
                          <Menu.Item icon={<Edit size={14} />} component="a" href={`/federations/${fed._id}/edit`}>
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
            <Text color="dimmed">{t("dashboard.noNationalFederations")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

