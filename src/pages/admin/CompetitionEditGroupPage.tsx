import { useState, useMemo, useEffect, useRef } from "react";
import {
  NumberInput,
  Button,
  Stack,
  Group,
  Text,
  Paper,
  Box,
  Container,
  Title,
  Alert,
  MultiSelect,
  Grid,
  Badge,
  LoadingOverlay,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  IconUsers,
  IconArrowLeft,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";
import { Nomination, WeightCategory } from "@/types";
import {
  getNominationsByCompetitionIdAndWeightCategories,
  batchUpdateNominations,
  type BatchUpdateNominationsRequest,
} from "@/services/nominationService";
import { useDataFetching } from "@/hooks/useDataFetching";
import {
  femaleCategories,
  getGenderFromWeightCategory,
  maleCategories,
} from "@/utils/weightCategories";
import { useCompetitionDetails } from "@/hooks/useCompetitionDetails";

interface GroupFormValues {
  flightNumber: number;
  startTime?: Date;
  numberOfGroups: number;
  selectedWeightCategories: WeightCategory[];
}

// Local type for nominations with null instead of undefined
interface LocalNomination
  extends Omit<
    Nomination,
    "groupNumber" | "groupName" | "groupStartTime" | "flightNumber"
  > {
  groupNumber: number | null;
  groupName: string | null;
  groupStartTime: Date | null;
  flightNumber: number | null;
}

interface Group {
  id: string;
  nominations: LocalNomination[];
  isOtherFlight?: boolean;
}

interface NominationUpdate {
  flightNumber: number | null;
  groupNumber: number | null;
  groupName: string | null;
  groupStartTime: Date | null;
}

interface BatchUpdateNomination {
  nominationId: string;
  updates: NominationUpdate;
}

interface Props {
  onNominationsUpdated?: () => Promise<void>;
}

// Helper function to convert Nomination to LocalNomination
const toLocalNomination = (nomination: Nomination): LocalNomination => ({
  ...nomination,
  groupNumber: nomination.groupNumber ?? null,
  groupName: nomination.groupName ?? null,
  groupStartTime: nomination.groupStartTime ?? null,
  flightNumber: nomination.flightNumber ?? null,
});

// Helper function to get athlete name from either type
const getAthleteName = (nomination: Nomination | LocalNomination) => {
  if (typeof nomination.athleteId === "string") {
    return nomination._id;
  }
  return `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`;
};

function CompetitionEditGroupPageContent({ onNominationsUpdated }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: competitionId, flightNumber: flightNumberParam } = useParams();
  const [searchParams] = useSearchParams();
  const flightNumber = parseInt(flightNumberParam || "1");

  // Get weight categories and number of groups from URL
  const urlWeightCategories = useMemo(
    () =>
      (searchParams.get("weightCategories")?.split(",") as WeightCategory[]) ||
      [],
    [searchParams]
  );
  const urlNumberOfGroups = useMemo(
    () => parseInt(searchParams.get("numberOfGroups") || "1"),
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [localGroups, setLocalGroups] = useState<Group[]>([]);
  const hasUpdatedGroups = useRef(false);

  const form = useForm<GroupFormValues>({
    initialValues: {
      flightNumber,
      numberOfGroups: urlNumberOfGroups,
      selectedWeightCategories: urlWeightCategories,
    },
    validate: {
      numberOfGroups: (value) =>
        value < 1
          ? "Must have at least 1 group"
          : value > 3
          ? "Maximum 3 groups allowed"
          : null,
      selectedWeightCategories: (value) =>
        value.length === 0 ? "Select at least one weight category" : null,
    },
  });

  // Update form when URL parameters change
  useEffect(() => {
    form.setFieldValue("numberOfGroups", urlNumberOfGroups);
    form.setFieldValue("selectedWeightCategories", urlWeightCategories);
  }, [urlNumberOfGroups, urlWeightCategories]);

  // Memoize the form values we need for fetching
  const fetchParams = useMemo(
    () => ({
      competitionId,
      weightCategories: form.values.selectedWeightCategories,
      flightNumber,
      numberOfGroups: form.values.numberOfGroups,
    }),
    [
      competitionId,
      form.values.selectedWeightCategories,
      flightNumber,
      form.values.numberOfGroups,
    ]
  );

  // Memoize the fetch function with stable dependencies
  const fetchNominations = useMemo(
    () => async () => {
      const { competitionId, weightCategories } = fetchParams;
      if (!competitionId || weightCategories.length === 0) {
        return { success: false, error: "Missing required parameters" };
      }
      return getNominationsByCompetitionIdAndWeightCategories(
        competitionId,
        weightCategories
      );
    },
    [fetchParams] // Only depend on the memoized params
  );

  // Use our custom hook for data fetching
  const {
    data: nominationsData,
    loading: nominationsLoading,
    error: nominationsError,
    refetch: refetchNominations,
  } = useDataFetching({
    fetchFunction: fetchNominations,
    dependencies: [form.values.selectedWeightCategories],
    skip:
      !fetchParams.competitionId || fetchParams.weightCategories.length === 0,
  });

  // Get all available weight categories from nominations data
  const availableWeightCategories = useMemo(() => {
    if (!nominationsData) return [];
    return Array.from(
      new Set(nominationsData.map((n) => n.weightCategory))
    ).sort();
  }, [nominationsData]);

  const processNominations = useMemo(() => {
    if (!nominationsData || nominationsLoading) {
      return null;
    }

    const localNominations = nominationsData.map(toLocalNomination);

    const otherFlightNominations = localNominations.filter(
      (n) => n.flightNumber && n.flightNumber !== fetchParams.flightNumber
    );

    const unassignedInFlight = localNominations.filter(
      (n) => !n.flightNumber || !n.groupNumber
    );

    const assigned = localNominations.filter(
      (n) => n.flightNumber === fetchParams.flightNumber && n.groupNumber
    );

    // Get distinct group numbers from assigned nominations
    const distinctGroupNumbers = Array.from(
      new Set(
        assigned
          .map((n) => n.groupNumber)
          .filter((n): n is number => n !== null)
      )
    ).sort((a, b) => a - b);

    // Create groups array for all possible groups (1 to numberOfGroups)
    const assignedGroups: Group[] = Array.from(
      { length: form.values.numberOfGroups },
      (_, i) => i + 1
    ).map((groupNumber) => {
      // Find nominations for this group
      const groupNominations = assigned
        .filter((n) => n.groupNumber === groupNumber)
        .map((n) => ({
          ...n,
          groupName: `${t("competition.group")} ${groupNumber}`,
        }));

      return {
        id: `group-${groupNumber}`,
        nominations: groupNominations,
      };
    });

    return {
      otherFlightNominations,
      unassignedInFlight,
      assignedGroups,
      distinctGroupNumbers,
    };
  }, [
    nominationsData,
    nominationsLoading,
    fetchParams.flightNumber,
    t,
    form.values.numberOfGroups,
  ]);

  // Effect to update groups and finished state
  useEffect(() => {
    if (!processNominations) {
      return;
    }

    const { otherFlightNominations, unassignedInFlight, assignedGroups } =
      processNominations;

    // Only update groups if this is the initial load or if nominations data has changed
    // Don't update when only the time changes
    const shouldUpdateGroups = !hasUpdatedGroups.current;
    if (shouldUpdateGroups) {
      setLocalGroups([
        {
          id: "unassigned",
          nominations: [...otherFlightNominations, ...unassignedInFlight],
          isOtherFlight: true,
        },
        ...assignedGroups,
      ]);
    }

    // Set start time if available and not already set
    const firstAssignedNomination = assignedGroups[0]?.nominations[0];
    if (firstAssignedNomination?.groupStartTime && !startTime) {
      setStartTime(new Date(firstAssignedNomination.groupStartTime));
    }
  }, [processNominations]); // Remove startTime from dependencies

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // Check if the dragged nomination is from another flight
    const sourceGroup = localGroups.find(
      (g) => g.id === result.source.droppableId
    );
    const draggedNomination = sourceGroup?.nominations[result.source.index];

    if (
      draggedNomination?.flightNumber &&
      draggedNomination.flightNumber !== flightNumber
    ) {
      return; // Don't allow dragging nominations from other flights
    }

    hasUpdatedGroups.current = true; // Mark that we've made manual updates

    const { source, destination } = result;
    const sourceGroupId = source.droppableId;
    const destGroupId = destination.droppableId;

    setLocalGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const sourceGroup = newGroups.find((g) => g.id === sourceGroupId);
      const destGroup = newGroups.find((g) => g.id === destGroupId);

      if (!sourceGroup || !destGroup) return prevGroups;

      // Remove from source group
      const [movedNomination] = sourceGroup.nominations.splice(source.index, 1);

      // Add to destination group
      destGroup.nominations.splice(destination.index, 0, movedNomination);

      // Update group numbers in the nominations
      return newGroups.map((group, groupIndex) => ({
        ...group,
        nominations: group.nominations.map((nomination) => ({
          ...nomination,
          groupNumber: group.id === "unassigned" ? null : groupIndex,
          groupName:
            group.id === "unassigned"
              ? null
              : `${t("competition.group")} ${groupIndex}`,
          flightNumber:
            group.id === "unassigned" ? null : fetchParams.flightNumber,
        })),
      }));
    });
  };

  const handleSubmit = async (values: GroupFormValues) => {
    if (!localGroups) return;
    setLoading(true);
    try {
      // Convert local nominations back to API type for submission
      const nominations = localGroups.flatMap(
        (group): BatchUpdateNomination[] => {
          if (group.id === "unassigned") {
            // Only process nominations that were originally in this flight
            return group.nominations
              .filter(
                (n) =>
                  n.flightNumber === fetchParams.flightNumber ||
                  n.flightNumber === null
              )
              .map((nomination) => ({
                nominationId: nomination._id,
                updates: {
                  flightNumber: null,
                  groupNumber: null,
                  groupName: null,
                  groupStartTime: null,
                },
              }));
          } else {
            const groupNumber = parseInt(group.id.split("-")[1]);
            return group.nominations.map((nomination) => ({
              nominationId: nomination._id,
              updates: {
                flightNumber: values.flightNumber,
                groupNumber: groupNumber,
                groupName: `${t("competition.group")} ${groupNumber}`,
                groupStartTime: startTime || null,
              },
            }));
          }
        }
      );

      const batchUpdate: BatchUpdateNominationsRequest = {
        nominations:
          nominations as unknown as BatchUpdateNominationsRequest["nominations"],
      };

      console.log(
        "Sending batch update:",
        JSON.stringify(batchUpdate, null, 2)
      );

      // Perform batch update
      const result = await batchUpdateNominations(batchUpdate);

      if (!result.success) {
        throw new Error(result.error || "Failed to update nominations");
      }

      // Wait for both local refetch and parent update
      await Promise.all([refetchNominations(), onNominationsUpdated?.()]);

      notifications.show({
        title: "Flight updated",
        message: "The flight has been updated successfully",
        color: "green",
      });

      // Only navigate after all updates are complete
      navigate(`/competitions/${competitionId}?tab=groups`);
    } catch (error) {
      console.error("Error updating nominations:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while updating the flight",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handleNumberOfGroupsChange to update URL
  const handleNumberOfGroupsChange = (value: number) => {
    console.log("Number of groups changed to:", value);
    hasUpdatedGroups.current = true;

    const oldValue = form.values.numberOfGroups;
    form.setFieldValue("numberOfGroups", value);

    // Update URL with new number of groups
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("numberOfGroups", value.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });

    // Only update local groups if we're adding groups
    if (value > oldValue) {
      setLocalGroups((prevGroups) => {
        // Keep existing groups
        const existingGroups = prevGroups.filter((g) => g.id !== "unassigned");
        // Add new empty groups
        const newGroups = Array.from({ length: value - oldValue }, (_, i) => ({
          id: `group-${oldValue + i + 1}`,
          nominations: [],
        }));
        // Return unassigned group + existing groups + new groups
        return [
          prevGroups.find((g) => g.id === "unassigned")!,
          ...existingGroups,
          ...newGroups,
        ];
      });
    } else if (value < oldValue) {
      // Remove excess groups but keep their nominations in unassigned
      setLocalGroups((prevGroups) => {
        const unassignedGroup = prevGroups.find((g) => g.id === "unassigned")!;
        const groupsToKeep = prevGroups.filter(
          (g) => g.id === "unassigned" || parseInt(g.id.split("-")[1]) <= value
        );
        const groupsToRemove = prevGroups.filter(
          (g) => g.id !== "unassigned" && parseInt(g.id.split("-")[1]) > value
        );

        // Move nominations from removed groups to unassigned
        const nominationsToMove = groupsToRemove.flatMap((g) => g.nominations);
        return [
          {
            ...unassignedGroup,
            nominations: [...unassignedGroup.nominations, ...nominationsToMove],
          },
          ...groupsToKeep.filter((g) => g.id !== "unassigned"),
        ];
      });
    }
  };

  if (nominationsError) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.error")}
          color="red"
        >
          {t("competition.errorLoadingNominations")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack
        spacing="lg"
        sx={{ position: "relative", minHeight: "calc(100vh - 200px)" }}
      >
        <Group position="apart">
          <Group>
            <Button
              variant="subtle"
              leftIcon={<IconArrowLeft size={16} />}
              onClick={() =>
                navigate(`/competitions/${competitionId}?tab=groups`)
              }
            >
              {t("common.back")}
            </Button>
            <Title order={2}>
              {t("competition.flight")} {flightNumber}
            </Title>
          </Group>
        </Group>

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <Stack spacing="lg" style={{ flex: 1 }}>
            <Paper withBorder p="md">
              <Stack>
                <MultiSelect
                  label={t("competition.weightCategories")}
                  placeholder={t("competition.selectWeightCategories")}
                  data={[...maleCategories, ...femaleCategories]}
                  {...form.getInputProps("selectedWeightCategories")}
                  searchable
                  clearable
                />

                <Group grow>
                  <DateTimePicker
                    label={t("competition.startTime")}
                    placeholder={t("competition.selectStartTime")}
                    value={startTime}
                    onChange={setStartTime}
                    clearable
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  />
                  <NumberInput
                    label={t("competition.numberOfGroups")}
                    min={1}
                    max={3}
                    value={form.values.numberOfGroups}
                    onChange={handleNumberOfGroupsChange}
                  />
                </Group>
              </Stack>
            </Paper>

            {form.values.selectedWeightCategories.length > 0 && (
              <Box
                sx={{
                  width: "100%",
                  position: "relative",
                  flex: 1,
                }}
              >
                <LoadingOverlay visible={nominationsLoading} overlayBlur={2} />
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Grid gutter="md">
                    {/* Unassigned column */}
                    <Grid.Col xs={12} md={3}>
                      <Paper
                        withBorder
                        p="md"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          backgroundColor: "var(--mantine-color-gray-0)",
                          height: "100%",
                        }}
                      >
                        <Group position="apart" mb="xs">
                          <Group>
                            <Text weight={500}>
                              {t("competition.unassigned")} (
                              {t("competition.flight")} {flightNumber})
                            </Text>
                            {localGroups
                              .find((g) => g.id === "unassigned")
                              ?.nominations.some(
                                (n) =>
                                  n.flightNumber &&
                                  n.flightNumber !== flightNumber
                              ) && (
                              <Text size="sm" color="dimmed">
                                {t("competition.includesOtherFlights")}
                              </Text>
                            )}
                          </Group>
                          <Group spacing="xs">
                            <IconUsers size={16} />
                            <Text size="sm">
                              {localGroups.find((g) => g.id === "unassigned")
                                ?.nominations.length || 0}
                            </Text>
                          </Group>
                        </Group>

                        <Droppable droppableId="unassigned">
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                backgroundColor: snapshot.isDraggingOver
                                  ? "var(--mantine-color-blue-0)"
                                  : "var(--mantine-color-gray-1)",
                                borderRadius: "var(--mantine-radius-sm)",
                                padding: "var(--mantine-spacing-xs)",
                                transition: "background-color 0.2s ease",
                                flex: 1,
                              }}
                            >
                              <Stack spacing="xs">
                                {localGroups
                                  .find((g) => g.id === "unassigned")
                                  ?.nominations.map((nomination, index) => (
                                    <Draggable
                                      key={nomination._id}
                                      draggableId={nomination._id}
                                      index={index}
                                      isDragDisabled={
                                        !!(
                                          nomination.flightNumber &&
                                          nomination.flightNumber !==
                                            flightNumber
                                        )
                                      }
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                          }}
                                        >
                                          <Paper
                                            p="xs"
                                            withBorder
                                            sx={{
                                              backgroundColor:
                                                snapshot.isDragging
                                                  ? "var(--mantine-color-blue-0)"
                                                  : "var(--mantine-color-white)",
                                              transition: "all 0.2s ease",
                                              cursor:
                                                nomination.flightNumber &&
                                                nomination.flightNumber !==
                                                  flightNumber
                                                  ? "not-allowed"
                                                  : snapshot.isDragging
                                                  ? "grabbing"
                                                  : "grab",
                                              "&:active": {
                                                cursor:
                                                  nomination.flightNumber &&
                                                  nomination.flightNumber !==
                                                    flightNumber
                                                    ? "not-allowed"
                                                    : "grabbing",
                                              },
                                              opacity: snapshot.isDragging
                                                ? 0.5
                                                : 1,
                                              position: "relative",
                                              zIndex: snapshot.isDragging
                                                ? 1000
                                                : "auto",
                                            }}
                                          >
                                            <Group
                                              position="apart"
                                              spacing="xs"
                                            >
                                              <Stack spacing={2}>
                                                <Text size="sm">
                                                  {getAthleteName(nomination)}
                                                </Text>
                                                {nomination.flightNumber &&
                                                  nomination.flightNumber !==
                                                    flightNumber && (
                                                    <Text
                                                      size="xs"
                                                      color="dimmed"
                                                    >
                                                      {t("competition.flight")}{" "}
                                                      {nomination.flightNumber}
                                                    </Text>
                                                  )}
                                              </Stack>
                                              <Badge size="sm" variant="light">
                                                {t(
                                                  `athletes.weightCategories.${getGenderFromWeightCategory(
                                                    nomination.weightCategory
                                                  )}.${
                                                    nomination.weightCategory
                                                  }`
                                                )}
                                              </Badge>
                                            </Group>
                                          </Paper>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </Stack>
                            </Box>
                          )}
                        </Droppable>
                      </Paper>
                    </Grid.Col>

                    {/* Group columns container */}
                    <Grid.Col xs={12} md={9}>
                      <Grid gutter="md">
                        {Array.from(
                          { length: form.values.numberOfGroups },
                          (_, i) => i + 1
                        ).map((groupNumber) => {
                          const group = localGroups.find(
                            (g) => g.id === `group-${groupNumber}`
                          );

                          return (
                            <Grid.Col
                              key={`group-${groupNumber}`}
                              span={12 / form.values.numberOfGroups}
                            >
                              <Paper
                                withBorder
                                p="md"
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  backgroundColor: "var(--mantine-color-body)",
                                  height: "100%",
                                }}
                              >
                                <Group position="apart" mb="xs">
                                  <Group>
                                    <Text weight={500}>
                                      {t("competition.groupNumber", {
                                        groupNumber,
                                      })}
                                    </Text>
                                    {startTime && (
                                      <Group spacing="xs">
                                        <IconClock size={16} />
                                        <Text size="sm" color="dimmed">
                                          {new Date(
                                            startTime
                                          ).toLocaleTimeString()}
                                        </Text>
                                      </Group>
                                    )}
                                  </Group>
                                  <Group spacing="xs">
                                    <IconUsers size={16} />
                                    <Text size="sm">
                                      {group?.nominations.length || 0}
                                    </Text>
                                  </Group>
                                </Group>

                                <Droppable droppableId={`group-${groupNumber}`}>
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      sx={{
                                        backgroundColor: snapshot.isDraggingOver
                                          ? "var(--mantine-color-blue-0)"
                                          : "var(--mantine-color-gray-0)",
                                        borderRadius:
                                          "var(--mantine-radius-sm)",
                                        padding: "var(--mantine-spacing-xs)",
                                        transition:
                                          "background-color 0.2s ease",
                                        flex: 1,
                                      }}
                                    >
                                      <Stack spacing="xs">
                                        {(group?.nominations || []).map(
                                          (nomination, index) => (
                                            <Draggable
                                              key={nomination._id}
                                              draggableId={nomination._id}
                                              index={index}
                                              isDragDisabled={
                                                !!(
                                                  nomination.flightNumber &&
                                                  nomination.flightNumber !==
                                                    flightNumber
                                                )
                                              }
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  style={{
                                                    ...provided.draggableProps
                                                      .style,
                                                  }}
                                                >
                                                  <Paper
                                                    p="xs"
                                                    withBorder
                                                    sx={{
                                                      backgroundColor:
                                                        snapshot.isDragging
                                                          ? "var(--mantine-color-blue-0)"
                                                          : "var(--mantine-color-white)",
                                                      transition:
                                                        "all 0.2s ease",
                                                      cursor: "grab",
                                                      "&:active": {
                                                        cursor: "grabbing",
                                                      },
                                                      opacity:
                                                        snapshot.isDragging
                                                          ? 0.5
                                                          : 1,
                                                      position: "relative",
                                                      zIndex:
                                                        snapshot.isDragging
                                                          ? 1000
                                                          : "auto",
                                                    }}
                                                  >
                                                    <Group
                                                      position="apart"
                                                      spacing="xs"
                                                    >
                                                      <Text size="sm">
                                                        {getAthleteName(
                                                          nomination
                                                        )}
                                                      </Text>
                                                      <Badge
                                                        size="sm"
                                                        variant="light"
                                                      >
                                                        {t(
                                                          `athletes.weightCategories.${getGenderFromWeightCategory(
                                                            nomination.weightCategory
                                                          )}.${
                                                            nomination.weightCategory
                                                          }`
                                                        )}
                                                      </Badge>
                                                    </Group>
                                                  </Paper>
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                        {provided.placeholder}
                                      </Stack>
                                    </Box>
                                  )}
                                </Droppable>
                              </Paper>
                            </Grid.Col>
                          );
                        })}
                      </Grid>
                    </Grid.Col>
                  </Grid>
                </DragDropContext>
              </Box>
            )}
          </Stack>

          <Paper
            p="md"
            sx={{
              position: "sticky",
              bottom: 0,
              marginTop: "var(--mantine-spacing-md)",
              zIndex: 100,
              width: "fit-content",
              marginLeft: "auto",
              backgroundColor: "var(--mantine-color-body)",
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Group position="right">
              <Button type="submit" loading={loading}>
                {t("competition.saveFlight")}
              </Button>
            </Group>
          </Paper>
        </form>
      </Stack>
    </Container>
  );
}

export default function CompetitionEditGroupPage() {
  const { id: competitionId } = useParams();
  const { refetchNominations } = useCompetitionDetails(competitionId);

  const handleNominationsUpdated = async () => {
    await refetchNominations();
  };

  return (
    <CompetitionEditGroupPageContent
      onNominationsUpdated={handleNominationsUpdated}
    />
  );
}
