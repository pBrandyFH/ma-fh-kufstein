import { Container, Title, Stack, Group, Button, Table, Badge, Text, Card, Grid, Select, TextInput } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Plus, Edit, Eye } from "lucide-react"
import { useState } from "react"

// TODO: Replace with actual data from API
const mockNominations = [
  {
    id: "1",
    competitionName: "German Nationals 2024",
    athleteName: "John Doe",
    category: "open",
    weightClass: "93kg",
    status: "pending",
    submittedBy: "Power Gym Berlin",
    submissionDate: "2024-03-01",
  },
  {
    id: "2",
    competitionName: "Regional Championship",
    athleteName: "Jane Smith",
    category: "junior",
    weightClass: "66kg",
    status: "approved",
    submittedBy: "Power Gym Munich",
    submissionDate: "2024-03-05",
  },
  {
    id: "3",
    competitionName: "Club Competition",
    athleteName: "Mike Johnson",
    category: "master",
    weightClass: "105kg",
    status: "rejected",
    submittedBy: "Power Gym Hamburg",
    submissionDate: "2024-03-10",
  },
]

export function NominationsView() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredNominations = mockNominations.filter((nomination) => {
    const matchesSearch = nomination.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nomination.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nomination.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || nomination.status === selectedStatus
    const matchesCategory = !selectedCategory || nomination.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={1}>{t("nominations.title")}</Title>
          <Button
            component={Link}
            to="/nominations/new"
            leftIcon={<Plus size={20} />}
          >
            {t("nominations.create")}
          </Button>
        </Group>

        <Card withBorder>
          <Stack spacing="md">
            <Group>
              <TextInput
                placeholder={t("nominations.searchPlaceholder")}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder={t("nominations.statusPlaceholder")}
                value={selectedStatus}
                onChange={setSelectedStatus}
                data={[
                  { value: "pending", label: t("nominations.status.pending") },
                  { value: "approved", label: t("nominations.status.approved") },
                  { value: "rejected", label: t("nominations.status.rejected") },
                ]}
                clearable
              />
              <Select
                placeholder={t("nominations.categoryPlaceholder")}
                value={selectedCategory}
                onChange={setSelectedCategory}
                data={[
                  { value: "open", label: t("athletes.categories.open") },
                  { value: "junior", label: t("athletes.categories.junior") },
                  { value: "master", label: t("athletes.categories.master") },
                ]}
                clearable
              />
            </Group>

            <Table>
              <thead>
                <tr>
                  <th>{t("nominations.competition")}</th>
                  <th>{t("nominations.athlete")}</th>
                  <th>{t("nominations.category")}</th>
                  <th>{t("nominations.weightClass")}</th>
                  <th>{t("nominations.status")}</th>
                  <th>{t("nominations.submittedBy")}</th>
                  <th>{t("nominations.submissionDate")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredNominations.map((nomination) => (
                  <tr key={nomination.id}>
                    <td>{nomination.competitionName}</td>
                    <td>{nomination.athleteName}</td>
                    <td>
                      <Badge variant="light">
                        {t(`athletes.categories.${nomination.category}`)}
                      </Badge>
                    </td>
                    <td>{nomination.weightClass}</td>
                    <td>
                      <Badge
                        color={
                          nomination.status === "pending"
                            ? "yellow"
                            : nomination.status === "approved"
                            ? "green"
                            : "red"
                        }
                      >
                        {t(`nominations.status.${nomination.status}`)}
                      </Badge>
                    </td>
                    <td>{nomination.submittedBy}</td>
                    <td>{nomination.submissionDate}</td>
                    <td>
                      <Group spacing="xs">
                        <Button
                          component={Link}
                          to={`/nominations/${nomination.id}`}
                          variant="subtle"
                          size="xs"
                          leftIcon={<Eye size={16} />}
                        >
                          {t("common.view")}
                        </Button>
                        <Button
                          component={Link}
                          to={`/nominations/${nomination.id}/edit`}
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