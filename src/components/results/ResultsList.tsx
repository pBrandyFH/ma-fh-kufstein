import { useState } from "react";
import {
  Stack,
  TextInput,
  Group,
  Button,
  Card,
  Text,
  Badge,
  Container,
  Title,
  LoadingOverlay,
  Select,
  ActionIcon,
  Tooltip,
  Box,
  Grid,
  SegmentedControl,
  MultiSelect,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  IconSearch,
  IconTrophy,
  IconBuilding,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getAllCompetitions } from "@/services/competitionService";
import type { CompetitionWithAthleteCount } from "@/services/competitionService";
import { getCompetitionType } from "@/utils/competitions/competitionUtils";
import { getAllFederations } from "@/services/federationService";
import type { Federation } from "@/types";

export default function ResultsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    "completed"
  );
  const [selectedFederations, setSelectedFederations] = useState<string[]>([]);

  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<CompetitionWithAthleteCount[]>({
    fetchFunction: getAllCompetitions,
  });

  const { data: federations, loading: federationsLoading } = useDataFetching<
    Federation[]
  >({
    fetchFunction: getAllFederations,
  });

  const loading = competitionsLoading || federationsLoading;

  const filteredCompetitions = competitions?.filter((competition) => {
    const matchesSearch = searchQuery
      ? competition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competition.location
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        competition.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competition.country.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      !selectedStatus || competition.status === selectedStatus;

    // Fix federation filtering for multiple selections
    const hostFederationId = competition.hostFederation._id;

    const matchesFederation =
      selectedFederations.length === 0 ||
      selectedFederations.includes(hostFederationId);

    return matchesSearch && matchesStatus && matchesFederation;
  });

  const getFederationOptions = () => {
    if (!federations) return [];
    return federations.map((federation) => ({
      value: federation._id,
      label: federation.name,
      group: t(`federations.types.${federation.type.toLowerCase()}`),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "ongoing":
        return "blue";
      case "upcoming":
        return "yellow";
      default:
        return "gray";
    }
  };

  const handleCompetitionClick = (competitionId: string) => {
    navigate(`/results/${competitionId}`);
  };

  if (competitionsError) {
    return (
      <Container>
        <Text color="red">{competitionsError}</Text>
      </Container>
    );
  }

  return (
    <Box>
      <LoadingOverlay visible={loading} />
      <Stack spacing="xl">
        <Grid>
          <Grid.Col span={4}>
            <TextInput
              placeholder={t("common.search")}
              icon={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: "100%" }}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <Group position="apart">
              <MultiSelect
                placeholder={t("competitions.selectFederation")}
                data={getFederationOptions()}
                value={selectedFederations}
                onChange={setSelectedFederations}
                clearable
                searchable
                style={{ width: 400 }}
                maxDropdownHeight={400}
                nothingFound={t("common.emptyState.noFederations")}
              />
            </Group>
          </Grid.Col>
        </Grid>

        <SegmentedControl
          fullWidth
          value={selectedStatus || ""}
          onChange={setSelectedStatus}
          data={[
            {
              value: "",
              label: t("competitions.all"),
            },
            {
              value: "completed",
              label: t("competitions.status.completed"),
            },
            {
              value: "ongoing",
              label: t("competitions.status.ongoing"),
            },
            {
              value: "upcoming",
              label: t("competitions.status.upcoming"),
            },
          ]}
          color={selectedStatus ? getStatusColor(selectedStatus) : "gray"}
        />

        <Stack spacing="md">
          {filteredCompetitions?.map((competition) => {
            const hostFederation = competition.hostFederation;

            return (
              <Card
                key={competition._id}
                withBorder
                p="md"
                radius="md"
                style={{ cursor: "pointer" }}
                onClick={() => handleCompetitionClick(competition._id)}
                sx={(theme) => ({
                  transition: "transform box-shadow 150ms ease",
                  "&:hover": {
                    transform: "translateY(1px)",
                    boxShadow: theme.shadows.md,
                  },
                })}
              >
                <Group position="apart" align="flex-start">
                  <Stack spacing="xs" style={{ flex: 1 }}>
                    <Group>
                      <Title order={3}>{competition.name}</Title>
                      <Badge
                        size="lg"
                        color={getStatusColor(competition.status)}
                      >
                        {t(`competitions.status.${competition.status}`)}
                      </Badge>
                    </Group>

                    <Group spacing="xl">
                      <Group spacing="xs">
                        <IconCalendar size={16} />
                        <Text size="sm">
                          {format(new Date(competition.startDate), "PPP")}
                          {competition.endDate &&
                            ` - ${format(
                              new Date(competition.endDate),
                              "PPP"
                            )}`}
                        </Text>
                      </Group>

                      <Group spacing="xs">
                        <IconMapPin size={16} />
                        <Text size="sm">
                          {competition.city}, {competition.country}
                        </Text>
                      </Group>

                      {hostFederation && (
                        <Group spacing="xs">
                          <IconBuilding size={16} />
                          <Stack spacing={2}>
                            <Text size="sm" weight={500}>
                              {hostFederation.name}
                            </Text>
                          </Stack>
                        </Group>
                      )}

                      <Group spacing="xs">
                        <IconTrophy size={16} />
                        <Text size="sm">
                          {t("competitions.athletesCount", {
                            count: competition.athleteCount,
                          })}
                        </Text>
                      </Group>
                    </Group>

                    <Group spacing="xs">
                      <Badge variant="light" color="blue">
                        {t(
                          `competitions.equipmentTypes.${competition.equipmentType}`
                        )}
                      </Badge>
                      {competition.ageCategories.map((category) => (
                        <Badge key={category} variant="light" color="gray">
                          {t(`competitions.ageCategories.${category}`)}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Group>
              </Card>
            );
          })}

          {filteredCompetitions?.length === 0 && (
            <Text align="center" color="dimmed" py="xl">
              {t("common.emptyState.noCompetitions")}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
