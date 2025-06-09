import { Page } from "@/components/common/Page";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getFlightsByCompetition } from "@/services/flightService";
import { updateCompetitionStatus } from "@/services/competitionService";
import { Flight } from "@/types";
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  LoadingOverlay,
  Badge,
  Modal,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function CompetitionScoreSelectFlightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: competitionId } = useParams();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const {
    data: flights,
    loading: flightsLoading,
    error: flightsError,
    refetch: refetchFlights,
  } = useDataFetching<Flight[]>({
    fetchFunction: () => getFlightsByCompetition(competitionId ?? ""),
    skip: !competitionId,
  });

  const allFlightsCompleted = flights?.every(
    (flight) => flight.status === "completed"
  );

  const handleCompleteCompetition = async () => {
    if (!competitionId) return;

    try {
      const response = await updateCompetitionStatus(
        competitionId,
        "completed"
      );
      if (response.success) {
        notifications.show({
          title: t("common.success"),
          message: t("competition.completed"),
          color: "green",
        });
        navigate(`/competitions/${competitionId}`);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error completing competition:", error);
      notifications.show({
        title: t("common.error"),
        message: t("competition.errorCompleting"),
        color: "red",
      });
    }
  };

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
          <>
            {flights?.map((flight) => (
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
                    <Badge
                      size="lg"
                      color={
                        flight.status === "completed"
                          ? "green"
                          : flight.status === "inProgress"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {t(`competition.flightStatus.${flight.status}`)}
                    </Badge>
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
            ))}

            {allFlightsCompleted && (
              <Box>
                <Button
                  color="green"
                  size="md"
                  onClick={() => setCompleteModalOpen(true)}
                  mt="xl"
                >
                  {t("competition.completeCompetition")}
                </Button>
              </Box>
            )}
          </>
        )}
      </Stack>

      <Modal
        opened={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={t("competition.completeCompetition")}
      >
        <Stack>
          <Text>{t("competition.completeCompetitionConfirm")}</Text>
          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setCompleteModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button color="green" onClick={handleCompleteCompetition}>
              {t("common.confirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Page>
  );
}
