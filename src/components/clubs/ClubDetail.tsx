"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Title, Text, Group, Button, Loader, Grid, Tabs, ActionIcon, Menu } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Edit, Trash, Mail, Users, Building, MoreVertical } from "lucide-react"
import type { Club } from "../../types"
import { getClubById, deleteClub } from "../../services/clubService"
import { notifications } from "@mantine/notifications"

export function ClubDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState<Club | null>(null)

  useEffect(() => {
    const fetchClub = async () => {
      if (!id) return

      setLoading(true)
      try {
        const response = await getClubById(id)
        if (response.success && response.data) {
          setClub(response.data)
        } else {
          notifications.show({
            title: t("clubs.notFound"),
            message: t("clubs.clubNotFound"),
            color: "red",
          })
          navigate("/clubs")
        }
      } catch (error) {
        console.error("Error fetching club:", error)
        notifications.show({
          title: t("common.error"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClub()
  }, [id, navigate, t])

  const handleDelete = async () => {
    if (!club) return

    if (window.confirm(t("clubs.confirmDelete"))) {
      try {
        const response = await deleteClub(club._id)
        if (response.success) {
          notifications.show({
            title: t("clubs.deleteSuccess"),
            message: t("clubs.clubDeleted"),
            color: "green",
          })
          navigate("/clubs")
        } else {
          throw new Error(response.error)
        }
      } catch (error) {
        notifications.show({
          title: t("clubs.deleteFailed"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      }
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

  if (!club) {
    return (
      <Card withBorder p="xl">
        <Title order={3}>{t("clubs.notFound")}</Title>
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
                <Title order={2}>{club.name}</Title>
                <Text size="lg" color="dimmed">
                  ({club.abbreviation})
                </Text>
              </Group>
              <Text color="dimmed">
                {club.city && `${club.city}, `}
                {club.country}
              </Text>
              {club.federationId && typeof club.federationId !== "string" && (
                <Text size="sm" color="dimmed">
                  {t("clubs.federation")}: {club.federationId.name} ({club.federationId.abbreviation})
                </Text>
              )}
            </div>
            <Group>
              <Button leftIcon={<Edit size={16} />} component="a" href={`/clubs/${club._id}/edit`}>
                {t("common.edit")}
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon size="lg">
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<Mail size={14} />} component="a" href={`mailto:${club.contactEmail}`}>
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
                {t("clubs.details")}
              </Tabs.Tab>
              <Tabs.Tab value="athletes" icon={<Users size={14} />}>
                {t("athletes.title")}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details">
              <Grid>
                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      {t("clubs.contact")}
                    </Title>
                    {club.contactName && (
                      <Text mb="xs">
                        <strong>{t("clubs.contactName")}:</strong> {club.contactName}
                      </Text>
                    )}
                    {club.contactEmail && (
                      <Text mb="xs">
                        <strong>{t("clubs.contactEmail")}:</strong>{" "}
                        <a href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a>
                      </Text>
                    )}
                    {club.contactPhone && (
                      <Text mb="xs">
                        <strong>{t("clubs.contactPhone")}:</strong> {club.contactPhone}
                      </Text>
                    )}
                    {club.website && (
                      <Text mb="xs">
                        <strong>{t("clubs.website")}:</strong>{" "}
                        <a href={club.website} target="_blank" rel="noopener noreferrer">
                          {club.website}
                        </a>
                      </Text>
                    )}
                  </Card>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      {t("clubs.address")}
                    </Title>
                    {club.address && (
                      <Text mb="xs">
                        <strong>{t("clubs.address")}:</strong> {club.address}
                      </Text>
                    )}
                    {club.city && (
                      <Text mb="xs">
                        <strong>{t("clubs.city")}:</strong> {club.city}
                      </Text>
                    )}
                    {club.country && (
                      <Text mb="xs">
                        <strong>{t("clubs.country")}:</strong> {club.country}
                      </Text>
                    )}
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="athletes">
              <Button component="a" href={`/clubs/${club._id}/athletes`}>
                {t("athletes.title")}
              </Button>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Grid.Col>
    </Grid>
  )
}

