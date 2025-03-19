"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, Badge, SimpleGrid, ActionIcon, Menu, Tabs } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Users, Award, Plus, MoreVertical, Edit, Trash, Mail } from "lucide-react"

interface ClubAdminDashboardProps {
  club: any
}

export function ClubAdminDashboard({ club }: ClubAdminDashboardProps) {
  const { t } = useTranslation()
  const [nationalCompetitions, setNationalCompetitions] = useState<any[]>([])
  const [athletes, setAthletes] = useState<any[]>([])
  const [officials, setOfficials] = useState<any[]>([])

  useEffect(() => {
    // Mock data - in a real app, these would be API calls
    setNationalCompetitions([
      {
        id: "1",
        name: "2023 National Championships",
        date: "2023-07-15",
        location: "Vienna, Austria",
        nominationDeadline: "2023-06-15",
        status: "open",
      },
      {
        id: "2",
        name: "2023 National Cup",
        date: "2023-09-22",
        location: "Salzburg, Austria",
        nominationDeadline: "2023-08-22",
        status: "open",
      },
    ])

    setAthletes([
      {
        id: "1",
        name: "John Doe",
        weightCategory: "-83kg",
        status: "active",
      },
      {
        id: "2",
        name: "Jane Smith",
        weightCategory: "-63kg",
        status: "active",
      },
      {
        id: "3",
        name: "Mike Johnson",
        weightCategory: "-93kg",
        status: "inactive",
      },
    ])

    setOfficials([
      {
        id: "1",
        name: "Robert Brown",
        role: "Coach",
        status: "active",
      },
      {
        id: "2",
        name: "Sarah Wilson",
        role: "Judge",
        status: "active",
      },
    ])
  }, [])

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart">
            <div>
              <Title order={2}>{t("dashboard.welcome")}</Title>
              <Text color="dimmed">
                {club.name} {t("dashboard.clubAdminDashboardSubtitle")}
              </Text>
            </div>
            <Button leftIcon={<Plus size={16} />}>{t("nominations.createNomination")}</Button>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("dashboard.nationalCompetitions")}
          </Title>
          {nationalCompetitions.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {nationalCompetitions.map((comp) => (
                <Card key={comp.id} withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{comp.name}</Text>
                      <Text size="sm" color="dimmed">
                        {comp.date} • {comp.location}
                      </Text>
                      <Text size="xs" color="dimmed" mt={5}>
                        {t("competitions.nominationDeadline")}: {comp.nominationDeadline}
                      </Text>
                    </div>
                    <Group>
                      <Badge color={comp.status === "open" ? "green" : "red"}>
                        {comp.status === "open" ? t("competitions.open") : t("competitions.closed")}
                      </Badge>
                      <Button size="xs" disabled={comp.status !== "open"}>
                        {t("nominations.nominate")}
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
            <Title order={3}>{t("dashboard.memberManagement")}</Title>
            <Button leftIcon={<Plus size={16} />}>{t("dashboard.addMember")}</Button>
          </Group>

          <Tabs defaultValue="athletes">
            <Tabs.List mb="md">
              <Tabs.Tab value="athletes" icon={<Users size={14} />}>
                {t("athletes.title")}
              </Tabs.Tab>
              <Tabs.Tab value="officials" icon={<Award size={14} />}>
                {t("dashboard.officials")}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="athletes">
              {athletes.length > 0 ? (
                <SimpleGrid cols={1} spacing="md">
                  {athletes.map((athlete) => (
                    <Card key={athlete.id} withBorder p="md">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{athlete.name}</Text>
                          <Text size="sm" color="dimmed">
                            {athlete.weightCategory}
                          </Text>
                        </div>
                        <Group>
                          <Badge color={athlete.status === "active" ? "green" : "gray"}>
                            {athlete.status === "active" ? t("dashboard.active") : t("dashboard.inactive")}
                          </Badge>
                          <Menu position="bottom-end">
                            <Menu.Target>
                              <ActionIcon>
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item icon={<Edit size={14} />}>{t("common.edit")}</Menu.Item>
                              <Menu.Item icon={<Mail size={14} />}>{t("dashboard.resendInvite")}</Menu.Item>
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
                <Text color="dimmed">{t("dashboard.noAthletes")}</Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="officials">
              {officials.length > 0 ? (
                <SimpleGrid cols={1} spacing="md">
                  {officials.map((official) => (
                    <Card key={official.id} withBorder p="md">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{official.name}</Text>
                          <Text size="sm" color="dimmed">
                            {official.role}
                          </Text>
                        </div>
                        <Group>
                          <Badge color={official.status === "active" ? "green" : "gray"}>
                            {official.status === "active" ? t("dashboard.active") : t("dashboard.inactive")}
                          </Badge>
                          <Menu position="bottom-end">
                            <Menu.Target>
                              <ActionIcon>
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item icon={<Edit size={14} />}>{t("common.edit")}</Menu.Item>
                              <Menu.Item icon={<Mail size={14} />}>{t("dashboard.resendInvite")}</Menu.Item>
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
                <Text color="dimmed">{t("dashboard.noOfficials")}</Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Grid.Col>
    </Grid>
  )
}

