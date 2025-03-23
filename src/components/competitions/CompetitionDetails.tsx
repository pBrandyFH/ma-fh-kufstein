import { Container, Title, Stack, Group, Button, Text, Card, Grid, Badge, Divider, Table, Tabs } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { Edit, ArrowLeft, Users, Calendar, MapPin, Building } from "lucide-react"

// TODO: Replace with actual data from API
const mockCompetition = {
  id: "1",
  name: "German Nationals 2024",
  date: "2024-06-15",
  location: "Berlin, Germany",
  type: "national",
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
  participants: [
    {
      id: "1",
      name: "John Doe",
      category: "open",
      weightClass: "93kg",
      club: "Power Gym Berlin",
      registrationDate: "2024-03-01",
    },
    {
      id: "2",
      name: "Jane Smith",
      category: "junior",
      weightClass: "66kg",
      club: "Power Gym Munich",
      registrationDate: "2024-03-05",
    },
  ],
}

export function CompetitionDetails() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group>
          <Button
            variant="subtle"
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate("/competitions")}
          >
            {t("common.back")}
          </Button>
          <Title order={1}>{mockCompetition.name}</Title>
          <Badge
            color={
              mockCompetition.status === "upcoming"
                ? "blue"
                : mockCompetition.status === "registration"
                ? "green"
                : "gray"
            }
          >
            {t(`competitions.status.${mockCompetition.status}`)}
          </Badge>
        </Group>

        <Grid>
          <Grid.Col span={8}>
            <Card withBorder>
              <Stack spacing="md">
                <Group position="apart">
                  <Text size="lg" weight={500}>{t("competitions.details")}</Text>
                  <Button
                    leftIcon={<Edit size={20} />}
                    onClick={() => navigate(`/competitions/${id}/edit`)}
                  >
                    {t("common.edit")}
                  </Button>
                </Group>
                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <Group>
                      <Calendar size={20} />
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">{t("competitions.date")}</Text>
                        <Text>{mockCompetition.date}</Text>
                      </Stack>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group>
                      <MapPin size={20} />
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">{t("competitions.location")}</Text>
                        <Text>{mockCompetition.location}</Text>
                      </Stack>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group>
                      <Building size={20} />
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">{t("competitions.organizer")}</Text>
                        <Text>{mockCompetition.organizer}</Text>
                      </Stack>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group>
                      <Users size={20} />
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">{t("competitions.participants")}</Text>
                        <Text>{mockCompetition.totalParticipants}</Text>
                      </Stack>
                    </Group>
                  </Grid.Col>
                </Grid>

                <Text size="sm" color="dimmed">{t("competitions.description")}</Text>
                <Text>{mockCompetition.description}</Text>

                <Text size="sm" color="dimmed">{t("competitions.rules")}</Text>
                <Stack spacing="xs">
                  {mockCompetition.rules.map((rule, index) => (
                    <Text key={index}>• {rule}</Text>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card withBorder>
              <Stack spacing="md">
                <Text size="lg" weight={500}>{t("competitions.schedule")}</Text>
                <Divider />
                <Stack spacing="xs">
                  {mockCompetition.schedule.map((item, index) => (
                    <Group key={index} position="apart">
                      <Text size="sm" weight={500}>{item.time}</Text>
                      <Text size="sm">{item.event}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder>
          <Stack spacing="md">
            <Text size="lg" weight={500}>{t("competitions.participants")}</Text>
            <Divider />
            <Table>
              <thead>
                <tr>
                  <th>{t("athletes.name")}</th>
                  <th>{t("athletes.category")}</th>
                  <th>{t("athletes.weightClass")}</th>
                  <th>{t("athletes.club")}</th>
                  <th>{t("competitions.registrationDate")}</th>
                </tr>
              </thead>
              <tbody>
                {mockCompetition.participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.name}</td>
                    <td>
                      <Badge variant="light">
                        {t(`athletes.categories.${participant.category}`)}
                      </Badge>
                    </td>
                    <td>{participant.weightClass}</td>
                    <td>{participant.club}</td>
                    <td>{participant.registrationDate}</td>
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