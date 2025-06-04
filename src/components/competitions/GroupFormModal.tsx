import { useState, useMemo } from "react";
import {
  Modal,
  NumberInput,
  Button,
  Stack,
  Group,
  Text,
  Paper,
  Box,
  Portal,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import type {
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IconUsers } from "@tabler/icons-react";
import { Nomination, CreateFlightFormValues } from "@/types";
import { createFlight } from "@/services/flightService";

interface GroupFormModalProps {
  opened: boolean;
  onClose: () => void;
  flightNumber: number;
  competitionId: string;
  nominations: Nomination[];
  onSuccess: () => void;
}

export function GroupFormModal({
  opened,
  onClose,
  flightNumber,
  competitionId,
  nominations,
  onSuccess,
}: GroupFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Only nominations that are not assigned to a group
  const unassignedNominations = useMemo(
    () => nominations.filter((n) => !n.groupId),
    [nominations]
  );

  // Local state to track group assignments
  const [groupAssignments, setGroupAssignments] = useState<{ [groupNumber: number]: Nomination[] }>(() => ({
    1: unassignedNominations,
  }));

  const form = useForm<{ numberOfGroups: number }>({
    initialValues: {
      numberOfGroups: 1,
    },
    validate: {
      numberOfGroups: (value) => (value < 1 ? "Must have at least 1 group" : null),
    },
  });

  // Update groupAssignments when number of groups changes
  useMemo(() => {
    setGroupAssignments((prev) => {
      const newAssignments: { [groupNumber: number]: Nomination[] } = {};
      const allNoms = Object.values(prev).flat();
      for (let i = 1; i <= form.values.numberOfGroups; i++) {
        newAssignments[i] = prev[i] || [];
      }
      // If there are more groups, distribute leftover nominations
      const assignedIds = Object.values(newAssignments).flat().map((n) => n._id);
      const unassigned = unassignedNominations.filter((n) => !assignedIds.includes(n._id));
      if (unassigned.length > 0) {
        newAssignments[1] = [...(newAssignments[1] || []), ...unassigned];
      }
      return newAssignments;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.numberOfGroups, unassignedNominations.length]);

  const handleSubmit = async (values: { numberOfGroups: number }) => {
    setLoading(true);
    try {
      // Build group structure from groupAssignments
      const groups = Array.from({ length: values.numberOfGroups }, (_, i) => ({
        number: i + 1,
        name: `${t("competition.group")} ${i + 1}`,
        startTime: startTime || undefined,
        nominationIds: (groupAssignments[i + 1] || []).map((n) => n._id),
      }));
      const flightData: CreateFlightFormValues = {
        competitionId,
        number: flightNumber,
        startTime: startTime || undefined,
        groups,
      };
      await createFlight(flightData);
      notifications.show({
        title: t("competition.flightCreated"),
        message: t("competition.flightCreatedSuccess"),
        color: "green",
      });
      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t("competition.error"),
        message: t("competition.flightCreateError"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const sourceGroup = parseInt(source.droppableId);
    const destGroup = parseInt(destination.droppableId);
    if (sourceGroup === destGroup && source.index === destination.index) return;
    setGroupAssignments((prev) => {
      const sourceList = [...(prev[sourceGroup] || [])];
      const destList = [...(prev[destGroup] || [])];
      const [moved] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, moved);
      return {
        ...prev,
        [sourceGroup]: sourceList,
        [destGroup]: destList,
      };
    });
  };

  const getAthleteName = (nomination: Nomination) => {
    if (typeof nomination.athleteId === "string") {
      return nomination._id;
    }
    return `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`;
  };

  // Create array of groups based on form value and groupAssignments
  const groups = useMemo(() => {
    const numGroups = form.values.numberOfGroups;
    const result: [number, Nomination[]][] = [];
    for (let i = 1; i <= numGroups; i++) {
      result.push([i, groupAssignments[i] || []]);
    }
    return result;
  }, [form.values.numberOfGroups, groupAssignments]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${t("competition.flight")} ${flightNumber}`}
      size="xl"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group grow>
            <DateTimePicker
              label={t("competition.startTime")}
              placeholder={t("competition.selectStartTime")}
              value={startTime}
              onChange={setStartTime}
              clearable
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            />
            <NumberInput
              label={t("competition.numberOfGroups")}
              min={1}
              max={10}
              {...form.getInputProps("numberOfGroups")}
            />
          </Group>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Group grow>
              {groups.map(([groupNumber, groupNominations]) => (
                <Paper key={groupNumber} withBorder p="md">
                  <Group position="apart" mb="xs">
                    <Text weight={500}>
                      {t("competition.group")} {groupNumber}
                    </Text>
                    <Group spacing="xs">
                      <IconUsers size={16} />
                      <Text size="sm">{groupNominations.length}</Text>
                    </Group>
                  </Group>
                  <Droppable droppableId={groupNumber.toString()}>
                    {(provided: DroppableProvided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          minHeight: 100,
                          backgroundColor: "var(--mantine-color-gray-0)",
                          borderRadius: "var(--mantine-radius-sm)",
                          padding: "var(--mantine-spacing-xs)",
                        }}
                      >
                        {groupNominations.map((nomination, index) => (
                          <Draggable
                            key={nomination._id}
                            draggableId={nomination._id}
                            index={index}
                          >
                            {(provided: DraggableProvided, snapshot) => (
                              <>
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  p="xs"
                                  mb="xs"
                                  withBorder
                                  sx={{
                                    backgroundColor: snapshot.isDragging
                                      ? "var(--mantine-color-blue-0)"
                                      : "var(--mantine-color-white)",
                                    transition: "background-color 0.2s ease",
                                    cursor: "grab",
                                    "&:active": {
                                      cursor: "grabbing",
                                    },
                                    opacity: snapshot.isDragging ? 0.5 : 1,
                                    transform: snapshot.isDragging ? "none !important" : undefined,
                                  }}
                                >
                                  <Text size="sm">{getAthleteName(nomination)}</Text>
                                </Paper>
                                {snapshot.isDragging && (
                                  <Portal>
                                    <Paper
                                      p="xs"
                                      withBorder
                                      sx={{
                                        position: "fixed",
                                        transform: provided.draggableProps.style?.transform,
                                        width: "200px",
                                        backgroundColor: "var(--mantine-color-blue-0)",
                                        boxShadow: "var(--mantine-shadow-lg)",
                                        zIndex: 1000,
                                        pointerEvents: "none",
                                      }}
                                    >
                                      <Text size="sm">{getAthleteName(nomination)}</Text>
                                    </Paper>
                                  </Portal>
                                )}
                              </>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              ))}
            </Group>
          </DragDropContext>
          <Button type="submit" loading={loading}>
            {t("competition.saveFlight")}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
} 