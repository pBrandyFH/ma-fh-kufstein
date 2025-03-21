"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Title, Text, Group, Button, Loader, Table, Badge, ActionIcon, Menu } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Users } from "lucide-react"
import type { Club, Athlete } from "../../types"
import { getClubById } from "../../services/clubService"
import { getAthletesByClub } from "../../services/athleteService"
import { notifications } from "@mantine/notifications"

export function ClubAthletes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState<Club | null>(null)
  const [athletes, setAthletes] = useState<Athlete[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      setLoading(true)
      try {
        // Fetch club details
        const clubResponse = await getClubById(id)
        if (clubResponse.success && clubResponse.data) {
          setClub(clubResponse.data)
        } else {
          notifications.show({
            title: t("clubs.notFound"),
            message: t("clubs.clubNotFound"),
            color: "red",
          })
          navigate("/clubs")
          return
        }

        // Fetch athletes for this club
        const athletesResponse = await getAthletesByClub(id)
        if (athletesResponse.success && athletesResponse.data) {
          setAthletes(athletesResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        notifications.show({
          title: t("common.error"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, t])

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
    <Card withBorder p="xl">
      <Group position="apart" mb="xl">
        <div>
          <Title order={2}>
            {club.name} - {t("athletes.title")}
          </Title>
          <Text color="dimmed">{t("dashboard.memberManagement")}</Text>
        </div>
        <Button leftIcon={<Plus size={16} />} component="a" href="/athletes/create">
          {t("athletes.create")}
        </Button>
      </Group>

      {athletes.length > 0 ? (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>{t("athletes.firstName")}</th>
              <th>{t("athletes.lastName")}</th>
              <th>{t("athletes.weightCategory")}</th>
              <th>{t("athletes.gender")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((athlete) => (
              <tr key={athlete._id}>
                <td>{athlete.firstName}</td>
                <td>{athlete.lastName}</td>
                <td>{athlete.weightCategory}</td>
                <td>
                  <Badge color={athlete.gender === "male" ? "blue" : "pink"}>
                    {athlete.gender === "male" ? t("athletes.male") : t("athletes.female")}
                  </Badge>
                </td>
                <td>
                  <Group spacing={0} position="right">
                    <ActionIcon component="a" href={`/athletes/${athlete._id}`}>
                      <Users size={16} />
                    </ActionIcon>
                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon>
                          <MoreVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item icon={<Edit size={14} />} component="a" href={`/athletes/${athlete._id}/edit`}>
                          {t("common.edit")}
                        </Menu.Item>
                        <Menu.Item icon={<Trash size={14} />} color="red">
                          {t("common.delete")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Text align="center">{t("dashboard.noAthletes")}</Text>
      )}
    </Card>
  )
}

