import { Federation } from "@/types";
import { Card, Group, Badge, Stack, Text, ActionIcon } from "@mantine/core";
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconWorld,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface FederationCardProps {
  federation: Federation;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onClick: () => void;
}

export function FederationCard({
  federation,
  onEdit,
  onDelete,
  onClick,
}: FederationCardProps) {
  const { t } = useTranslation();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(e);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card withBorder onClick={onClick}>
      <Stack spacing="md">
        <Group position="apart">
          <Group>
            <IconBuilding size={24} />
            <Text weight={500}>{federation.name}</Text>
          </Group>
          <Badge>{federation.type}</Badge>
        </Group>

        <Text size="sm" color="dimmed">
          {federation.abbreviation}
        </Text>

        {federation.contactName && (
          <Text size="sm">
            {t("federations.contact")}: {federation.contactName}
          </Text>
        )}

        <Group spacing="xs">
          {federation.contactEmail && (
            <ActionIcon
              component="a"
              href={`mailto:${federation.contactEmail}`}
              variant="light"
              color="blue"
              onClick={(e) => e.stopPropagation()} // Prevent card click event
            >
              <IconMail size={16} />
            </ActionIcon>
          )}
          {federation.contactPhone && (
            <ActionIcon
              component="a"
              href={`tel:${federation.contactPhone}`}
              variant="light"
              color="blue"
              onClick={(e) => e.stopPropagation()} // Prevent card click event
            >
              <IconPhone size={16} />
            </ActionIcon>
          )}
          {federation.website && (
            <ActionIcon
              component="a"
              href={federation.website}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              color="blue"
              onClick={(e) => e.stopPropagation()} // Prevent card click event
            >
              <IconWorld size={16} />
            </ActionIcon>
          )}
        </Group>

        <Group position="right" mt="md">
          <ActionIcon variant="light" onClick={handleEditClick}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="light" onClick={handleDeleteClick}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}
