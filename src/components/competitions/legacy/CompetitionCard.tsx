// src/components/CompetitionCard.tsx
import { Competition, Federation } from "@/types";
import { getCompetitionType } from "@/utils/competitions/competitionUtils";
import { Card, Text, Group, Badge, Divider, Stack } from "@mantine/core";
import { IconTrophy, IconBuilding, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";

interface CompetitionCardProps {
  competition: Competition;
  federations: Federation[];
  onClick: () => void;
}

export function CompetitionCard({
  competition,
  federations,
  onClick,
}: CompetitionCardProps) {
  const hostFederation =
    typeof competition.hostFederationId === "string"
      ? federations.find((f) => f._id === competition.hostFederationId)
      : competition.hostFederationId;

  return (
    <Card withBorder onClick={onClick} style={{ cursor: "pointer" }}>
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
            {competition.status}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
