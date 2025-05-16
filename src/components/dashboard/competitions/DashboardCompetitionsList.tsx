import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Text,
  Select,
  Stack,
  Group,
  Badge,
  Loader,
  Title,
  Button,
  Divider,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { IconTrophy, IconBuilding, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { getEligibleCompetitions } from "../../../services/competitionService";
import type { Competition, Federation } from "../../../types";
import { DashboardCompetitionDrawer } from "./DashboardCompetitionDrawer";
import { getCompetitionType } from "@/utils/competitions/competitionUtils";
import { useDataFetching } from "../../../hooks/useDataFetching"; // Import the custom hook
import { getAllFederations } from "@/services/federationService";
import { CompetitionCard } from "@/components/competitions/legacy/CompetitionCard";

export function DashboardCompetitionsList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedFederation, setSelectedFederation] = useState<string | null>(
    null
  );
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    Competition[]
  >([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("upcoming");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);

  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>(getEligibleCompetitions);
  const {
    data: federations,
    loading: federationsLoading,
    error: federationsError,
  } = useDataFetching<Federation[]>(getAllFederations);

  const loading = competitionsLoading || federationsLoading;
  const error = competitionsError || federationsError;

  useEffect(() => {
    if (!competitions) return;

    if (!selectedFederation) {
      setFilteredCompetitions(
        competitions.filter((comp) => comp.status === selectedStatus)
      );
      return;
    }

    const filtered = competitions.filter((comp) => {
      const eligibleFederations = comp.eligibleFederationIds.map((fed) => {
        if (typeof fed === "string") return fed;
        return fed._id;
      });

      return (
        eligibleFederations.includes(selectedFederation) &&
        comp.status === selectedStatus
      );
    });

    setFilteredCompetitions(filtered);
  }, [competitions, selectedFederation, selectedStatus]);

  const getFederationOptions = () => {
    if (!user || !federations) return [];

    switch (user.role) {
      case "internationalAdmin":
        return federations
          .filter((fed) => fed.type === "NATIONAL")
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "continentalAdmin":
        return federations
          .filter(
            (fed) =>
              fed.type === "NATIONAL" &&
              fed.parent?._id === user.federationId
          )
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "stateAdmin":
        return federations
          .filter(
            (fed) =>
              (fed.type === "NATIONAL" && fed._id === user.federationId) ||
              (fed.type === "STATE" &&
                fed.parent?._id === user.federationId)
          )
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "federalStateAdmin":
        return federations
          .filter(
            (fed) =>
              (fed.type === "NATIONAL" && fed._id === user.federationId) ||
              (fed.type === "STATE" && fed._id === user.federationId)
          )
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      default:
        return [];
    }
  };

  const handleCardClick = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text color="red">Error fetching competitions: {error}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={2}>{t("competitions.title")}</Title>
          <Select
            placeholder={t("competitions.selectFederation")}
            data={getFederationOptions()}
            value={selectedFederation}
            onChange={setSelectedFederation}
            clearable
            style={{ width: 300 }}
          />
        </Group>
        <Group>
          <Button
            variant={selectedStatus === "upcoming" ? "filled" : "outline"}
            onClick={() => setSelectedStatus("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={selectedStatus === "ongoing" ? "filled" : "outline"}
            onClick={() => setSelectedStatus("ongoing")}
          >
            Ongoing
          </Button>
          <Button
            variant={selectedStatus === "completed" ? "filled" : "outline"}
            onClick={() => setSelectedStatus("completed")}
          >
            Completed
          </Button>
        </Group>

        <Stack spacing="md">
          {filteredCompetitions.map((competition) => (
            <CompetitionCard
              key={competition._id}
              competition={competition}
              federations={federations ?? []}
              onClick={() => {
                setSelectedCompetition(competition);
                setDrawerOpen(true);
              }}
            />
          ))}
        </Stack>

        {filteredCompetitions.length === 0 && (
          <Text align="center" color="dimmed">
            {t("common.emptyState.noCompetitions")}
          </Text>
        )}
      </Stack>
      <DashboardCompetitionDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        competition={selectedCompetition}
        federations={federations ?? []}
      />
    </Container>
  );
}

