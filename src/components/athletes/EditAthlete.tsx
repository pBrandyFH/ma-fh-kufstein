import { Container, Title, Stack, Group, Button, TextInput, Select, Textarea, Grid, NumberInput } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

// TODO: Replace with actual data from API
const mockAthlete = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+491234567890",
  dateOfBirth: "1990-01-01",
  federation: "German Powerlifting Federation",
  club: "Power Gym Berlin",
  category: "open",
  weightClass: "93kg",
  status: "active",
  notes: "Experienced powerlifter with multiple national records",
  weight: 92.5,
  height: 180,
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

export function EditAthlete() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState(mockAthlete)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: Implement API call to update athlete
    console.log("Updating athlete:", formData)
    navigate("/athletes")
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
            onClick={() => navigate("/athletes")}
          >
            {t("common.back")}
          </Button>
          <Title order={1}>{t("athletes.edit")}</Title>
        </Group>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.name")}
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.currentTarget.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.email")}
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.currentTarget.value)}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.phone")}
                  value={formData.phone}
                  onChange={(event) => handleChange("phone", event.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.dateOfBirth")}
                  value={formData.dateOfBirth}
                  onChange={(event) => handleChange("dateOfBirth", event.currentTarget.value)}
                  type="date"
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.federation")}
                  value={formData.federation}
                  onChange={(event) => handleChange("federation", event.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t("athletes.club")}
                  value={formData.club}
                  onChange={(event) => handleChange("club", event.currentTarget.value)}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <Select
                  label={t("athletes.category")}
                  value={formData.category}
                  onChange={(value) => handleChange("category", value)}
                  data={[
                    { value: "open", label: t("athletes.categories.open") },
                    { value: "junior", label: t("athletes.categories.junior") },
                    { value: "master", label: t("athletes.categories.master") },
                  ]}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label={t("athletes.weightClass")}
                  value={formData.weightClass}
                  onChange={(value) => handleChange("weightClass", value)}
                  data={weightClasses.map((wc) => ({ value: wc, label: wc }))}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label={t("athletes.status")}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  data={[
                    { value: "active", label: t("athletes.status.active") },
                    { value: "inactive", label: t("athletes.status.inactive") },
                    { value: "pending", label: t("athletes.status.pending") },
                  ]}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label={t("athletes.weight")}
                  value={formData.weight}
                  onChange={(value) => handleChange("weight", value)}
                  min={0}
                  precision={1}
                  rightSection="kg"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label={t("athletes.height")}
                  value={formData.height}
                  onChange={(value) => handleChange("height", value)}
                  min={0}
                  rightSection="cm"
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label={t("athletes.notes")}
              value={formData.notes}
              onChange={(event) => handleChange("notes", event.currentTarget.value)}
              minRows={3}
            />

            <Group position="right" mt="xl">
              <Button
                variant="subtle"
                onClick={() => navigate("/athletes")}
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