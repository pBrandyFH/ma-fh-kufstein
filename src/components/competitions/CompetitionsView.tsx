import { Container, Title, Stack, Group, Button, Table, Badge, Text, Card, Grid, Select, TextInput } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Plus, Edit, Eye } from "lucide-react"
import { useState } from "react"

// TODO: Replace with actual data from API
const mockCompetitions = [
  {
    id: "1",
    name: "German Nationals 2024",
    date: "2024-06-15",
    location: "Berlin, Germany",
    type: "national",
    status: "upcoming",
    registrationDeadline: "2024-05-15",
    organizer: "German Powerlifting Federation",
    participants: 45,
    categories: ["open", "junior", "master"],
  },
  {
    id: "2",
    name: "Regional Championship",
    date: "2024-05-01",
    location: "Munich, Germany",
    type: "regional",
    status: "registration",
    registrationDeadline: "2024-04-01",
    organizer: "Bavarian Powerlifting Association",
    participants: 30,
    categories: ["open", "junior"],
  },
  {
    id: "3",
    name: "Club Competition",
    date: "2024-04-15",
    location: "Hamburg, Germany",
    type: "local",
    status: "completed",
    registrationDeadline: "2024-03-15",
    organizer: "Power Gym Hamburg",
    participants: 20,
    categories: ["open"],
  },
]

export function CompetitionsView() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredCompetitions = mockCompetitions.filter((competition) => {
    const matchesSearch = competition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competition.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competition.organizer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || competition.type === selectedType
    const matchesStatus = !selectedStatus || competition.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={1}>{t("competitions.title")}</Title>
          <Button
            component={Link}
            to="/competitions/new"
            leftIcon={<Plus size={20} />}
          >
            {t("competitions.create")}
          </Button>
        </Group>

        <Card withBorder>
          <Stack spacing="md">
            <Group>
              <TextInput
                placeholder={t("competitions.searchPlaceholder")}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder={t("competitions.typePlaceholder")}
                value={selectedType}
                onChange={setSelectedType}
                data={[
                  { value: "national", label: t("competitions.types.national") },
                  { value: "regional", label: t("competitions.types.regional") },
                  { value: "local", label: t("competitions.types.local") },
                ]}
                clearable
              />
              <Select
                placeholder={t("competitions.statusPlaceholder")}
                value={selectedStatus}
                onChange={setSelectedStatus}
                data={[
                  { value: "upcoming", label: t("competitions.status.upcoming") },
                  { value: "registration", label: t("competitions.status.registration") },
                  { value: "completed", label: t("competitions.status.completed") },
                ]}
                clearable
              />
            </Group>

            <Table>
              <thead>
                <tr>
                  <th>{t("competitions.name")}</th>
                  <th>{t("competitions.date")}</th>
                  <th>{t("competitions.location")}</th>
                  <th>{t("competitions.type")}</th>
                  <th>{t("competitions.status")}</th>
                  <th>{t("competitions.participants")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompetitions.map((competition) => (
                  <tr key={competition.id}>
                    <td>{competition.name}</td>
                    <td>{competition.date}</td>
                    <td>{competition.location}</td>
                    <td>
                      <Badge variant="light">
                        {t(`competitions.types.${competition.type}`)}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        color={
                          competition.status === "upcoming"
                            ? "blue"
                            : competition.status === "registration"
                            ? "green"
                            : "gray"
                        }
                      >
                        {t(`competitions.status.${competition.status}`)}
                      </Badge>
                    </td>
                    <td>{competition.participants}</td>
                    <td>
                      <Group spacing="xs">
                        <Button
                          component={Link}
                          to={`/competitions/${competition.id}`}
                          variant="subtle"
                          size="xs"
                          leftIcon={<Eye size={16} />}
                        >
                          {t("common.view")}
                        </Button>
                        <Button
                          component={Link}
                          to={`/competitions/${competition.id}/edit`}
                          variant="subtle"
                          size="xs"
                          leftIcon={<Edit size={16} />}
                        >
                          {t("common.edit")}
                        </Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 