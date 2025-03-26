import { useState, useEffect } from "react";
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

interface CompetitionsListProps {
  federations: Federation[];
}

export function DashboardCompetitionsList({
  federations,
}: CompetitionsListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedFederation, setSelectedFederation] = useState<string | null>(
    null
  );
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    Competition[]
  >([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("upcoming");
  const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer visibility
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null); // State for selected competition

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const response = await getEligibleCompetitions();
        console.log("Competitions API Response:", response);
        if (response.success) {
          setCompetitions(response.data || []);
          console.log("Set competitions:", response.data);
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Update the filtering logic in the second useEffect
  useEffect(() => {
    console.log("Selected Federation:", selectedFederation);
    console.log("All Competitions:", competitions);

    if (!selectedFederation) {
      setFilteredCompetitions(
        competitions.filter((comp) => comp.status === selectedStatus)
      );
      console.log(
        "No federation selected, showing filtered competitions:",
        competitions
      );
      return;
    }

    const filtered = competitions.filter((comp) => {
      const eligibleFederations = comp.eligibleFederationIds.map((fed) => {
        if (typeof fed === "string") return fed;
        return fed._id;
      });
      console.log("Competition eligible federations:", eligibleFederations);
      console.log("Checking if federation is eligible:", selectedFederation);

      return (
        eligibleFederations.includes(selectedFederation) &&
        comp.status === selectedStatus
      ); // Filter by status
    });
    console.log("Filtered competitions:", filtered);
    setFilteredCompetitions(filtered);
  }, [competitions, selectedFederation, selectedStatus]); // Add selectedStatus to dependencies

  const getFederationOptions = () => {
    if (!user) return [];

    switch (user.role) {
      case "internationalAdmin":
        return federations
          .filter((fed) => fed.type === "national")
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "continentalAdmin":
        return federations
          .filter(
            (fed) =>
              fed.type === "national" &&
              fed.parentFederation === user.federationId
          )
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "stateAdmin":
        return federations
          .filter(
            (fed) =>
              (fed.type === "national" && fed._id === user.federationId) ||
              (fed.type === "federalState" &&
                fed.parentFederation === user.federationId)
          )
          .map((fed) => ({
            value: fed._id,
            label: fed.name,
          }));

      case "federalStateAdmin":
        return federations
          .filter(
            (fed) =>
              (fed.type === "national" && fed._id === user.federationId) ||
              (fed.type === "federalState" && fed._id === user.federationId)
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
        {/* Button Group for Status Filter */}
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
          {filteredCompetitions.map((competition) => {
            const hostFederation =
              typeof competition.hostFederationId === "string"
                ? federations.find(
                    (f) => f._id === competition.hostFederationId
                  )
                : competition.hostFederationId;

            return (
              <Card
                key={competition._id}
                withBorder
                onClick={() => handleCardClick(competition)}
                style={{ cursor: "pointer" }}
              >
                <Stack spacing="xs">
                  <Group position="apart">
                    <Text size="lg" weight={500}>
                      {competition.name}
                    </Text>
                    <Badge color="blue">
                      {getCompetitionType(competition, federations)}
                    </Badge>
                  </Group>

                  <Divider />

                  <Group spacing="xl">
                    <Group spacing="xs">
                      <IconCalendar size={16} />
                      <Text size="sm">
                        {format(new Date(competition.startDate), "PPP")}
                        {competition.endDate &&
                          ` - ${format(new Date(competition.endDate), "PPP")}`}
                      </Text>
                    </Group>

                    <Group spacing="xs">
                      <IconTrophy size={16} />
                      <Text size="sm">{competition.location}</Text>
                    </Group>

                    <Group spacing="xs">
                      <IconBuilding size={16} />
                      <Text size="sm">{hostFederation?.name || ""}</Text>
                    </Group>
                  </Group>

                  <Group position="apart" mt="xs">
                    <Badge
                      color={
                        competition.status === "upcoming"
                          ? "green"
                          : competition.status === "ongoing"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {t(`dashboard.competitionsTab.status.${competition.status}`)}
                    </Badge>
                    <Button variant="subtle" size="sm">
                      {t("common.viewDetails")}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            );
          })}
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
        federations={federations}
      />
    </Container>
  );
}
