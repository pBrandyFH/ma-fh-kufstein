import { Container, Title, Stack, Group, Button, TextInput, Select, Textarea, Grid, NumberInput, MultiSelect } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

// TODO: Replace with actual data from API
const mockCompetition = {
  id: "1",
  name: "German Nationals 2024",
  date: "2024-06-15",
  location: "Berlin, Germany",
  type: "NATIONAL",
  status: "upcoming",
  registrationDeadline: "2024-05-15",
  organizer: "German Powerlifting Federation",
  totalParticipants: 45,
  categories: ["open", "junior", "master"],
  description: "The German National Powerlifting Championship is the premier event for powerlifters in Germany. This year's competition will be held at the Berlin Sports Complex, featuring state-of-the-art equipment and professional judging.",
  schedule: [
    { time: "08:00", event: "Registration and Weigh-in" },
    { time: "10:00", event: "Opening Ceremony" },
    { time: "11:00", event: "Competition Start" },
    { time: "18:00", event: "Awards Ceremony" },
  ],
  rules: [
    "All lifters must be registered members of the German Powerlifting Federation",
    "Equipment must meet IPF standards",
    "Three attempts per lift",
    "Two-hour weigh-in window before competition",
  ],
}

export function EditCompetition() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState(mockCompetition)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: Implement API call to update competition
    console.log("Updating competition:", formData)
    navigate("/competitions")
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Container size="md">
      <Stack spacing="xl">
        <Group>
          <Button
            variant="subtle"
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate("/competitions")}
          >
            {t("common.back")}
          </Button>
          <Title order={1}>{t("competitions.edit")}</Title>
        </Group>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("competitions.name")}
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.currentTarget.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t("competitions.location")}
                  value={formData.location}
                  onChange={(event) => handleChange("location", event.currentTarget.value)}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("competitions.date")}
                  value={formData.date}
                  onChange={(event) => handleChange("date", event.currentTarget.value)}
                  type="date"
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t("competitions.registrationDeadline")}
                  value={formData.registrationDeadline}
                  onChange={(event) => handleChange("registrationDeadline", event.currentTarget.value)}
                  type="date"
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("competitions.organizer")}
                  value={formData.organizer}
                  onChange={(event) => handleChange("organizer", event.currentTarget.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t("competitions.type")}
                  value={formData.type}
                  onChange={(value) => handleChange("type", value)}
                  data={[
                    { value: "NATIONAL", label: t("competitions.types.NATIONAL") },
                    { value: "regional", label: t("competitions.types.regional") },
                    { value: "local", label: t("competitions.types.local") },
                  ]}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t("competitions.status")}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  data={[
                    { value: "upcoming", label: t("competitions.status.upcoming") },
                    { value: "registration", label: t("competitions.status.registration") },
                    { value: "completed", label: t("competitions.status.completed") },
                  ]}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={t("competitions.categories")}
                  value={formData.categories}
                  onChange={(value) => handleChange("categories", value)}
                  data={[
                    { value: "open", label: t("athletes.categories.open") },
                    { value: "junior", label: t("athletes.categories.junior") },
                    { value: "master", label: t("athletes.categories.master") },
                  ]}
                  required
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label={t("competitions.description")}
              value={formData.description}
              onChange={(event) => handleChange("description", event.currentTarget.value)}
              minRows={3}
            />

            <Textarea
              label={t("competitions.rules")}
              value={formData.rules.join("\n")}
              onChange={(event) => handleChange("rules", event.currentTarget.value.split("\n"))}
              minRows={5}
            />

            <Group position="right" mt="xl">
              <Button
                variant="subtle"
                onClick={() => navigate("/competitions")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {t("common.save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
} 