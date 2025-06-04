import { Competition } from "@/types";
import { Stack, Text, Group, Paper, Title, Badge } from "@mantine/core";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import CompetitionNominationsList from "../../nominations/CompetitionNominationsList";

interface NominationTabProps {
  competition: Competition;
}

export default function NominationTab({ competition }: NominationTabProps) {
  const { t } = useTranslation();
  return (
    <Stack spacing="lg">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          {t("competitions.nominationInfo")}
        </Title>
        <Stack spacing="xs">
          <Group>
            <Text weight={500}>{t("competitions.nominationStart")}:</Text>
            <Text>{format(new Date(competition.nominationStart), "PPP")}</Text>
          </Group>
          <Group>
            <Text weight={500}>{t("competitions.nominationDeadline")}:</Text>
            <Text>
              {format(new Date(competition.nominationDeadline), "PPP")}
            </Text>
          </Group>
          <Group>
            <Text weight={500}>{t("competitions.eligibleFederations")}:</Text>
            <Group>
              {competition.eligibleFederations.map((federation) => (
                <Badge
                  key={
                    typeof federation === "string" ? federation : federation._id
                  }
                >
                  {typeof federation === "string"
                    ? federation
                    : federation.name}
                </Badge>
              ))}
            </Group>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <CompetitionNominationsList competition={competition} />
      </Paper>
    </Stack>
  );
}
