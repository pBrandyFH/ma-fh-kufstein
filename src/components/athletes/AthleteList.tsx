import { Athlete } from "@/types";
import { useTranslation } from "react-i18next";
import {
  Table,
  Text,
  Group,
  Badge,
  Stack,
  Title,
  Paper,
  Skeleton,
} from "@mantine/core";
import { format } from "date-fns";

interface AthleteListProps {
  athletes: Athlete[];
  loading?: boolean;
}

export default function AthleteList({ athletes, loading = false }: AthleteListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Stack spacing="sm">
        {[1, 2, 3].map((i) => (
          <Paper key={i} p="md" withBorder>
            <Group position="apart">
              <Stack spacing="xs">
                <Skeleton height={24} width={200} />
                <Skeleton height={20} width={150} />
              </Stack>
              <Group>
                <Skeleton height={24} width={100} />
                <Skeleton height={24} width={80} />
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    );
  }

  if (athletes.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Text align="center" c="dimmed">
          {t("athletes.noAthletes")}
        </Text>
      </Paper>
    );
  }

  const getMemberName = (athlete: Athlete): string => {
    if (!athlete.member) return t("athletes.noMember");
    if (typeof athlete.member === "string") return athlete.member;
    return athlete.member.name || t("athletes.unknownMember");
  };

  return (
    <Stack spacing="sm">
      {athletes.map((athlete) => (
        <Paper key={athlete._id} p="md" withBorder>
          <Group position="apart" align="flex-start">
            <Stack spacing="xs">
              <Group spacing="xs">
                <Title order={4}>
                  {athlete.firstName} {athlete.lastName}
                </Title>
                <Badge
                  color={athlete.gender === "male" ? "blue" : "pink"}
                  variant="light"
                >
                  {t(`athletes.${athlete.gender}`)}
                </Badge>
                {athlete.isNationalTeam && (
                  <Badge color="yellow" variant="light">
                    {t("athletes.nationalTeam")}
                  </Badge>
                )}
              </Group>
              <Group spacing="xs">
                <Text size="sm" c="dimmed">
                  {t("athletes.weightCategory")}:
                </Text>
                <Badge variant="outline">
                  {t(`athletes.weightCategories.${athlete.gender}.${athlete.weightCategory}`)}
                </Badge>
              </Group>
              <Group spacing="xs">
                <Text size="sm" c="dimmed">
                  {t("athletes.member")}:
                </Text>
                <Text size="sm">
                  {getMemberName(athlete)}
                </Text>
              </Group>
            </Stack>
            <Stack align="flex-end" spacing="xs">
              <Text size="sm" c="dimmed">
                {t("athletes.dateOfBirth")}:
              </Text>
              <Text size="sm">
                {format(new Date(athlete.dateOfBirth), "dd.MM.yyyy")}
              </Text>
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
