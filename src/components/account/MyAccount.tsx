import { Container, Title, Stack, Group, Button, TextInput, Select, Textarea, Grid, NumberInput, Card, Text, Badge, Divider } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Edit, Save, X } from "lucide-react"

// TODO: Replace with actual data from API
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+491234567890",
  role: "admin",
  federation: "German Powerlifting Federation",
  club: "Power Gym Berlin",
  notes: "Experienced powerlifter and coach",
  createdAt: "2024-01-01",
  lastLogin: "2024-03-15",
}

export function MyAccount() {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(mockUser)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: Implement API call to update user
    console.log("Updating user:", formData)
    setIsEditing(false)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData(mockUser)
    setIsEditing(false)
  }

  return (
    <Container size="md">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={1}>{t("account.title")}</Title>
          {!isEditing && (
            <Button
              leftIcon={<Edit size={20} />}
              onClick={() => setIsEditing(true)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Group>

        <Card withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Text size="lg" weight={500}>{t("account.personalInfo")}</Text>
              <Badge>{t(`account.roles.${formData.role}`)}</Badge>
            </Group>
            <Divider />

            <form onSubmit={handleSubmit}>
              <Stack spacing="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.name")}
                      value={formData.name}
                      onChange={(event) => handleChange("name", event.currentTarget.value)}
                      required
                      disabled={!isEditing}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.email")}
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.currentTarget.value)}
                      required
                      disabled={!isEditing}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.phone")}
                      value={formData.phone}
                      onChange={(event) => handleChange("phone", event.currentTarget.value)}
                      disabled={!isEditing}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.federation")}
                      value={formData.federation}
                      onChange={(event) => handleChange("federation", event.currentTarget.value)}
                      disabled={!isEditing}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.club")}
                      value={formData.club}
                      onChange={(event) => handleChange("club", event.currentTarget.value)}
                      disabled={!isEditing}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label={t("account.createdAt")}
                      value={formData.createdAt}
                      disabled
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label={t("account.lastLogin")}
                  value={formData.lastLogin}
                  disabled
                />

                <Textarea
                  label={t("account.notes")}
                  value={formData.notes}
                  onChange={(event) => handleChange("notes", event.currentTarget.value)}
                  minRows={3}
                  disabled={!isEditing}
                />

                {isEditing && (
                  <Group position="right" mt="xl">
                    <Button
                      variant="subtle"
                      leftIcon={<X size={20} />}
                      onClick={handleCancel}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      leftIcon={<Save size={20} />}
                    >
                      {t("common.save")}
                    </Button>
                  </Group>
                )}
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
} 