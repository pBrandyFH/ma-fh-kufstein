import { Container, Title, Stack, Group, Button, Table, Badge, Text, Card, Grid, Select, Tabs } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useState } from "react"

// TODO: Replace with actual data from API
const mockRankings = {
  open: {
    "59kg": [
      { rank: 1, name: "John Doe", club: "Power Gym Berlin", total: 600, points: 100 },
      { rank: 2, name: "Jane Smith", club: "Power Gym Munich", total: 585, points: 95 },
      { rank: 3, name: "Mike Johnson", club: "Power Gym Hamburg", total: 570, points: 90 },
    ],
    "66kg": [
      { rank: 1, name: "David Wilson", club: "Power Gym Frankfurt", total: 650, points: 100 },
      { rank: 2, name: "Sarah Brown", club: "Power Gym Cologne", total: 635, points: 95 },
      { rank: 3, name: "Tom Davis", club: "Power Gym Stuttgart", total: 620, points: 90 },
    ],
  },
  junior: {
    "59kg": [
      { rank: 1, name: "Alex Turner", club: "Power Gym Berlin", total: 550, points: 100 },
      { rank: 2, name: "Emma White", club: "Power Gym Munich", total: 535, points: 95 },
      { rank: 3, name: "Luke Green", club: "Power Gym Hamburg", total: 520, points: 90 },
    ],
    "66kg": [
      { rank: 1, name: "Sophie Clark", club: "Power Gym Frankfurt", total: 600, points: 100 },
      { rank: 2, name: "James Wilson", club: "Power Gym Cologne", total: 585, points: 95 },
      { rank: 3, name: "Lucy Brown", club: "Power Gym Stuttgart", total: 570, points: 90 },
    ],
  },
}

const weightClasses = [
  "59kg",
  "66kg",
  "74kg",
  "83kg",
  "93kg",
  "105kg",
  "120kg",
  "120kg+",
]

export function RankingsView() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("open")
  const [selectedWeightClass, setSelectedWeightClass] = useState("59kg")

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Title order={1}>{t("rankings.title")}</Title>

        <Card withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Select
                label={t("rankings.category")}
                placeholder={t("rankings.categoryPlaceholder")}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || "open")}
                data={[
                  { value: "open", label: t("rankings.categories.open") },
                  { value: "junior", label: t("rankings.categories.junior") },
                  { value: "master", label: t("rankings.categories.master") },
                ]}
              />
              <Select
                label={t("rankings.weightClass")}
                placeholder={t("rankings.weightClassPlaceholder")}
                value={selectedWeightClass}
                onChange={(value) => setSelectedWeightClass(value || "59kg")}
                data={weightClasses.map((wc) => ({ value: wc, label: wc }))}
              />
            </Group>

            <Table>
              <thead>
                <tr>
                  <th>{t("rankings.rank")}</th>
                  <th>{t("rankings.name")}</th>
                  <th>{t("rankings.club")}</th>
                  <th>{t("rankings.total")}</th>
                  <th>{t("rankings.points")}</th>
                </tr>
              </thead>
              <tbody>
                {mockRankings[selectedCategory as keyof typeof mockRankings][
                  selectedWeightClass as keyof typeof mockRankings["open"]
                ].map((athlete) => (
                  <tr key={athlete.rank}>
                    <td>
                      <Badge
                        color={
                          athlete.rank === 1
                            ? "gold"
                            : athlete.rank === 2
                            ? "silver"
                            : athlete.rank === 3
                            ? "bronze"
                            : "gray"
                        }
                      >
                        {athlete.rank}
                      </Badge>
                    </td>
                    <td>{athlete.name}</td>
                    <td>{athlete.club}</td>
                    <td>{athlete.total}kg</td>
                    <td>{athlete.points}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack spacing="md">
            <Title order={3}>{t("rankings.about")}</Title>
            <Text>{t("rankings.description")}</Text>
            <Text size="sm" color="dimmed">
              {t("rankings.lastUpdated")}: {new Date().toLocaleDateString()}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 