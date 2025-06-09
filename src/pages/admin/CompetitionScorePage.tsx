import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Tabs,
  Paper,
  Stack,
  Group,
  Button,
  Text,
  Badge,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { WeighInForm } from "@/components/competitions/scoring/WeighInForm";
import { ScoringForm } from "@/components/competitions/scoring/ScoringForm";
import { Nomination, Result, Flight } from "@/types";
import { resultService } from "@/services/resultService";
import { getFlightsByCompetition, recalculateFlightStatus } from "@/services/flightService";

type ScoringPhase = "weighIn" | "squat" | "bench" | "deadlift";

export default function CompetitionScorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: competitionId, flightId } = useParams<{ id: string; flightId: string }>();
  const [activePhase, setActivePhase] = useState<ScoringPhase>("weighIn");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch flights to get the current flight and its groups
  const {
    data: flights,
    loading: loadingFlights,
    error: flightsError,
    refetch: refetchFlights,
  } = useDataFetching<Flight[]>({
    fetchFunction: async () => {
      if (!competitionId) {
        return { success: true, data: [] };
      }
      return getFlightsByCompetition(competitionId);
    },
    dependencies: [competitionId],
  });

  const currentFlight = flights?.find(f => f._id === flightId);
  const groups = currentFlight?.groups || [];

  // Get nominations for the selected group from the flight's groups
  const currentGroupNominations = useMemo(() => {
    if (!selectedGroup || !currentFlight?.groups) return [];
    const selectedGroupData = currentFlight.groups.find(g => g._id === selectedGroup);
    return selectedGroupData?.nominations || [];
  }, [selectedGroup, currentFlight?.groups]);

  // Fetch results for the selected group
  const {
    data: results,
    loading: loadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useDataFetching<Result[]>({
    fetchFunction: async () => {
      if (!competitionId || !selectedGroup || !currentGroupNominations.length) {
        return { success: true, data: [] };
      }
      const athleteIds = currentGroupNominations
        .map(n => typeof n.athleteId === 'object' ? n.athleteId._id : n.athleteId)
        .filter(Boolean);

      if (athleteIds.length === 0) {
        console.log('No athlete IDs found for group:', selectedGroup, 'Nominations:', currentGroupNominations);
        return { success: true, data: [] };
      }

      return resultService.getResultsByCompetitionAndAthletes(competitionId, athleteIds);
    },
    dependencies: [competitionId, selectedGroup, currentGroupNominations],
    skip: !selectedGroup || !currentGroupNominations.length,
  });

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  const handleFlightChange = (newFlightId: string) => {
    navigate(`/competitions/${competitionId}/scores/${newFlightId}`);
    setSelectedGroup(null);
  };

  const handleWeighInSubmit = async (data: {
    athleteId: string;
    nominationId: string;
    bodyweight: number;
    lotNumber: number;
    startWeights: {
      squat: number;
      bench: number;
      deadlift: number;
    };
    ageCategory: string;
    weightCategory: string;
  }) => {
    try {
      if (!competitionId || !flightId || !selectedGroup) {
        throw new Error("Missing required competition data");
      }

      const requestData = {
        ...data,
        competitionId,
        flightId,
        groupId: selectedGroup,
      };

      console.log("Sending request data:", requestData);

      await resultService.saveWeighIn(requestData);
      notifications.show({
        title: t("common.success"),
        message: t("competition.weighInSaved"),
        color: "green",
      });
      refetchResults();
    } catch (error) {
      console.error("Error saving weigh-in:", error);
      notifications.show({
        title: t("common.error"),
        message: t("competition.errorSavingWeighIn"),
        color: "red",
      });
    }
  };

  const handleAttemptSubmit = async (data: {
    athleteId: string;
    attemptNumber: number;
    weight: number;
    status: "good" | "noGood" | "pending";
  }) => {
    try {
      if (!competitionId || !flightId || !selectedGroup) {
        throw new Error("Missing required competition data");
      }

      if (activePhase === "weighIn") {
        throw new Error("Cannot save attempt during weigh-in phase");
      }

      await resultService.saveAttempt({
        ...data,
        competitionId,
        liftType: activePhase as "squat" | "bench" | "deadlift",
        flightId,
        groupId: selectedGroup,
      });
      notifications.show({
        title: t("common.success"),
        message: t("competition.attemptSaved"),
        color: "green",
      });
      refetchResults();
    } catch (error) {
      notifications.show({
        title: t("common.error"),
        message: t("competition.errorSavingAttempt"),
        color: "red",
      });
    }
  };

  // Add status recalculation
  const handleRecalculateStatus = async () => {
    try {
      if (!flightId) return;
      
      const response = await recalculateFlightStatus(flightId);
      if (response.success) {
        notifications.show({
          title: t("common.success"),
          message: t("competition.statusRecalculated"),
          color: "green",
        });
        refetchFlights();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error recalculating status:", error);
      notifications.show({
        title: t("common.error"),
        message: t("competition.errorRecalculatingStatus"),
        color: "red",
      });
    }
  };

  if (flightsError || resultsError) {
    return (
      <Container size="xl">
        <Stack spacing="lg">
          <Title order={2} color="red">
            {flightsError || resultsError}
          </Title>
          <Button onClick={() => {
            refetchFlights();
            refetchResults();
          }}>
            {t("competition.retry")}
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!flightId) {
    return (
      <Container size="xl">
        <Stack spacing="lg">
          <Title order={2} color="red">
            {t("competition.errorLoadingCompetition")}
          </Title>
          <Button onClick={() => navigate(`/competitions/${competitionId}`)}>
            {t("competition.goBack")}
          </Button>
        </Stack>
      </Container>
    );
  }

  // Add debug logs
  console.log('Debug data flow:', {
    selectedGroup,
    currentGroupNominations,
    results,
    groups,
    currentFlight
  });

  return (
    <Container size="xl">
      <Stack spacing="lg" pos="relative">
        <LoadingOverlay visible={loadingFlights || loadingResults} />
        <Group position="apart">
          <Title order={2}>{t("competition.scoring")}</Title>
          {currentFlight && (
            <Group>
              <Badge 
                size="lg" 
                color={
                  currentFlight.status === "completed" ? "green" :
                  currentFlight.status === "inProgress" ? "blue" :
                  "gray"
                }
              >
                {t(`competition.flightStatus.${currentFlight.status}`)}
              </Badge>
              <Tooltip label={t("competition.recalculateStatus")}>
                <ActionIcon 
                  onClick={handleRecalculateStatus}
                  loading={loadingFlights}
                  variant="light"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>

        {/* Group Selection */}
        {currentFlight && (
          <Paper p="md" withBorder>
            <Stack spacing="md">
              <Title order={3}>{t("competition.group")}</Title>
              <Group>
                {groups.map((group) => (
                  <Button
                    key={group._id}
                    variant={selectedGroup === group._id ? "filled" : "outline"}
                    onClick={() => handleGroupSelect(group._id)}
                    loading={loadingResults && selectedGroup === group._id}
                  >
                    {group.name}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Paper>
        )}

        {selectedGroup && currentFlight && (
          <>
            {/* Phase Selection */}
            <Tabs value={activePhase} onTabChange={(value) => setActivePhase(value as ScoringPhase)}>
              <Tabs.List>
                <Tabs.Tab value="weighIn">{t("competition.weighIn")}</Tabs.Tab>
                <Tabs.Tab value="squat">{t("results.squat")}</Tabs.Tab>
                <Tabs.Tab value="bench">{t("results.bench")}</Tabs.Tab>
                <Tabs.Tab value="deadlift">{t("results.deadlift")}</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="weighIn">
                <Paper p="md" withBorder mt="md">
                  <WeighInForm
                    key={`weigh-in-${selectedGroup}`}
                    nominations={currentGroupNominations}
                    competitionId={competitionId!}
                    results={results || []}
                    onSubmit={handleWeighInSubmit}
                  />
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="squat">
                <Paper p="md" withBorder mt="md">
                  <ScoringForm
                    key={`squat-${selectedGroup}`}
                    nominations={currentGroupNominations}
                    competitionId={competitionId!}
                    liftType="squat"
                    results={results || []}
                    onSubmit={handleAttemptSubmit}
                  />
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="bench">
                <Paper p="md" withBorder mt="md">
                  <ScoringForm
                    key={`bench-${selectedGroup}`}
                    nominations={currentGroupNominations}
                    competitionId={competitionId!}
                    liftType="bench"
                    results={results || []}
                    onSubmit={handleAttemptSubmit}
                  />
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="deadlift">
                <Paper p="md" withBorder mt="md">
                  <ScoringForm
                    key={`deadlift-${selectedGroup}`}
                    nominations={currentGroupNominations}
                    competitionId={competitionId!}
                    liftType="deadlift"
                    results={results || []}
                    onSubmit={handleAttemptSubmit}
                  />
                </Paper>
              </Tabs.Panel>
            </Tabs>

            {/* Current Status */}
            <Paper p="md" withBorder>
              <Stack spacing="xs">
                <Title order={3}>{t("competition.currentStatus")}</Title>
                <Group>
                  <Badge size="lg">
                    {t("competition.flight")} {currentFlight.number}
                  </Badge>
                  <Badge size="lg">
                    {t("competition.group")} {groups.find(g => g._id === selectedGroup)?.name}
                  </Badge>
                  <Badge size="lg" color="blue">
                    {t(`competition.phase.${activePhase}`)}
                  </Badge>
                  <Badge size="lg">
                    {t("competition.athletesCount", {
                      count: currentGroupNominations.length,
                    })}
                  </Badge>
                </Group>
                {/* Weight Categories */}
                <Stack spacing="xs" mt="md">
                  <Text size="sm" fw={500}>{t("competition.weightCategories")}</Text>
                  <Group>
                    {Array.from(new Set(
                      currentGroupNominations.map(n => n.weightCategory)
                    )).sort().map(category => (
                      <Badge key={category} variant="light" color="gray">
                        {t(`weightCategories.${category}`)}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
}
