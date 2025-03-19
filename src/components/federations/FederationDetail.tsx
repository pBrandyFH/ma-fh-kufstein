"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Title, Text, Group, Button, Loader, Grid, Badge, Tabs, ActionIcon, Menu } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Edit, Trash, Mail, Users, Building, Calendar, MoreVertical } from "lucide-react"
import type { Federation } from "../../types"
import { getFederationById, deleteFederation } from "../../services/federationService"
import { ClubList } from "../clubs/ClubList"
import { FederationList } from "./FederationList"
import { notifications } from "@mantine/notifications"

export function FederationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)

  useEffect(() => {
    const fetchFederation = async () => {
      if (!id) return

      setLoading(true)
      try {
        const response = await getFederationById(id)
        if (response.success && response.data) {
          setFederation(response.data)
        } else {
          notifications.show({
            title: t("federations.notFound"),
            message: t("federations.federationNotFound"),
            color: "red",
          })
          navigate("/federations")
        }
      } catch (error) {
        console.error("Error fetching federation:", error)
        notifications.show({
          title: t("common.error"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFederation()
  }, [id, navigate, t])

  const handleDelete = async () => {
    if (!federation) return

    if (window.confirm(t("federations.confirmDelete"))) {
      try {
        const response = await deleteFederation(federation._id)
        if (response.success) {
          notifications.show({
            title: t("federations.deleteSuccess"),
            message: t("federations.federationDeleted"),
            color: "green",
          })
          navigate("/federations")
        } else {
          throw new Error(response.error)
        }
      } catch (error) {
        notifications.show({
          title: t("federations.deleteFailed"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      }
    }
  }

  const getFederationTypeLabel = (type: string): string => {
    switch (type) {
      case "international":
        return t("federations.types.international")
      case "continental":
        return t("federations.types.continental")
      case "national":
        return t("federations.types.national")
      case "federalState":
        return t("federations.types.federalState")
      default:
        return type
    }
  }

  const getFederationTypeColor = (type: string): string => {
    switch (type) {
      case "international":
        return "blue"
      case "continental":
        return "green"
      case "national":
        return "orange"
      case "federalState":
        return "grape"
      default:
        return "gray"
    }
  }

  if (loading) {
    return (
      <Card withBorder p="xl">
        <Group position="center">
          <Loader />
        </Group>
      </Card>
    )
  }

  if (!federation) {
    return (
      <Card withBorder p="xl">
        <Text align="center">{t("federations.notFound")}</Text>
      </Card>
    )
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart">
            <div>
              <Group>
                <Title order={2}>{federation.name}</Title>
                <Text size="lg" color="dimmed">
                  ({federation.abbreviation})
                </Text>
                <Badge color={getFederationTypeColor(federation.type)}>{getFederationTypeLabel(federation.type)}</Badge>
              </Group>
              <Text color="dimmed">
                {federation.city && `${federation.city}, `}
                {federation.country}
              </Text>
            </div>
            <Group>
              <Button leftIcon={<Edit size={16} />} component="a" href={`/federations/${federation._id}/edit`}>
                {t("common.edit")}
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon size="lg">
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<Mail size={14} />} component="a" href={`mailto:${federation.contactEmail}`}>
                    {t("common.contact")}
                  </Menu.Item>
                  <Menu.Item icon={<Trash size={14} />} color="red" onClick={handleDelete}>
                    {t("common.delete")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Tabs defaultValue="details">
            <Tabs.List mb="md">
              <Tabs.Tab value="details" icon={<Building size={14} />}>
                {t("federations.details")}
              </Tabs.Tab>
              <Tabs.Tab value="clubs" icon={<Users size={14} />}>
                {t("clubs.title")}
              </Tabs.Tab>
              {(federation.type === "international" ||
                federation.type === "continental" ||
                federation.type === "national") && (
                <Tabs.Tab value="federations" icon={<Building size={14} />}>
                  {t("federations.childFederations")}
                </Tabs.Tab>
              )}
              <Tabs.Tab value="competitions" icon={<Calendar size={14} />}>
                {t("competitions.title")}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details">
              <Grid>
                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      {t("federations.contact")}
                    </Title>
                    {federation.contactName && (
                      <Text mb="xs">
                        <strong>{t("federations.contactName")}:</strong> {federation.contactName}
                      </Text>
                    )}
                    {federation.contactEmail && (
                      <Text mb="xs">
                        <strong>{t("federations.contactEmail")}:</strong>{" "}
                        <a href={`mailto:${federation.contactEmail}`}>{federation.contactEmail}</a>
                      </Text>
                    )}
                    {federation.contactPhone && (
                      <Text mb="xs">
                        <strong>{t("federations.contactPhone")}:</strong> {federation.contactPhone}
                      </Text>
                    )}
                    {federation.website && (
                      <Text mb="xs">
                        <strong>{t("federations.website")}:</strong>{" "}
                        <a href={federation.website} target="_blank" rel="noopener noreferrer">
                          {federation.website}
                        </a>
                      </Text>
                    )}
                  </Card>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      {t("federations.address")}
                    </Title>
                    {federation.address && (
                      <Text mb="xs">
                        <strong>{t("federations.address")}:</strong> {federation.address}
                      </Text>
                    )}
                    {federation.city && (
                      <Text mb="xs">
                        <strong>{t("federations.city")}:</strong> {federation.city}
                      </Text>
                    )}
                    {federation.country && (
                      <Text mb="xs">
                        <strong>{t("federations.country")}:</strong> {federation.country}
                      </Text>
                    )}
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="clubs">
              <ClubList federationId={federation._id} />
            </Tabs.Panel>

            {(federation.type === "international" ||
              federation.type === "continental" ||
              federation.type === "national") && (
              <Tabs.Panel value="federations">
                <FederationList />
              </Tabs.Panel>
            )}

            <Tabs.Panel value="competitions">
              <Text>{t("competitions.noCompetitions")}</Text>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Grid.Col>
    </Grid>
  )
}

