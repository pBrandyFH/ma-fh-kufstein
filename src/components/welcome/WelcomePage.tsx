import { Container, Title, Text, Button, Group, Stack, SimpleGrid, Card, Image, rem } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Trophy, BarChart, Medal, Users } from "lucide-react"
import { TopNav } from "../common/TopNav"

export function WelcomePage() {
  const { t } = useTranslation()

  return (
    <>
      <TopNav />
      <Container size="100%" px="md" py={rem(40)}>
        {/* Hero Section */}
        <Stack spacing="xl" align="center" py={rem(60)}>
          <Title order={1} size="h1" fw={900} ta="center" sx={{ fontSize: rem(48), color: "white" }}>
            {t("welcome.title")}
          </Title>
          <Text size="xl" ta="center" maw={600} c="white" opacity={0.8}>
            {t("welcome.subtitle")}
          </Text>
          <Group>
            <Button size="lg" component={Link} to="/results">
              {t("welcome.viewResults")}
            </Button>
            <Button size="lg" variant="light" component={Link} to="/login">
              {t("welcome.signIn")}
            </Button>
          </Group>
        </Stack>

        {/* Features Grid */}
        <Container size="lg">
          <SimpleGrid cols={4} spacing="xl" py={rem(40)} breakpoints={[
            { maxWidth: 'sm', cols: 1 },
            { maxWidth: 'lg', cols: 2 }
          ]}>
            <Card withBorder p="xl" radius="md" sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
              <Trophy size="40" color="white" />
              <Text size="lg" fw={500} mt="md" c="white">
                {t("welcome.competitions")}
              </Text>
              <Text size="sm" c="white" opacity={0.8} mt="sm">
                {t("welcome.competitionsDesc")}
              </Text>
            </Card>

            <Card withBorder p="xl" radius="md" sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
              <BarChart size="40" color="white" />
              <Text size="lg" fw={500} mt="md" c="white">
                {t("welcome.rankings")}
              </Text>
              <Text size="sm" c="white" opacity={0.8} mt="sm">
                {t("welcome.rankingsDesc")}
              </Text>
            </Card>

            <Card withBorder p="xl" radius="md" sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
              <Medal size="40" color="white" />
              <Text size="lg" fw={500} mt="md" c="white">
                {t("welcome.records")}
              </Text>
              <Text size="sm" c="white" opacity={0.8} mt="sm">
                {t("welcome.recordsDesc")}
              </Text>
            </Card>

            <Card withBorder p="xl" radius="md" sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
              <Users size="40" color="white" />
              <Text size="lg" fw={500} mt="md" c="white">
                {t("welcome.community")}
              </Text>
              <Text size="sm" c="white" opacity={0.8} mt="sm">
                {t("welcome.communityDesc")}
              </Text>
            </Card>
          </SimpleGrid>
        </Container>
      </Container>
    </>
  )
} 