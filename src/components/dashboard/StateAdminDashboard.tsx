"use client"

import { useEffect, useState } from "react"
import {
  Grid,
  Card,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Tabs,
  SimpleGrid,
  ActionIcon,
  Menu,
  Loader,
} from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Users } from "lucide-react"
import type { Federation, Competition, Athlete } from "../../types"
import { getFederationById } from "../../services/federationService"
import { getCompetitionsByFederation, getInternationalCompetitions } from "../../services/competitionService"
import { getAthletesByFederation } from "../../services/athleteService"

interface StateAdminDashboardProps {
  federationId: string
}

export function StateAdminDashboard({ federationId }: StateAdminDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [nationalCompetitions, setNationalCompetitions] = useState<Competition[]>([])
  const [internationalCompetitions, setInternationalCompetitions] = useState<Competition[]>([])
  const [nationalTeam, setNationalTeam] = useState<Athlete[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch federation details
        const fedResponse = await getFederationById(federationId)
        if (fedResponse.success && fedResponse.data) {
          setFederation(fedResponse.data)
        }

        // Fetch national competitions
        const nationalCompsResponse = await getCompetitionsByFederation(federationId)
        if (nationalCompsResponse.success && nationalCompsResponse.data) {
          setNationalCompetitions(nationalCompsResponse.data)
        }

        // Fetch international competitions
        const intlCompsResponse = await getInternationalCompetitions()
        if (intlCompsResponse.success && intlCompsResponse.data) {
          setInternationalCompetitions(intlCompsResponse.data)
        }

        // Fetch national team athletes
        const athletesResponse = await getAthletesByFederation(federationId, true)
        if (athletesResponse.success && athletesResponse.data) {
          setNationalTeam(athletesResponse.data)
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
                {federation?.name} {t("dashboard.stateAdminDashboardSubtitle")}
              </Text>
            </div>
            <Group>
              <Button leftIcon={<Plus size={16} />} component="a" href="/competitions/create">
                {t("competitions.create")}
              </Button>
              <Button leftIcon={<Plus size={16} />} component="a" href="/nominations/create">
                {t("nominations.create")}
              </Button>
            </Group>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Tabs defaultValue="international">
          <Tabs.List mb="md">
            <Tabs.Tab value="international">{t("competitions.international")}</Tabs.Tab>
            <Tabs.Tab value="national">{t("competitions.national")}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="international">
            <Card withBorder p="xl">
              <Title order={3} mb="md">
                {t("dashboard.internationalCompetitions")}
              </Title>
              {internationalCompetitions.length > 0 ? (
                <SimpleGrid cols={1} spacing="md">
                  {internationalCompetitions.map((comp) => (
                    <Card key={comp._id} withBorder p="md">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{comp.name}</Text>
                          <Text size="sm" color="dimmed">
                            {new Date(comp.startDate).toLocaleDateString()} • {comp.city}, {comp.country}
                          </Text>
                          <Text size="xs" color="dimmed" mt={5}>
                            {t("competitions.nominationDeadline")}:{" "}
                            {new Date(comp.nominationDeadline).toLocaleDateString()}
                          </Text>
                        </div>
                        <Group>
                          <Badge color={comp.status === "upcoming" ? "green" : "red"}>
                            {comp.status === "upcoming" ? t("competitions.open") : t("competitions.closed")}
                          </Badge>
                          <Button size="xs" component="a" href={`/nominations/create?competitionId=${comp._id}`}>
                            {t("nominations.nominate")}
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Text color="dimmed">{t("dashboard.noInternationalCompetitions")}</Text>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="national">
            <Card withBorder p="xl">
              <Title order={3} mb="md">
                {t("dashboard.nationalCompetitions")}
              </Title>
              {nationalCompetitions.length > 0 ? (
                <SimpleGrid cols={1} spacing="md">
                  {nationalCompetitions.map((comp) => (
                    <Card key={comp._id} withBorder p="md">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{comp.name}</Text>
                          <Text size="sm" color="dimmed">
                            {new Date(comp.startDate).toLocaleDateString()} • {comp.city}, {comp.country}
                          </Text>
                          <Text size="xs" color="dimmed" mt={5}>
                            {t("competitions.nominationDeadline")}:{" "}
                            {new Date(comp.nominationDeadline).toLocaleDateString()}
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
          </Tabs.Panel>
        </Tabs>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart" mb="md">
            <Title order={3}>{t("dashboard.nationalTeam")}</Title>
            <Button leftIcon={<Plus size={16} />} component="a" href="/athletes/create">
              {t("athletes.create")}
            </Button>
          </Group>

          {nationalTeam.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {nationalTeam.map((athlete) => (
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
                          <Menu.Item icon={<Edit size={14} />} component="a" href={`/athletes/${athlete._id}/edit`}>
                            {t("common.edit")}
                          </Menu.Item>
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
            <Text color="dimmed">{t("dashboard.noNationalTeamMembers")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

