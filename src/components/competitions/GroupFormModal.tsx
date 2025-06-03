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
import { Nomination } from "@/types";
import { updateGroupForNomination } from "@/services/nominationService";

interface GroupFormModalProps {
  opened: boolean;
  onClose: () => void;
  flightNumber: number;
  nominations: Nomination[];
  onSuccess: () => void;
}

interface GroupFormValues {
  flightNumber: number;
  startTime?: Date;
  numberOfGroups: number;
}

export function GroupFormModal({
  opened,
  onClose,
  flightNumber,
  nominations,
  onSuccess,
}: GroupFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Debug logs
  console.log('Modal Props:', { flightNumber, nominationsCount: nominations?.length });
  console.log('Nominations:', nominations);

  // Group nominations by their current group number
  const currentGroups = useMemo(() => {
    const groups = new Map<number, Nomination[]>();
    
    // Get nominations that either belong to this flight or have no flight assignment
    const relevantNominations = nominations.filter(
      (nomination) => !nomination.flightNumber || nomination.flightNumber === flightNumber
    );

    // First, handle nominations that already have a group number
    relevantNominations.forEach((nomination) => {
      if (nomination.groupNumber) {
        if (!groups.has(nomination.groupNumber)) {
          groups.set(nomination.groupNumber, []);
        }
        groups.get(nomination.groupNumber)!.push(nomination);
      }
    });

    // Then, handle nominations without a group number
    const ungroupedNominations = relevantNominations.filter(
      (nomination) => !nomination.groupNumber
    );
    if (ungroupedNominations.length > 0) {
      groups.set(1, ungroupedNominations);
    }

    return groups;
  }, [nominations, flightNumber]);

  const form = useForm<GroupFormValues>({
    initialValues: {
      flightNumber,
      numberOfGroups: currentGroups.size || 1,
    },
    validate: {
      numberOfGroups: (value) => (value < 1 ? "Must have at least 1 group" : null),
    },
  });

  const handleSubmit = async (values: GroupFormValues) => {
    setLoading(true);
    try {
      // Update all nominations with the new group assignments
      const updates = nominations.map((nomination) => {
        const groupNumber = nomination.groupNumber || 1;
        return updateGroupForNomination(nomination._id, {
          flightNumber: values.flightNumber,
          groupNumber,
          groupName: `${t("competition.group")} ${groupNumber}`,
          groupStartTime: startTime || undefined,
        });
      });

      await Promise.all(updates);

      notifications.show({
        title: "Flight updated",
        message: "The flight has been updated successfully",
        color: "green",
      });
      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An error occurred while updating the flight",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceGroup = parseInt(source.droppableId);
    const destGroup = parseInt(destination.droppableId);

    const nomination = currentGroups.get(sourceGroup)?.at(source.index);
    if (!nomination) return;

    try {
      await updateGroupForNomination(nomination._id, {
        flightNumber,
        groupNumber: destGroup,
        groupName: `${t("competition.group")} ${destGroup}`,
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating nomination:", error);
      notifications.show({
        title: "Error",
        message: "Failed to move athlete to new group",
        color: "red",
      });
    }
  };

  const getAthleteName = (nomination: Nomination) => {
    if (typeof nomination.athleteId === "string") {
      return nomination._id;
    }
    return `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`;
  };

  // Create array of groups based on form value
  const groups = useMemo(() => {
    const numGroups = form.values.numberOfGroups;
    const result = new Map<number, Nomination[]>();
    
    // Initialize all groups
    for (let i = 1; i <= numGroups; i++) {
      result.set(i, []);
    }

    // Get all relevant nominations (either in this flight or unassigned)
    const relevantNominations = nominations.filter(
      (nomination) => !nomination.flightNumber || nomination.flightNumber === flightNumber
    );

    // First, try to maintain existing group assignments
    relevantNominations.forEach((nomination) => {
      if (nomination.groupNumber && nomination.groupNumber <= numGroups) {
        result.get(nomination.groupNumber)?.push(nomination);
      }
    });

    // Then, assign any remaining nominations to the first group
    const unassignedNominations = relevantNominations.filter(
      (nomination) => !nomination.groupNumber || nomination.groupNumber > numGroups
    );
    if (unassignedNominations.length > 0) {
      result.get(1)?.push(...unassignedNominations);
    }

    return result;
  }, [nominations, flightNumber, form.values.numberOfGroups]);

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
              {Array.from(groups.entries()).map(([groupNumber, groupNominations]) => (
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