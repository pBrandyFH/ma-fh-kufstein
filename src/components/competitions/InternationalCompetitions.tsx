import { useDataFetching } from "@/hooks/useDataFetching";
import { getInternationalCompetitions } from "@/services/competitionService";
import { Competition, Federation } from "@/types";
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

interface InternationalCompetitionsProps {
  federation: Federation | null;
}

export default function InternationalCompetitions({
  federation,
}: InternationalCompetitionsProps) {
  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>({
    fetchFunction: () => getInternationalCompetitions(federation?._id ?? ""),
  });

  return (
    <div>
      {competitions?.map((competition) => {
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
                  <Badge color="blue">International</Badge>
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
              </Stack>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
