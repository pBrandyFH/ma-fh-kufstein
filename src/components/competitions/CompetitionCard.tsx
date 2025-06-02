import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { IconCalendar, IconEdit, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getFedTypeColor } from "../federations/utils";
import { Competition, Federation } from "@/types";

interface CompetitionCardProps {
  competition: Competition;
  hostFederation: Federation;
  onClick: (competition: Competition) => void;
  onClickEdit?: (competition: Competition) => void;
}

export default function CompetitionCard({
  competition,
  hostFederation,
  onClick,
  onClickEdit,
}: CompetitionCardProps) {
  return (
    <Card
      key={competition._id}
      withBorder
      sx={(theme) => ({
        marginBottom: "1rem",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[0],
        },
      })}
      onClick={() => {
        onClick(competition);
      }}
    >
      <Stack spacing="xs">
        <Group position="apart">
          <Group>
            <Text size="lg" weight={500}>
              {competition.name}
            </Text>
          </Group>
          <Badge color={getFedTypeColor(hostFederation?.type)}>
            {hostFederation?.type}
          </Badge>
        </Group>

        <Divider />

        <Group position="apart">
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
          {onClickEdit && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onClickEdit(competition);
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
        </Group>
        <Divider />
        <Group spacing="xs">
          <Text size="sm">{hostFederation.name}</Text>
          <Badge color={getFedTypeColor(hostFederation?.type)}>
            {hostFederation.abbreviation}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
