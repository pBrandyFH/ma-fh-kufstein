import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Loader,
  SimpleGrid,
  ActionIcon,
  Menu,
  Badge,
  Select,
} from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail, Users } from "lucide-react"
import type { Club, Federation } from "../../types"
import { getAllClubs, getClubsByFederation } from "../../services/clubService"
import { getAllFederations } from "../../services/federationService"

interface ClubListProps {
  federationId?: string
  onEdit?: (club: Club) => void
  onDelete?: (club: Club) => void
  onContact?: (club: Club) => void
}

export function ClubList({ federationId, onEdit, onDelete, onContact }: ClubListProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [federations, setFederations] = useState<Federation[]>([])
  const [selectedFederation, setSelectedFederation] = useState<string | null>(federationId || null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch federations
        const fedResponse = await getAllFederations()
        if (fedResponse.success && fedResponse.data) {
          setFederations(fedResponse.data)
        }

        // Fetch clubs
        let clubsResponse
        if (selectedFederation) {
          clubsResponse = await getClubsByFederation(selectedFederation)
        } else {
          clubsResponse = await getAllClubs()
        }

        if (clubsResponse.success && clubsResponse.data) {
          setClubs(clubsResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedFederation])

  const handleFederationChange = (value: string | null) => {
    setSelectedFederation(value)
  }

  const getFederationOptions = () => {
    return federations.map((fed) => ({
      value: fed._id,
      label: `${fed.name} (${fed.abbreviation})`,
    }))
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

  return (
    <Card withBorder p="xl">
      <Group position="apart" mb="xl">
        <Title order={2}>{t("clubs.title")}</Title>
        <Button leftIcon={<Plus size={16} />} component="a" href="/clubs/create">
          {t("clubs.create")}
        </Button>
      </Group>

      {!federationId && (
        <Select
          label={t("clubs.filterByFederation")}
          placeholder={t("clubs.selectFederation")}
          data={getFederationOptions()}
          value={selectedFederation}
          onChange={handleFederationChange}
          clearable
          mb="lg"
        />
      )}

      {clubs.length > 0 ? (
        <SimpleGrid cols={1} spacing="md">
          {clubs.map((club) => (
            <Card key={club._id} withBorder p="md">
              <Group position="apart">
                <div>
                  <Group>
                    <Text weight={500}>{club.name}</Text>
                    <Text size="sm" color="dimmed">
                      ({club.abbreviation})
                    </Text>
                  </Group>
                  <Text size="sm" color="dimmed">
                    {club.city && `${club.city}, `}
                    {club.country}
                  </Text>
                  {club.federationId && typeof club.federationId !== "string" && (
                    <Text size="xs" color="dimmed">
                      {t("clubs.federation")}: {club.federationId.name} ({club.federationId.abbreviation})
                    </Text>
                  )}
                </div>
                <Group>
                  <Button size="xs" leftIcon={<Users size={14} />} component="a" href={`/clubs/${club._id}/athletes`}>
                    {t("athletes.title")}
                  </Button>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon>
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {onEdit && (
                        <Menu.Item icon={<Edit size={14} />} onClick={() => onEdit(club)}>
                          {t("common.edit")}
                        </Menu.Item>
                      )}
                      {onContact && (
                        <Menu.Item icon={<Mail size={14} />} onClick={() => onContact(club)}>
                          {t("common.contact")}
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <Menu.Item icon={<Trash size={14} />} color="red" onClick={() => onDelete(club)}>
                          {t("common.delete")}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text color="dimmed" align="center">
          {t("clubs.noClubs")}
        </Text>
      )}
    </Card>
  )
}

