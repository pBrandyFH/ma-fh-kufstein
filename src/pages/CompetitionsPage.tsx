import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Badge,
  Group,
  Button,
  Stack,
  TextInput,
  Select,
  Card,
  ActionIcon,
  Box,
  Paper,
  Grid,
  LoadingOverlay,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { IconUsers, IconCalendar, IconMapPin, IconBarbell, IconSearch, IconEye } from "@tabler/icons-react";
import { getAllCompetitions, type CompetitionWithAthleteCount } from "../services/competitionService";
import type { Federation } from "../types";

export function CompetitionsPage() {
  const { t } = useTranslation();
  const [competitions, setCompetitions] = useState<CompetitionWithAthleteCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFederation, setSelectedFederation] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCompetitions();
        if (response.success && response.data) {
          setCompetitions(response.data);
        } else {
          setError(response.error || "Failed to fetch competitions");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Get unique federations and years for filters
  const { federations, years } = useMemo(() => {
    const uniqueFederations = Array.from(new Set(competitions.map(c => 
      typeof c.hostFederationId === 'string' ? c.hostFederationId : c.hostFederationId._id
    )));
    const uniqueYears = Array.from(new Set(competitions.map(c => 
      format(new Date(c.startDate), "yyyy")
    ))).sort((a, b) => b.localeCompare(a)); // Sort years in descending order

    return {
      federations: uniqueFederations.map(id => ({
        value: id,
        label: typeof id === 'string' ? `Federation ${id.replace("federation", "")}` : (id as Federation).name
      })),
      years: uniqueYears.map(year => ({
        value: year,
        label: year
      }))
    };
  }, [competitions]);

  // Filter competitions based on search and filters
  const filteredCompetitions = useMemo(() => {
    return competitions.filter(competition => {
      const federationId = typeof competition.hostFederationId === 'string' 
        ? competition.hostFederationId 
        : competition.hostFederationId._id;
      
      const matchesSearch = competition.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFederation = !selectedFederation || federationId === selectedFederation;
      const matchesYear = !selectedYear || format(new Date(competition.startDate), "yyyy") === selectedYear;
      
      return matchesSearch && matchesFederation && matchesYear;
    });
  }, [competitions, searchQuery, selectedFederation, selectedYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "ongoing":
        return "green";
      case "completed":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    return t(`competitions.status.${status}`);
  };

  const getEquipmentTypeText = (type: string) => {
    return t(`competitions.equipmentType.${type}`);
  };

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={1}>{t("competitions.title")}</Title>
          <Button>{t("competitions.createNew")}</Button>
        </Group>

        <Paper p="md" withBorder pos="relative">
          <LoadingOverlay visible={loading} />
          
          {error ? (
            <Text color="red" align="center">{error}</Text>
          ) : (
            <Stack spacing="md">
              <Group grow>
                <TextInput
                  placeholder={t("common.search")}
                  icon={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
                <Select
                  placeholder={t("competitions.selectFederation")}
                  data={federations}
                  value={selectedFederation}
                  onChange={setSelectedFederation}
                  clearable
                />
                <Select
                  placeholder={t("competitions.selectYear")}
                  data={years}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  clearable
                />
              </Group>

              {filteredCompetitions.length === 0 ? (
                <Text align="center" color="dimmed">{t("competitions.noCompetitions")}</Text>
              ) : (
                <Grid>
                  {filteredCompetitions.map((competition) => (
                    <Grid.Col key={competition._id} span={12}>
                      <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group position="apart" mb="xs">
                          <Title order={3}>{competition.name}</Title>
                          <Group>
                            <Badge color={getStatusColor(competition.status)}>
                              {getStatusText(competition.status)}
                            </Badge>
                            <ActionIcon color="blue" variant="light">
                              <IconEye size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        <Stack spacing="xs">
                          <Group spacing="xs">
                            <IconCalendar size={16} />
                            <Text size="sm">
                              {format(new Date(competition.startDate), "PPP")}
                              {competition.endDate && ` - ${format(new Date(competition.endDate), "PPP")}`}
                            </Text>
                          </Group>

                          <Group spacing="xs">
                            <IconMapPin size={16} />
                            <Text size="sm">{competition.location}, {competition.city}</Text>
                          </Group>

                          <Group spacing="xs">
                            <IconBarbell size={16} />
                            <Text size="sm">{getEquipmentTypeText(competition.equipmentType)}</Text>
                          </Group>

                          <Group spacing="xs">
                            <IconUsers size={16} />
                            <Text size="sm">{competition.athleteCount} {t("common.athletes")}</Text>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
} 