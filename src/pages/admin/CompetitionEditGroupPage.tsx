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
  Tooltip,
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
import { Nomination, WeightCategory, Flight } from "@/types";
import { getNominationsByCompetitionIdAndWeightCategories } from "@/services/nominationService";
import { useDataFetching } from "@/hooks/useDataFetching";
import {
  femaleCategories,
  getGenderFromWeightCategory,
  maleCategories,
} from "@/utils/weightCategories";
import { useCompetitionDetails } from "@/components/competitions/hooks/useCompetitionDetails";
import {
  getFlightsByCompetition,
  createFlight,
  updateFlight,
} from "@/services/flightService";

interface GroupFormValues {
  flightNumber: number;
  startTime?: Date;
  numberOfGroups: number;
  selectedWeightCategories: WeightCategory[];
}

interface Props {
  onNominationsUpdated?: () => Promise<void>;
}

interface LocalNomination extends Nomination {
  groupName?: string;
}

interface LocalGroup {
  id: string;
  nominations: LocalNomination[];
  isOtherFlight?: boolean;
}

// Helper function to get athlete name
const getAthleteName = (nomination: Nomination) => {
  if (typeof nomination.athleteId === "string") {
    return nomination._id;
  }
  return `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`;
};

// Add this helper function near the top with other helpers
const isNominationDraggable = (
  nomination: Nomination,
  currentFlight: Flight | null
) => {
  if (!nomination.groupId) return true;
  return (
    currentFlight?.groups.some((g) => g._id === nomination.groupId) ?? true
  );
};

// Named export for the content component
export function CompetitionEditGroupPageContent({
  onNominationsUpdated,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: competitionId, flightId } = useParams();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [localGroups, setLocalGroups] = useState<LocalGroup[]>([
    {
      id: "unassigned",
      nominations: [],
      isOtherFlight: true,
    },
  ]);
  const hasUpdatedGroups = useRef(false);
  const initialLoadDone = useRef(false);

  // Get weight categories from URL params
  const urlWeightCategories = useMemo(() => {
    const categories =
      (searchParams.get("weightCategories")?.split(",") as WeightCategory[]) ||
      [];
    return categories;
  }, [searchParams]);

  // Fetch flights to get current group assignments
  const {
    data: flights,
    loading: loadingFlights,
    error: flightsError,
    refetch: refetchFlights,
  } = useDataFetching<Flight[]>({
    fetchFunction: async () => {
      const response = await getFlightsByCompetition(competitionId!);

      return response;
    },
    dependencies: [competitionId],
    skip: !competitionId,
  });

  // Get current flight and its groups
  const currentFlight = useMemo(() => {
    if (!flights || !flightId) {
      return null;
    }

    const flight = flights.find((f) => f._id === flightId);
    return flight || null;
  }, [flights, flightId]);

  // Effect to update form values when current flight changes
  useEffect(() => {
    if (currentFlight && !initialLoadDone.current) {
      form.setFieldValue("numberOfGroups", currentFlight.groups.length);
      form.setFieldValue("flightNumber", currentFlight.number);
      initialLoadDone.current = true;
    }
  }, [currentFlight]);

  // Fetch nominations for the selected weight categories
  const {
    data: nominationsData,
    loading: nominationsLoading,
    error: nominationsError,
    refetch: refetchNominations,
  } = useDataFetching<Nomination[]>({
    fetchFunction: () =>
      getNominationsByCompetitionIdAndWeightCategories(
        competitionId!,
        urlWeightCategories
      ),
    dependencies: [urlWeightCategories.join(",")], // Refetch when weight categories change
    skip: !competitionId || urlWeightCategories.length === 0,
  });

  const form = useForm<GroupFormValues>({
    initialValues: {
      flightNumber: parseInt(searchParams.get("flightNumber") || "1"),
      numberOfGroups: 1,
      selectedWeightCategories: urlWeightCategories,
    },
    validate: {
      numberOfGroups: (value) =>
        value < 1 ? "Must have at least 1 group" : null,
    },
  });

  // Update URL when weight categories change
  const handleWeightCategoriesChange = (categories: WeightCategory[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (categories.length > 0) {
      newParams.set("weightCategories", categories.join(","));
    } else {
      newParams.delete("weightCategories");
    }
    setSearchParams(newParams);
    form.setFieldValue("selectedWeightCategories", categories);
    // Reset hasUpdatedGroups to allow reprocessing of nominations
    hasUpdatedGroups.current = false;
  };

  // Process nominations into groups
  const processNominations = useMemo(() => {
    if (!nominationsData || nominationsLoading || !currentFlight) {
      return null;
    }

    console.log("Processing nominations:", {
      totalNominations: nominationsData.length,
      currentFlightId: currentFlight._id,
      currentFlightGroups: currentFlight.groups.map((g) => g._id),
    });

    // Get all nominations that are in other flights or unassigned
    const otherFlightNominations = nominationsData.filter((n) => {
      // A nomination is from another flight if:
      // 1. It has a groupId that doesn't belong to any group in the current flight
      // 2. OR it has no groupId at all
      const isInOtherFlight = n.groupId
        ? !currentFlight.groups.some((g) => g._id === n.groupId)
        : true;

      console.log("Checking nomination:", {
        nominationId: n._id,
        groupId: n.groupId,
        isInOtherFlight,
        athleteName:
          typeof n.athleteId === "string"
            ? n._id
            : `${n.athleteId.firstName} ${n.athleteId.lastName}`,
      });

      return isInOtherFlight;
    });

    // Create groups array for all groups in the current flight
    const assignedGroups: LocalGroup[] = currentFlight.groups.map((group) => {
      // Get nominations that belong to this group
      const groupNominations = nominationsData
        .filter((n) => n.groupId === group._id)
        .map((n) => ({
          ...n,
          groupName: group.name,
        }));

      return {
        id: group._id,
        nominations: groupNominations,
      };
    });

    const result = {
      otherFlightNominations,
      assignedGroups,
    };

    console.log("Categorized nominations:", {
      otherFlightNominations: otherFlightNominations.length,
      assignedGroups: assignedGroups.map((g) => ({
        groupId: g.id,
        count: g.nominations.length,
      })),
    });

    return result;
  }, [nominationsData, nominationsLoading, currentFlight]);

  // Effect to update groups and finished state - only on initial load or when nominations change
  useEffect(() => {
    if (!processNominations) {
      return;
    }

    // Only skip if we're not changing weight categories
    if (hasUpdatedGroups.current && !form.isDirty("selectedWeightCategories")) {
      return;
    }

    const { otherFlightNominations, assignedGroups } = processNominations;

    console.log("Updating groups with:", {
      otherFlightCount: otherFlightNominations.length,
      assignedGroupsCount: assignedGroups.length,
      weightCategories: form.values.selectedWeightCategories,
    });

    // If we're creating a new flight, initialize empty groups
    const initialGroups = currentFlight
      ? assignedGroups
      : Array.from({ length: form.values.numberOfGroups }, (_, i) => ({
          id: `new-group-${i + 1}`,
          nominations: [],
        }));

    // Ensure we have the correct number of groups
    const groups = currentFlight
      ? assignedGroups
      : Array.from({ length: form.values.numberOfGroups }, (_, i) => {
          const existingGroup = initialGroups[i];
          return {
            id: existingGroup?.id || `new-group-${i + 1}`,
            nominations: existingGroup?.nominations || [],
          };
        });

    // Create unassigned group with all nominations that aren't in the current flight's groups
    const unassignedGroup = {
      id: "unassigned",
      nominations: otherFlightNominations,
      isOtherFlight: true,
    };

    console.log("Setting new local groups:", {
      unassignedGroupCount: unassignedGroup.nominations.length,
      unassignedNominations: unassignedGroup.nominations.map((n) => ({
        id: n._id,
        groupId: n.groupId,
        athleteName:
          typeof n.athleteId === "string"
            ? n._id
            : `${n.athleteId.firstName} ${n.athleteId.lastName}`,
      })),
      totalGroups: groups.length + 1,
      weightCategories: form.values.selectedWeightCategories,
    });

    setLocalGroups([unassignedGroup, ...groups]);

    // Set start time if available and not already set
    if (currentFlight?.startTime && !startTime) {
      setStartTime(new Date(currentFlight.startTime));
    }

    hasUpdatedGroups.current = true;
  }, [
    processNominations,
    currentFlight,
    startTime,
    form.values.selectedWeightCategories,
  ]);

  // Update local groups when number of groups changes - only for new flights
  useEffect(() => {
    if (!currentFlight && hasUpdatedGroups.current) {
      const currentGroups = localGroups.filter((g) => g.id !== "unassigned");
      const unassignedGroup = localGroups.find(
        (g) => g.id === "unassigned"
      ) ?? {
        id: "unassigned",
        nominations: [],
        isOtherFlight: true,
      };

      // Preserve existing nominations when changing group count
      const newGroups = Array.from(
        { length: form.values.numberOfGroups },
        (_, i) => {
          const existingGroup = currentGroups[i];
          return {
            id: existingGroup?.id || `new-group-${i + 1}`,
            nominations: existingGroup?.nominations || [],
          };
        }
      );

      setLocalGroups([unassignedGroup, ...newGroups]);
    }
  }, [form.values.numberOfGroups, currentFlight]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // Check if the dragged nomination is from another flight
    const sourceGroup = localGroups.find(
      (g) => g.id === result.source.droppableId
    );
    const draggedNomination = sourceGroup?.nominations[result.source.index];

    if (
      draggedNomination?.groupId &&
      !currentFlight?.groups.some((g) => g._id === draggedNomination.groupId)
    ) {
      return; // Don't allow dragging nominations from other flights
    }

    hasUpdatedGroups.current = true;

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

      // If moving to unassigned, clear the groupId
      if (destGroupId === "unassigned") {
        movedNomination.groupId = undefined;
      } else if (currentFlight) {
        // If moving to a group in an existing flight, set the groupId to the actual group ID
        const targetGroup = currentFlight.groups.find(
          (g) => g._id === destGroupId
        );
        if (targetGroup) {
          movedNomination.groupId = targetGroup._id;
        }
      }

      // Add to destination group
      destGroup.nominations.splice(destination.index, 0, movedNomination);

      return newGroups;
    });
  };

  const handleSubmit = async (values: GroupFormValues) => {
    if (!localGroups || !competitionId) return;
    setLoading(true);
    try {
      // Create new groups array
      const groups = localGroups
        .filter((group) => group.id !== "unassigned")
        .map((group, index) => ({
          number: index + 1,
          name: `${t("competition.group")} ${index + 1}`,
          startTime: startTime || undefined,
          nominationIds: group.nominations.map((n) => n._id),
        }));

      // Create flight update data
      const flightData = {
        competitionId,
        number: values.flightNumber,
        startTime: startTime || undefined,
        groups,
      };

      // If we have a flightId, we're updating an existing flight
      if (flightId) {
        await updateFlight(flightId, flightData);
        notifications.show({
          title: t("competition.flightUpdated"),
          message: t("competition.flightUpdatedSuccess"),
          color: "green",
        });
      } else {
        // Create new flight
        await createFlight(flightData);
        notifications.show({
          title: t("competition.flightCreated"),
          message: t("competition.flightCreatedSuccess"),
          color: "green",
        });
      }

      // Wait for both local refetch and parent update
      await Promise.all([refetchNominations(), onNominationsUpdated?.()]);
      navigate(`/competitions/${competitionId}`);
    } catch (error) {
      console.error("Error updating flight:", error);
      notifications.show({
        title: t("competition.error"),
        message: t("competition.flightUpdateError"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while flights are being fetched
  if (loadingFlights) {
    return (
      <Container>
        <LoadingOverlay visible={true} overlayBlur={2} />
      </Container>
    );
  }

  // Show error state if flights failed to load
  if (flightsError) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.error")}
          color="red"
        >
          {t("competition.errorLoadingFlights")}
        </Alert>
      </Container>
    );
  }

  // Show error if current flight is not found
  if (!currentFlight && flightId) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.error")}
          color="red"
        >
          {t("competition.flightNotFound")}
        </Alert>
      </Container>
    );
  }

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
              {t("competition.flight")}{" "}
              {currentFlight?.number || form.values.flightNumber}
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
                  value={form.values.selectedWeightCategories}
                  onChange={handleWeightCategoriesChange}
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
                    onChange={(value) => {
                      if (typeof value === "number") {
                        hasUpdatedGroups.current = true;
                        form.setFieldValue("numberOfGroups", value);
                      }
                    }}
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
                <LoadingOverlay
                  visible={loading || nominationsLoading || loadingFlights}
                  overlayBlur={2}
                />
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
                              {t("competition.flight")}{" "}
                              {form.values.flightNumber})
                            </Text>
                            {localGroups
                              .find((g) => g.id === "unassigned")
                              ?.nominations.some(
                                (n) =>
                                  n.groupId &&
                                  !currentFlight?.groups.some(
                                    (g) => g._id === n.groupId
                                  )
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
                                        !isNominationDraggable(
                                          nomination,
                                          currentFlight
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
                                          <Tooltip
                                            label={
                                              !isNominationDraggable(
                                                nomination,
                                                currentFlight
                                              )
                                                ? t(
                                                    "competition.nominationAssignedToOtherFlight"
                                                  )
                                                : undefined
                                            }
                                            disabled={isNominationDraggable(
                                              nomination,
                                              currentFlight
                                            )}
                                            position="top"
                                            withinPortal
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
                                                cursor: isNominationDraggable(
                                                  nomination,
                                                  currentFlight
                                                )
                                                  ? "grab"
                                                  : "not-allowed",
                                                "&:active": {
                                                  cursor: isNominationDraggable(
                                                    nomination,
                                                    currentFlight
                                                  )
                                                    ? "grabbing"
                                                    : "not-allowed",
                                                },
                                                opacity: snapshot.isDragging
                                                  ? 0.5
                                                  : isNominationDraggable(
                                                      nomination,
                                                      currentFlight
                                                    )
                                                  ? 1
                                                  : 0.7,
                                                position: "relative",
                                                zIndex: snapshot.isDragging
                                                  ? 1000
                                                  : "auto",
                                                borderColor:
                                                  !isNominationDraggable(
                                                    nomination,
                                                    currentFlight
                                                  )
                                                    ? "var(--mantine-color-gray-4)"
                                                    : undefined,
                                              }}
                                            >
                                              <Group
                                                position="apart"
                                                spacing="xs"
                                              >
                                                <Stack spacing={2}>
                                                  <Text
                                                    size="sm"
                                                    color={
                                                      !isNominationDraggable(
                                                        nomination,
                                                        currentFlight
                                                      )
                                                        ? "dimmed"
                                                        : undefined
                                                    }
                                                  >
                                                    {getAthleteName(nomination)}
                                                  </Text>
                                                  {!isNominationDraggable(
                                                    nomination,
                                                    currentFlight
                                                  ) && (
                                                    <Text
                                                      size="xs"
                                                      color="dimmed"
                                                    >
                                                      {t(
                                                        "competition.assignedToOtherFlight"
                                                      )}
                                                    </Text>
                                                  )}
                                                </Stack>
                                                <Badge
                                                  size="sm"
                                                  variant={
                                                    !isNominationDraggable(
                                                      nomination,
                                                      currentFlight
                                                    )
                                                      ? "outline"
                                                      : "light"
                                                  }
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
                                          </Tooltip>
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
                        {localGroups
                          .filter((group) => group.id !== "unassigned")
                          .map((group, index) => (
                            <Grid.Col
                              key={group.id}
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
                                        groupNumber: index + 1,
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
                                      {group.nominations.length}
                                    </Text>
                                  </Group>
                                </Group>

                                <Droppable droppableId={group.id}>
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
                                        {group.nominations.map(
                                          (nomination, index) => (
                                            <Draggable
                                              key={nomination._id}
                                              draggableId={nomination._id}
                                              index={index}
                                              isDragDisabled={
                                                !isNominationDraggable(
                                                  nomination,
                                                  currentFlight
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
                                                  <Tooltip
                                                    label={
                                                      !isNominationDraggable(
                                                        nomination,
                                                        currentFlight
                                                      )
                                                        ? t(
                                                            "competition.nominationAssignedToOtherFlight"
                                                          )
                                                        : undefined
                                                    }
                                                    disabled={isNominationDraggable(
                                                      nomination,
                                                      currentFlight
                                                    )}
                                                    position="top"
                                                    withinPortal
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
                                                        cursor:
                                                          isNominationDraggable(
                                                            nomination,
                                                            currentFlight
                                                          )
                                                            ? "grab"
                                                            : "not-allowed",
                                                        "&:active": {
                                                          cursor:
                                                            isNominationDraggable(
                                                              nomination,
                                                              currentFlight
                                                            )
                                                              ? "grabbing"
                                                              : "not-allowed",
                                                        },
                                                        opacity:
                                                          snapshot.isDragging
                                                            ? 0.5
                                                            : isNominationDraggable(
                                                                nomination,
                                                                currentFlight
                                                              )
                                                            ? 1
                                                            : 0.7,
                                                        position: "relative",
                                                        zIndex:
                                                          snapshot.isDragging
                                                            ? 1000
                                                            : "auto",
                                                        borderColor:
                                                          !isNominationDraggable(
                                                            nomination,
                                                            currentFlight
                                                          )
                                                            ? "var(--mantine-color-gray-4)"
                                                            : undefined,
                                                      }}
                                                    >
                                                      <Group
                                                        position="apart"
                                                        spacing="xs"
                                                      >
                                                        <Text
                                                          size="sm"
                                                          color={
                                                            !isNominationDraggable(
                                                              nomination,
                                                              currentFlight
                                                            )
                                                              ? "dimmed"
                                                              : undefined
                                                          }
                                                        >
                                                          {getAthleteName(
                                                            nomination
                                                          )}
                                                        </Text>
                                                        <Badge
                                                          size="sm"
                                                          variant={
                                                            !isNominationDraggable(
                                                              nomination,
                                                              currentFlight
                                                            )
                                                              ? "outline"
                                                              : "light"
                                                          }
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
                                                  </Tooltip>
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
                          ))}
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
