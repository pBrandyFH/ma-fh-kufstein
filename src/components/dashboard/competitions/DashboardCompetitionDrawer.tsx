import { Drawer, Stack, Text } from "@mantine/core";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { getCompetitionType } from "@/utils/competitions/competitionUtils";
import { Competition, Federation } from "@/types";

interface DashboardCompetitionDrawerProps {
  opened: boolean;
  onClose: () => void;
  competition: Competition | null;
  federations: Federation[];
}

export const DashboardCompetitionDrawer = ({
  opened,
  onClose,
  competition,
  federations,
}: DashboardCompetitionDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={competition ? competition.name : ""}
      padding="xl"
      size="60rem"
      position="right"
      overlayProps={{ blur: 4 }}
    >
      {competition && (
        <Stack>
          <Text size="lg" weight={500}>
            {t("competitions.details")}
          </Text>
          <Text>
            {t("competitions.type")}:{" "}
            {getCompetitionType(competition, federations)}
          </Text>
          <Text>
            {t("competitions.dates")}:{" "}
            {format(new Date(competition.startDate), "PPP")}
            {competition.endDate &&
              ` - ${format(new Date(competition.endDate), "PPP")}`}
          </Text>
          <Text>
            {t("competitions.location")}: {competition.location}
          </Text>
          <Text>
            {t("competitions.status")}:{" "}
            {t(`competitions.status.${competition.status}`)}
          </Text>
          {/* Add any other relevant information here */}
        </Stack>
      )}
    </Drawer>
  );
};
