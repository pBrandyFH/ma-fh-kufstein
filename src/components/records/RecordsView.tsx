import { Container, Title, Stack, Group, Button, Table, Badge, Text, Card, Grid, Select, Tabs } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useState } from "react"

// TODO: Replace with actual data from API
const mockRecords = {
  open: {
    "59kg": {
      squat: { weight: 250, holder: "John Doe", date: "2024-03-15", competition: "National Championship 2024" },
      benchPress: { weight: 160, holder: "Jane Smith", date: "2024-03-15", competition: "National Championship 2024" },
      deadlift: { weight: 280, holder: "Mike Johnson", date: "2024-03-15", competition: "National Championship 2024" },
      total: { weight: 690, holder: "John Doe", date: "2024-03-15", competition: "National Championship 2024" },
    },
    "66kg": {
      squat: { weight: 280, holder: "David Wilson", date: "2024-03-15", competition: "National Championship 2024" },
      benchPress: { weight: 180, holder: "Sarah Brown", date: "2024-03-15", competition: "National Championship 2024" },
      deadlift: { weight: 300, holder: "Tom Davis", date: "2024-03-15", competition: "National Championship 2024" },
      total: { weight: 760, holder: "David Wilson", date: "2024-03-15", competition: "National Championship 2024" },
    },
  },
  junior: {
    "59kg": {
      squat: { weight: 230, holder: "Alex Turner", date: "2024-03-15", competition: "National Championship 2024" },
      benchPress: { weight: 150, holder: "Emma White", date: "2024-03-15", competition: "National Championship 2024" },
      deadlift: { weight: 260, holder: "Luke Green", date: "2024-03-15", competition: "National Championship 2024" },
      total: { weight: 640, holder: "Alex Turner", date: "2024-03-15", competition: "National Championship 2024" },
    },
    "66kg": {
      squat: { weight: 260, holder: "Sophie Clark", date: "2024-03-15", competition: "National Championship 2024" },
      benchPress: { weight: 170, holder: "James Wilson", date: "2024-03-15", competition: "National Championship 2024" },
      deadlift: { weight: 280, holder: "Lucy Brown", date: "2024-03-15", competition: "National Championship 2024" },
      total: { weight: 710, holder: "Sophie Clark", date: "2024-03-15", competition: "National Championship 2024" },
    },
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

export function RecordsView() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("open")
  const [selectedWeightClass, setSelectedWeightClass] = useState("59kg")

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Title order={1}>{t("records.title")}</Title>

        <Card withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Select
                label={t("records.category")}
                placeholder={t("records.categoryPlaceholder")}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || "open")}
                data={[
                  { value: "open", label: t("records.categories.open") },
                  { value: "junior", label: t("records.categories.junior") },
                  { value: "master", label: t("records.categories.master") },
                ]}
              />
              <Select
                label={t("records.weightClass")}
                placeholder={t("records.weightClassPlaceholder")}
                value={selectedWeightClass}
                onChange={(value) => setSelectedWeightClass(value || "59kg")}
                data={weightClasses.map((wc) => ({ value: wc, label: wc }))}
              />
            </Group>

            <Table>
              <thead>
                <tr>
                  <th>{t("records.lift")}</th>
                  <th>{t("records.weight")}</th>
                  <th>{t("records.holder")}</th>
                  <th>{t("records.date")}</th>
                  <th>{t("records.competition")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  mockRecords[selectedCategory as keyof typeof mockRecords][
                    selectedWeightClass as keyof typeof mockRecords["open"]
                  ]
                ).map(([lift, record]) => (
                  <tr key={lift}>
                    <td>{t(`records.lifts.${lift}`)}</td>
                    <td>{record.weight}kg</td>
                    <td>{record.holder}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.competition}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack spacing="md">
            <Title order={3}>{t("records.about")}</Title>
            <Text>{t("records.description")}</Text>
            <Text size="sm" color="dimmed">
              {t("records.lastUpdated")}: {new Date().toLocaleDateString()}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 