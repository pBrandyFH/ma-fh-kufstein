import { Page } from "@/components/common/Page";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getFlightsByCompetition } from "@/services/flightService";
import { Flight } from "@/types";
import { Box, Button, Card, Group, Stack, Text, LoadingOverlay } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export default function CompetitionScoreSelectFlightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: competitionId } = useParams();

  const {
    data: flights,
    loading: flightsLoading,
    error: flightsError,
  } = useDataFetching<Flight[]>({
    fetchFunction: () => getFlightsByCompetition(competitionId ?? ""),
    skip: !competitionId,
  });

  return (
    <Page
      title={t("competition.selectFlight")}
      backButton
      backUrl={`/competitions/${competitionId}`}
    >
      <Stack pos="relative">
        <LoadingOverlay visible={flightsLoading} />
        {flightsError ? (
          <Text color="red">{flightsError}</Text>
        ) : (
          flights?.map((flight) => (
            <Card withBorder key={flight._id}>
              <Group position="apart">
                <Stack spacing="xs">
                  <Text>
                    {t("competition.flightNumber", {
                      flightNumber: flight.number,
                    })}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("competition.athletesCount", {
                      count: flight.groups.reduce(
                        (total, group) => total + group.nominations.length,
                        0
                      ),
                    })}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("competition.status")}: {t(`competition.flightStatus.${flight.status}`)}
                  </Text>
                </Stack>
                <Button
                  onClick={() =>
                    navigate(
                      `/competitions/${competitionId}/scores/${flight._id}`
                    )
                  }
                >
                  {t("competition.selectFlight")}
                </Button>
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Page>
  );
}
