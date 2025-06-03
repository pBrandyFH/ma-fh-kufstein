import { Competition } from "@/types";
import { Stack, Text, Group, Paper, Title, Badge } from "@mantine/core";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface InfoTabProps {
  competition: Competition;
}

export default function InfoTab({ competition }: InfoTabProps) {
  const { t } = useTranslation();
  return (
    <Stack spacing="lg">
      {/* Basic Information */}
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          {t("competitions.basicInfo")}
        </Title>
        <Stack spacing="xs">
          <Group>
            <Text weight={500}>{t("competitions.type")}:</Text>
            <Text>
              {t(`competitions.equipmentType.${competition.equipmentType}`)}
            </Text>
          </Group>
          <Group>
            <Text weight={500}>{t("competitions.dates")}:</Text>
            <Text>
              {format(new Date(competition.startDate), "PPP")}
              {competition.endDate &&
                ` - ${format(new Date(competition.endDate), "PPP")}`}
            </Text>
          </Group>
        </Stack>
      </Paper>

      {/* Location Information */}
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          {t("competitions.locationInfo")}
        </Title>
        <Stack spacing="xs">
          <Group>
            <Text weight={500}>{t("competitions.location")}:</Text>
            <Text>{competition.location}</Text>
          </Group>
          {competition.address && (
            <Group>
              <Text weight={500}>{t("competitions.address")}:</Text>
              <Text>{competition.address}</Text>
            </Group>
          )}
          <Group>
            <Text weight={500}>{t("competitions.city")}:</Text>
            <Text>{competition.city}</Text>
          </Group>
          <Group>
            <Text weight={500}>{t("competitions.country")}:</Text>
            <Text>{competition.country}</Text>
          </Group>
        </Stack>
      </Paper>

      {/* Competition Details */}
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          {t("competitions.details")}
        </Title>
        <Stack spacing="xs">
          <Group>
            <Text weight={500}>{t("competitions.hostFederation")}:</Text>
            <Text>
              {typeof competition.hostFederation === "string"
                ? competition.hostFederation
                : competition.hostFederation.name}
            </Text>
          </Group>
          {competition.hostMember && (
            <Group>
              <Text weight={500}>{t("competitions.hostMember")}:</Text>
              <Text>
                {typeof competition.hostMember === "string"
                  ? competition.hostMember
                  : competition.hostMember.name}
              </Text>
            </Group>
          )}
          <Group>
            <Text weight={500}>{t("competitions.ageCategory")}:</Text>
            <Group>
              {competition.ageCategories.map((category) => (
                <Badge key={category}>
                  {t(`competitions.ageCategories.${category}`)}
                </Badge>
              ))}
            </Group>
          </Group>
          {competition.description && (
            <Group>
              <Text weight={500}>{t("competitions.description")}:</Text>
              <Text>{competition.description}</Text>
            </Group>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
