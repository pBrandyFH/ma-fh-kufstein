"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, ActionIcon, Menu, Loader, useMantineTheme, Portal, Tabs, Table, Stack } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail, Users, Trophy, Building2 } from "lucide-react"
import { notifications } from "@mantine/notifications"
import type { Federation, Competition, User, Club, FederationType } from "../../../types"
import { getFederationById, getFederationsByParent, getChildFederations } from "../../../services/federationService"
import { getCompetitionsByFederation } from "../../../services/competitionService"
import { getUsersByFederation } from "../../../services/userService"
import { getClubsByFederation } from "../../../services/clubService"

interface FederationDetailsProps {
  federationId: string
}

export function FederationDetails({ federationId }: FederationDetailsProps) {
  const { t } = useTranslation()
  const theme = useMantineTheme()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [subFederations, setSubFederations] = useState<Federation[]>([])
  const [activeTab, setActiveTab] = useState<string | null>("overview")

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

      // Fetch users
      const usersResponse = await getUsersByFederation(federationId)
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data)
      }

      // Fetch clubs (only for NATIONAL or federal state federations)
      if (federation?.type === "NATIONAL" || federation?.type === "STATE") {
        const clubsResponse = await getClubsByFederation(federationId)
        if (clubsResponse.success && clubsResponse.data) {
          setClubs(clubsResponse.data)
        }
      }

      // Fetch sub-federations
      const subFedsResponse = await getChildFederations(federationId)
      if (subFedsResponse.success && subFedsResponse.data) {
        setSubFederations(subFedsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      notifications.show({
        title: t("common.error"),
        message: t("federations.fetchError"),
        color: "red"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  if (!federation) {
    return (
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder p="xl">
            <Text color="red">{t("federations.notFound")}</Text>
          </Card>
        </Grid.Col>
      </Grid>
    )
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Stack spacing="md">
            <Group position="apart">
              <div>
                <Title order={2}>{federation.name}</Title>
                <Text color="dimmed">{federation.abbreviation}</Text>
              </div>
              <Group>
                <Button leftIcon={<Edit size={16} />} component="a" href={`/federations/${federationId}/edit`}>
                  {t("common.edit")}
                </Button>
                <Menu position="bottom-end" offset={5} withinPortal>
                  <Menu.Target>
                    <ActionIcon>
                      <MoreVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Portal>
                    <Menu.Dropdown>
                      <Menu.Item icon={<Mail size={14} />}>{t("federations.contactAdmin")}</Menu.Item>
                      <Menu.Item icon={<Trash size={14} />} color="red">
                        {t("common.delete")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Portal>
                </Menu>
              </Group>
            </Group>

            <Tabs value={activeTab} onTabChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="overview">{t("common.overview")}</Tabs.Tab>
                <Tabs.Tab value="sub-federations" icon={<Building2 size={14} />}>
                  {t("federations.subFederations")}
                </Tabs.Tab>
                <Tabs.Tab value="users" icon={<Users size={14} />}>
                  {t("common.users")}
                </Tabs.Tab>
                <Tabs.Tab value="competitions" icon={<Trophy size={14} />}>
                  {t("common.competitions")}
                </Tabs.Tab>
                {(federation.type === "NATIONAL" || federation.type === "STATE") && (
                  <Tabs.Tab value="clubs" icon={<Building2 size={14} />}>
                    {t("common.clubs")}
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="overview" pt="md">
                <Stack spacing="md">
                  <Card withBorder p="md">
                    <Title order={4} mb="md">{t("federations.contactInfo")}</Title>
                    <Stack spacing="xs">
                      {federation.contactName && (
                        <Text><strong>{t("federations.contactName")}:</strong> {federation.contactName}</Text>
                      )}
                      {federation.contactEmail && (
                        <Text><strong>{t("federations.contactEmail")}:</strong> {federation.contactEmail}</Text>
                      )}
                      {federation.contactPhone && (
                        <Text><strong>{t("federations.contactPhone")}:</strong> {federation.contactPhone}</Text>
                      )}
                      {federation.website && (
                        <Text><strong>{t("federations.website")}:</strong> {federation.website}</Text>
                      )}
                      {federation.address && (
                        <Text><strong>{t("federations.address")}:</strong> {federation.address}</Text>
                      )}
                      {federation.city && (
                        <Text><strong>{t("federations.city")}:</strong> {federation.city}</Text>
                      )}
                      {federation.country && (
                        <Text><strong>{t("federations.country")}:</strong> {federation.country}</Text>
                      )}
                    </Stack>
                  </Card>

                  <SimpleGrid cols={3} spacing="md">
                    <Card withBorder p="md">
                      <Text size="lg" weight={500}>{subFederations.length}</Text>
                      <Text color="dimmed">{t("federations.subFederations")}</Text>
                    </Card>
                    <Card withBorder p="md">
                      <Text size="lg" weight={500}>{users.length}</Text>
                      <Text color="dimmed">{t("common.users")}</Text>
                    </Card>
                    <Card withBorder p="md">
                      <Text size="lg" weight={500}>{competitions.length}</Text>
                      <Text color="dimmed">{t("common.competitions")}</Text>
                    </Card>
                  </SimpleGrid>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="sub-federations" pt="md">
                <Group position="apart" mb="md">
                  <Title order={4}>{t("federations.subFederations")}</Title>
                  <Button leftIcon={<Plus size={16} />} component="a" href={`/federations/create?parent=${federationId}`}>
                    {t("federations.create")}
                  </Button>
                </Group>
                <SimpleGrid cols={1} spacing="md">
                  {subFederations.map((fed) => (
                    <Card key={fed._id} withBorder p="md">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{fed.name}</Text>
                          <Text size="sm" color="dimmed">{fed.abbreviation}</Text>
                        </div>
                        <Group>
                          <Button size="xs" component="a" href={`/federations/${fed._id}`}>
                            {t("common.view")}
                          </Button>
                          <Button size="xs" component="a" href={`/federations/${fed._id}/edit`}>
                            {t("common.edit")}
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="users" pt="md">
                <Group position="apart" mb="md">
                  <Title order={4}>{t("common.users")}</Title>
                  <Button leftIcon={<Plus size={16} />} component="a" href={`/users/create?federation=${federationId}`}>
                    {t("users.create")}
                  </Button>
                </Group>
                <Table>
                  <thead>
                    <tr>
                      <th>{t("users.name")}</th>
                      <th>{t("users.email")}</th>
                      <th>{t("users.role")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <Group spacing="xs">
                            <Button size="xs" component="a" href={`/users/${user._id}`}>
                              {t("common.view")}
                            </Button>
                            <Button size="xs" component="a" href={`/users/${user._id}/edit`}>
                              {t("common.edit")}
                            </Button>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tabs.Panel>

              <Tabs.Panel value="competitions" pt="md">
                <Group position="apart" mb="md">
                  <Title order={4}>{t("common.competitions")}</Title>
                  <Button leftIcon={<Plus size={16} />} component="a" href={`/competitions/create?federation=${federationId}`}>
                    {t("competitions.create")}
                  </Button>
                </Group>
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
              </Tabs.Panel>

              {(federation.type === "NATIONAL" || federation.type === "STATE") && (
                <Tabs.Panel value="clubs" pt="md">
                  <Group position="apart" mb="md">
                    <Title order={4}>{t("common.clubs")}</Title>
                    <Button leftIcon={<Plus size={16} />} component="a" href={`/clubs/create?federation=${federationId}`}>
                      {t("clubs.create")}
                    </Button>
                  </Group>
                  <SimpleGrid cols={1} spacing="md">
                    {clubs.map((club) => (
                      <Card key={club._id} withBorder p="md">
                        <Group position="apart">
                          <div>
                            <Text weight={500}>{club.name}</Text>
                            <Text size="sm" color="dimmed">{club.abbreviation}</Text>
                          </div>
                          <Group>
                            <Button size="xs" component="a" href={`/clubs/${club._id}`}>
                              {t("common.view")}
                            </Button>
                            <Button size="xs" component="a" href={`/clubs/${club._id}/edit`}>
                              {t("common.edit")}
                            </Button>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Tabs.Panel>
              )}
            </Tabs>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  )
} 