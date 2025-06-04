import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Group,
  Paper,
  MultiSelect,
  Stack,
  Text,
  Title,
  ActionIcon,
  Tooltip,
  Badge,
  Grid,
  Card,
  Divider,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconPlus, IconEdit, IconUsers, IconClock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Nomination, WeightCategory, Flight, Group as GroupType } from "@/types";
import {
  femaleCategories,
  getGenderFromWeightCategory,
  maleCategories,
} from "@/utils/weightCategories";
import { QueryObserverResult } from "@tanstack/react-query";
import { ApiResponse } from "@/types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getFlightsByCompetition } from "@/services/flightService";

interface GroupTabProps {
  competitionId: string;
  nominations: Nomination[];
  onNominationsUpdated: () => Promise<
    QueryObserverResult<ApiResponse<Nomination[]>, Error>
  >;
}

// Add helper function to sort weight categories
const sortWeightCategories = (
  categories: [WeightCategory, number][],
  gender: "male" | "female"
) => {
  const weightOrder =
    gender === "female"
      ? femaleCategories.map((cat) => cat.value)
      : maleCategories.map((cat) => cat.value);

  return categories
    .filter(([category]) => weightOrder.includes(category))
    .sort((a, b) => {
      const aIndex = weightOrder.indexOf(a[0]);
      const bIndex = weightOrder.indexOf(b[0]);
      return aIndex - bIndex;
    });
};

// Add helper function to count athletes by gender
const countAthletesByGender = (
  nominations: Nomination[],
  gender: "male" | "female"
) => {
  return nominations.filter((n) =>
    gender === "male"
      ? maleCategories.some((cat) => cat.value === n.weightCategory)
      : femaleCategories.some((cat) => cat.value === n.weightCategory)
  ).length;
};

// Add helper function to count unassigned athletes in a category
const countUnassignedAthletes = (
  nominations: Nomination[],
  category: WeightCategory
) => {
  return nominations.filter(
    (n) => n.weightCategory === category && !n.groupId
  ).length;
};

export default function GroupTab({
  competitionId,
  nominations,
  onNominationsUpdated,
}: GroupTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedWeightCategories, setSelectedWeightCategories] = useState<
    WeightCategory[]
  >([]);

  // Fetch flights for the competition
  const {
    data: flights,
    loading: loadingFlights,
    error: flightsError,
  } = useDataFetching<Flight[]>({
    fetchFunction: () => getFlightsByCompetition(competitionId),
    dependencies: [competitionId],
    skip: !competitionId,
  });

  // Filter nominations by selected weight categories - only for statistics
  const filteredNominationsForStats = useMemo(() => {
    if (!nominations || selectedWeightCategories.length === 0)
      return nominations || [];
    return nominations.filter((n) =>
      selectedWeightCategories.includes(n.weightCategory)
    );
  }, [nominations, selectedWeightCategories]);

  // Calculate statistics for weight categories - using filtered nominations
  const weightCategoryStats = useMemo(() => {
    if (!filteredNominationsForStats) return new Map<string, number>();

    const stats = new Map<string, number>();
    filteredNominationsForStats.forEach((nomination) => {
      const key = nomination.weightCategory;
      stats.set(key, (stats.get(key) || 0) + 1);
    });

    return stats;
  }, [filteredNominationsForStats]);

  // Calculate total counts for each gender - using filtered nominations
  const totalFemaleAthletes = useMemo(
    () => countAthletesByGender(filteredNominationsForStats, "female"),
    [filteredNominationsForStats]
  );

  const totalMaleAthletes = useMemo(
    () => countAthletesByGender(filteredNominationsForStats, "male"),
    [filteredNominationsForStats]
  );

  const handleCreateFlight = () => {
    const newFlightNumber = (flights?.length || 0) + 1;
    navigate(
      `/competitions/${competitionId}/flights/new?weightCategories=${selectedWeightCategories.join(
        ","
      )}&flightNumber=${newFlightNumber}`
    );
  };

  const handleEditFlight = (flight: Flight) => {
    // Get weight categories for this flight
    const flightNominations = flight.groups.flatMap(g => g.nominations);
    const flightWeightCategories = Array.from(
      new Set(flightNominations.map((n) => n.weightCategory))
    );

    // Navigate with weight categories and number of groups as URL parameters
    navigate(
      `/competitions/${competitionId}/flights/${flight._id}/edit?weightCategories=${flightWeightCategories.join(
        ","
      )}&numberOfGroups=${flight.groups.length}`
    );
  };

  const getAthleteName = (nomination: Nomination) => {
    if (typeof nomination.athleteId === "string") {
      return nomination._id;
    }
    return `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`;
  };

  if (flightsError) {
    return (
      <Stack>
        <Text color="red">{t("competition.errorLoadingFlights")}</Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      <Paper withBorder p="md">
        <Stack>
          <Group position="apart">
            <Title order={3}>{t("competition.groupManagement")}</Title>
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={handleCreateFlight}
              disabled={selectedWeightCategories.length === 0}
            >
              {t("competition.createFlight")}
            </Button>
          </Group>

          <MultiSelect
            label={t("competition.weightCategories")}
            placeholder={t("competition.selectWeightCategories")}
            data={[...maleCategories, ...femaleCategories]}
            value={selectedWeightCategories}
            onChange={(value) =>
              setSelectedWeightCategories(value as WeightCategory[])
            }
            searchable
            clearable
          />
        </Stack>
      </Paper>

      {/* Weight Category Statistics */}
      <Paper withBorder p="md">
        <Title order={4} mb="md">
          {t("competition.weightCategoryDistribution")}
        </Title>
        <Grid>
          {/* Female Categories */}
          <Grid.Col span={6}>
            <Stack spacing="xs">
              <Group position="apart" mb="xs">
                <Text weight={500} color="dimmed" size="sm">
                  {t("athletes.female")}
                </Text>
                <Badge size="lg" variant="filled" color="grape">
                  {totalFemaleAthletes}
                </Badge>
              </Group>
              {sortWeightCategories(
                Array.from(weightCategoryStats.entries()).filter(([category]) =>
                  femaleCategories.some((cat) => cat.value === category)
                ) as [WeightCategory, number][],
                "female"
              ).map(([category, count]) => {
                const unassignedCount = countUnassignedAthletes(
                  filteredNominationsForStats,
                  category
                );
                return (
                  <Card key={category} withBorder>
                    <Group position="apart">
                      <Group spacing="xs">
                        <Text>
                          {t(`athletes.weightCategories.female.${category}`)}
                        </Text>
                        {unassignedCount > 0 && (
                          <Tooltip withinPortal label={t("competition.unassignedAthletes")}>
                            <Badge size="sm" color="yellow" variant="filled">
                              {unassignedCount}
                            </Badge>
                          </Tooltip>
                        )}
                      </Group>
                      <Badge size="lg">{count}</Badge>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </Grid.Col>

          {/* Divider */}
          <Grid.Col span={1}>
            <Box
              sx={{
                height: "100%",
                borderLeft: "1px solid var(--mantine-color-gray-3)",
                margin: "0 auto",
                width: 1,
              }}
            />
          </Grid.Col>

          {/* Male Categories */}
          <Grid.Col span={5}>
            <Stack spacing="xs">
              <Group position="apart" mb="xs">
                <Text weight={500} color="dimmed" size="sm">
                  {t("athletes.male")}
                </Text>
                <Badge size="lg" variant="filled" color="blue">
                  {totalMaleAthletes}
                </Badge>
              </Group>
              {sortWeightCategories(
                Array.from(weightCategoryStats.entries()).filter(([category]) =>
                  maleCategories.some((cat) => cat.value === category)
                ) as [WeightCategory, number][],
                "male"
              ).map(([category, count]) => {
                const unassignedCount = countUnassignedAthletes(
                  filteredNominationsForStats,
                  category
                );
                return (
                  <Card key={category} withBorder>
                    <Group position="apart">
                      <Group spacing="xs">
                        <Text>
                          {t(`athletes.weightCategories.male.${category}`)}
                        </Text>
                        {unassignedCount > 0 && (
                          <Tooltip withinPortal label={t("competition.unassignedAthletes")}>
                            <Badge size="sm" color="yellow" variant="filled">
                              {unassignedCount}
                            </Badge>
                          </Tooltip>
                        )}
                      </Group>
                      <Badge size="lg">{count}</Badge>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Flights and Groups */}
      {flights?.map((flight) => (
        <Paper key={flight._id} withBorder p="md">
          <Group position="apart" mb="md">
            <Group>
              <Title order={4}>
                {t("competition.flight")} {flight.number}
              </Title>
              <Badge 
                color={
                  flight.status === "completed" ? "green" :
                  flight.status === "inProgress" ? "blue" :
                  "gray"
                }
              >
                {t(`competition.flightStatus.${flight.status}`)}
              </Badge>
              {flight.startTime && (
                <Group spacing="xs">
                  <IconClock size={16} />
                  <Text size="sm" color="dimmed">
                    {new Date(flight.startTime).toLocaleTimeString()}
                  </Text>
                </Group>
              )}
            </Group>
            <Group>
              <Text size="sm" color="dimmed">
                {flight.groups.reduce(
                  (acc, group) => acc + group.nominations.length,
                  0
                )}{" "}
                {t("competition.athletes")}
              </Text>
              <Tooltip label={t("competition.editFlight")}>
                <ActionIcon
                  variant="light"
                  onClick={() => handleEditFlight(flight)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Grid>
            {flight.groups.map((group) => (
              <Grid.Col key={group._id} span={12 / flight.groups.length}>
                <Paper withBorder p="md">
                  <Group position="apart" mb="xs">
                    <Group>
                      <Text weight={500}>
                        {t("competition.groupNumber", { groupNumber: group.number })}
                      </Text>
                    </Group>
                    <Group spacing="xs">
                      <Tooltip label={t("competition.athletes")}>
                        <Group spacing={4}>
                          <IconUsers size={16} />
                          <Text size="sm">{group.nominations.length}</Text>
                        </Group>
                      </Tooltip>
                    </Group>
                  </Group>

                  {group.startTime && (
                    <Text size="sm" color="dimmed" mb="xs">
                      {new Date(group.startTime).toLocaleTimeString()}
                    </Text>
                  )}

                  <Stack spacing="xs">
                    {group.nominations.map((nomination) => (
                      <Paper key={nomination._id} p="xs" withBorder>
                        <Group position="apart" spacing="xs">
                          <Text size="sm">{getAthleteName(nomination)}</Text>
                          <Badge size="sm" variant="light">
                            {t(
                              `athletes.weightCategories.${getGenderFromWeightCategory(
                                nomination.weightCategory
                              )}.${nomination.weightCategory}`
                            )}
                          </Badge>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Paper>
      ))}

      {(!flights || flights.length === 0) && (
        <Paper withBorder p="xl">
          <Stack align="center" spacing="xs">
            <Text color="dimmed">{t("competition.noFlightsCreated")}</Text>
            <Text size="sm" color="dimmed">
              {t("competition.selectWeightCategoriesToCreate")}
            </Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
