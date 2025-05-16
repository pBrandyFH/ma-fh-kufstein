import { Federation } from "@/types";
import {
  Container,
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Title,
  Anchor,
  Grid,
  Paper,
} from "@mantine/core";
import {
  IconMail,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconBuilding,
} from "@tabler/icons-react";
import { getFedTypeColor } from "./utils";

interface FederationInfoProps {
  federation: Federation | null;
}

export default function FederationInfo({ federation }: FederationInfoProps) {
  if (!federation) {
    return (
      <Container>
        <Text c="dimmed">No federation information available</Text>
      </Container>
    );
  }

  return (
    <Stack spacing="md">
      <Group position="apart" align="flex-start">
        <Stack spacing={0}>
          <Title order={2}>{federation.name}</Title>
          <Text size="sm" c="dimmed">
            {federation.abbreviation}
          </Text>
        </Stack>
        <Badge size="lg" color={getFedTypeColor(federation.type)}>
          {federation.type}
        </Badge>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">
          Contact Information
        </Title>
        <Grid>
          {federation.contactName && (
            <Grid.Col span={6}>
              <Group spacing="xs">
                <IconBuilding size={16} />
                <Text>{federation.contactName}</Text>
              </Group>
            </Grid.Col>
          )}
          {federation.contactEmail && (
            <Grid.Col span={6}>
              <Group spacing="xs">
                <IconMail size={16} />
                <Anchor href={`mailto:${federation.contactEmail}`}>
                  {federation.contactEmail}
                </Anchor>
              </Group>
            </Grid.Col>
          )}
          {federation.contactPhone && (
            <Grid.Col span={6}>
              <Group spacing="xs">
                <IconPhone size={16} />
                <Anchor href={`tel:${federation.contactPhone}`}>
                  {federation.contactPhone}
                </Anchor>
              </Group>
            </Grid.Col>
          )}
          {federation.website && (
            <Grid.Col span={6}>
              <Group spacing="xs">
                <IconWorld size={16} />
                <Anchor
                  href={federation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {federation.website}
                </Anchor>
              </Group>
            </Grid.Col>
          )}
        </Grid>
      </Paper>

      {(federation.address || federation.city || federation.country) && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">
            Location
          </Title>
          <Group spacing="xs">
            <IconMapPin size={16} />
            <Text>
              {[federation.address, federation.city, federation.country]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </Group>
        </Paper>
      )}

      {federation.parent && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">
            Federation Structure
          </Title>
          <Text>Parent Federation: {federation.parent.name}</Text>
          {federation.children.length > 0 && (
            <Text mt="xs">Sub-federations: {federation.children.length}</Text>
          )}
        </Paper>
      )}
    </Stack>
  );
}
