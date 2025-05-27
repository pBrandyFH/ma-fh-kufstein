import { useDataFetching } from "@/hooks/useDataFetching";
import { Competition, Federation } from "@/types";
import { getNationalCompetitions } from "@/services/competitionService";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Loader,
  SimpleGrid,
  ActionIcon,
  Menu,
  Badge,
  Select,
  Stack,
  Divider,
} from "@mantine/core";
import { IconCalendar, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { getFedTypeColor } from "../federations/utils";

interface NationalCompetitionsProps {
  federation: Federation | null;
}

export default function NationalCompetitions({
  federation,
}: NationalCompetitionsProps) {
  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>({
    fetchFunction: () => getNationalCompetitions(federation?._id ?? ""),
  });

  return (
    <div>
      {competitions?.map((competition) => {
        const hostFederation = competition.hostFederation;
        return (
          <div key={competition._id} className="competition-card">
            <Card
              withBorder
              style={{ cursor: "pointer", marginBottom: "1rem" }}
            >
              <Stack spacing="xs">
                <Group position="apart">
                  <Text size="lg" weight={500}>
                    {competition.name}
                  </Text>
                  <Badge color={getFedTypeColor(hostFederation?.type)}>
                    {hostFederation?.type}
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
                </Group>

                <Divider />

                <Group spacing="xs">
                  <Text size="sm" weight={500}>
                    Host Federation:
                  </Text>
                  <Text size="sm">
                    {hostFederation?.name} ({hostFederation?.abbreviation})
                  </Text>
                </Group>
              </Stack>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
