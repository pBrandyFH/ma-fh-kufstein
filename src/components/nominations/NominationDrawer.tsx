import {
  AgeCategory,
  Competition,
  WeightCategory,
  Athlete,
  Nomination,
} from "@/types";
import {
  Drawer,
  Stack,
  Text,
  Group,
  Paper,
  Title,
  Button,
  Select,
  LoadingOverlay,
  Card,
  Box,
  ActionIcon,
  Badge,
  Modal,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getAthletesByFederation } from "@/services/athleteService";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  createNomination,
  batchCreateNominations,
  getNominationsByCompetitionId,
  deleteNomination,
} from "@/services/nominationService";
import { IconCheck, IconX } from "@tabler/icons-react";
import { getWeightCategoryOptionsByGender } from "@/utils/weightCategories";

interface NominationDrawerProps {
  opened: boolean;
  onClose: () => void;
  competition: Competition | null;
  onNominationsChange?: () => void;
}

// Local state type for UI management
type UINominationState = "none" | "pending" | "nominated" | "pendingUnnominate";

interface AthleteNominationState {
  athleteId: string;
  status: UINominationState;
  weightCategory: WeightCategory | null;
  ageCategory: AgeCategory | null;
}

export default function NominationDrawer({
  opened,
  onClose,
  competition,
  onNominationsChange,
}: NominationDrawerProps) {
  const { t } = useTranslation();
  const { federation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [athleteStates, setAthleteStates] = useState<
    Record<string, AthleteNominationState>
  >({});
  const [existingNominations, setExistingNominations] = useState<Nomination[]>(
    []
  );

  const {
    data: athletesData,
    loading: athletesLoading,
    error: athletesError,
  } = useDataFetching<Athlete[]>({
    fetchFunction: () => getAthletesByFederation(federation?._id || ""),
    skip: !federation?._id,
  });

  const { data: nominationsData, loading: nominationsLoading } =
    useDataFetching<Nomination[]>({
      fetchFunction: () =>
        getNominationsByCompetitionId(competition?._id || ""),
      skip: !competition?._id,
    });

  useEffect(() => {
    if (nominationsData) {
      setExistingNominations(nominationsData);
    }
  }, [nominationsData]);

  useEffect(() => {
    if (athletesData) {
      setAthletes(athletesData);
      // Initialize athlete states
      const initialStates: Record<string, AthleteNominationState> = {};
      athletesData.forEach((athlete) => {
        // Check if athlete is already nominated using existingNominations
        const existingNomination = existingNominations.find((nomination) => {
          const nominationAthleteId =
            typeof nomination.athleteId === "string"
              ? nomination.athleteId
              : nomination.athleteId._id;
          return nominationAthleteId === athlete._id;
        });

        
        initialStates[athlete._id] = {
          athleteId: athlete._id,
          status: existingNomination ? "nominated" : "none",
          weightCategory: existingNomination?.weightCategory || athlete.weightCategory,
          ageCategory: existingNomination?.ageCategory || null,
        };
      });
      setAthleteStates(initialStates);
    }
  }, [athletesData, existingNominations]);

  const handleAthleteStatusChange = (
    athleteId: string,
    newStatus: UINominationState
  ) => {
    setAthleteStates((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status: newStatus,
      },
    }));
  };

  const handleWeightCategoryChange = (
    athleteId: string,
    weightCategory: WeightCategory | null
  ) => {
    setAthleteStates((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        weightCategory,
      },
    }));
  };

  const handleAgeCategoryChange = (
    athleteId: string,
    ageCategory: AgeCategory | null
  ) => {
    setAthleteStates((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        ageCategory,
      },
    }));
  };

  const handleSave = async () => {
    if (!competition) return;

    const nominationsToCreate = Object.values(athleteStates)
      .filter((state) => state.status === "pending")
      .map((state) => ({
        competitionId: competition._id,
        athleteId: state.athleteId,
        weightCategory: state.weightCategory!,
        ageCategory: state.ageCategory!,
        nominatedAt: new Date(),
      }));

    const nominationsToDelete = Object.values(athleteStates)
      .filter((state) => state.status === "pendingUnnominate")
      .map((state) => {
        const existingNomination = existingNominations.find((nomination) => {
          const nominationAthleteId =
            typeof nomination.athleteId === "string"
              ? nomination.athleteId
              : nomination.athleteId._id;
          return nominationAthleteId === state.athleteId;
        });
        return existingNomination?._id;
      })
      .filter((id): id is string => id !== undefined);

    if (nominationsToCreate.length === 0 && nominationsToDelete.length === 0)
      return;

    setLoading(true);
    try {
      // Handle nominations to create
      let createdNominations: Nomination[] = [];
      if (nominationsToCreate.length > 0) {
        const createResponse = await batchCreateNominations(
          nominationsToCreate
        );
        if (!createResponse.success) {
          throw new Error(createResponse.error);
        }
        createdNominations = createResponse.data || [];
      }

      // Handle nominations to delete
      if (nominationsToDelete.length > 0) {
        await Promise.all(nominationsToDelete.map(deleteNomination));
      }

      notifications.show({
        title: t("nominations.success"),
        message: t("nominations.changesSaved"),
        color: "green",
      });

      // Update states after successful operations
      setAthleteStates((prev) => {
        const updated = { ...prev };

        // Update states for newly created nominations
        createdNominations.forEach((nomination) => {
          const athleteId =
            typeof nomination.athleteId === "string"
              ? nomination.athleteId
              : nomination.athleteId._id;

          updated[athleteId] = {
            athleteId,
            status: "nominated",
            weightCategory: nomination.weightCategory,
            ageCategory: nomination.ageCategory,
          };
        });

        // Update states for deleted nominations
        nominationsToDelete.forEach((nominationId) => {
          const nomination = existingNominations.find(
            (n) => n._id === nominationId
          );
          if (nomination) {
            const athleteId =
              typeof nomination.athleteId === "string"
                ? nomination.athleteId
                : nomination.athleteId._id;
            updated[athleteId] = {
              athleteId,
              status: "none",
              weightCategory: null,
              ageCategory: null,
            };
          }
        });

        return updated;
      });

      // Update nominations list with new data
      setExistingNominations((prev) => {
        const withoutDeleted = prev.filter(
          (n) => !nominationsToDelete.includes(n._id)
        );
        return [...withoutDeleted, ...createdNominations];
      });

      // Notify parent component to refetch nominations
      onNominationsChange?.();
    } catch (error) {
      notifications.show({
        title: t("nominations.failed"),
        message:
          error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnnominate = async (nomination: Nomination) => {
    setLoading(true);
    try {
      const response = await deleteNomination(nomination._id);
      if (response.success) {
        notifications.show({
          title: t("nominations.success"),
          message: t("nominations.athleteUnnominated"),
          color: "green",
        });

        // Update the athlete state
        const athleteId =
          typeof nomination.athleteId === "string"
            ? nomination.athleteId
            : nomination.athleteId._id;

        setAthleteStates((prev) => ({
          ...prev,
          [athleteId]: {
            ...prev[athleteId],
            status: "none",
            weightCategory: null,
            ageCategory: null,
          },
        }));

        // Update nominations list by removing the deleted nomination
        setExistingNominations((prev) =>
          prev.filter((n) => {
            const nAthleteId =
              typeof n.athleteId === "string" ? n.athleteId : n.athleteId._id;
            return nAthleteId !== athleteId;
          })
        );

        // Notify parent component to refetch nominations
        onNominationsChange?.();
      } else {
        notifications.show({
          title: t("nominations.failed"),
          message: response.error || t("auth.errorOccurred"),
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: t("nominations.failed"),
        message: t("auth.errorOccurred"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPendingChanges = Object.values(athleteStates).some(
    (state) =>
      state.status === "pending" || state.status === "pendingUnnominate"
  );

  if (!competition) {
    return null;
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t("nominations.nominateAthletes")}
      position="right"
      size="xl"
    >
      <Paper pos="relative">
        <LoadingOverlay
          visible={loading || athletesLoading || nominationsLoading}
        />
        <Stack spacing="sm">
          {athletes.map((athlete) => {
            const state = athleteStates[athlete._id];
            const isPending = state?.status === "pending";
            const isPendingUnnominate = state?.status === "pendingUnnominate";
            const isNominated = state?.status === "nominated";
            const existingNomination = existingNominations.find(
              (nomination) => {
                const nominationAthleteId =
                  typeof nomination.athleteId === "string"
                    ? nomination.athleteId
                    : nomination.athleteId._id;
                return nominationAthleteId === athlete._id;
              }
            );

            const weightCategoryOptions = getWeightCategoryOptionsByGender(
              competition.equipmentType,
              athlete.gender
            );

            return (
              <Card key={athlete._id} withBorder p="sm" radius="md">
                <Group position="apart" align="center" noWrap>
                  <Group spacing="sm" noWrap>
                    <ActionIcon
                      size="md"
                      variant="light"
                      color={
                        isPending
                          ? "yellow"
                          : isPendingUnnominate
                          ? "red"
                          : isNominated
                          ? "green"
                          : "gray"
                      }
                      onClick={() => {
                        if (isNominated) {
                          handleAthleteStatusChange(
                            athlete._id,
                            "pendingUnnominate"
                          );
                        } else if (isPendingUnnominate) {
                          handleAthleteStatusChange(athlete._id, "nominated");
                        } else if (isPending) {
                          handleAthleteStatusChange(athlete._id, "none");
                          handleWeightCategoryChange(athlete._id, null);
                          handleAgeCategoryChange(athlete._id, null);
                        } else {
                          handleAthleteStatusChange(athlete._id, "pending");
                        }
                      }}
                    >
                      {isPending && <IconCheck size={14} />}
                      {isPendingUnnominate && <IconX size={14} />}
                      {isNominated && <IconCheck size={14} />}
                    </ActionIcon>
                    <Box>
                      <Text size="sm" weight={500}>
                        {athlete.firstName} {athlete.lastName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t(
                          `athletes.weightCategories.${athlete.gender}.${athlete.weightCategory}`
                        )}
                      </Text>
                    </Box>
                  </Group>
                  <Group spacing="xs" noWrap>
                    <Select
                      withinPortal
                      placeholder={t("nominations.selectWeightCategory")}
                      data={weightCategoryOptions}
                      value={state?.weightCategory || athlete.weightCategory}
                      onChange={(value) =>
                        handleWeightCategoryChange(
                          athlete._id,
                          value as WeightCategory | null
                        )
                      }
                      disabled={!isPending}
                      size="xs"
                      style={{ width: 130 }}
                    />
                    <Select
                      withinPortal
                      placeholder={t("nominations.selectAgeCategory")}
                      data={competition.ageCategories.map(
                        (category: AgeCategory) => ({
                          value: category,
                          label: t(`competitions.ageCategories.${category}`),
                        })
                      )}
                      value={state?.ageCategory || null}
                      onChange={(value) =>
                        handleAgeCategoryChange(
                          athlete._id,
                          value as AgeCategory | null
                        )
                      }
                      disabled={!isPending}
                      size="xs"
                      style={{ width: 130 }}
                    />
                  </Group>
                </Group>
              </Card>
            );
          })}

          {hasPendingChanges && (
            <Button
              onClick={handleSave}
              loading={loading}
              color="yellow"
              fullWidth
              mt="md"
            >
              {t("nominations.saveChanges")}
            </Button>
          )}
        </Stack>
      </Paper>
    </Drawer>
  );
}
