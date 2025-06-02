import { Competition, Nomination } from "@/types";
import {
  Drawer,
  Stack,
  Text,
  Group,
  Paper,
  Title,
  Divider,
  Badge,
  Box,
  Tabs,
  Button,
} from "@mantine/core";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { IconInfoCircle, IconUsers, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import NominationDrawer from "../nominations/NominationDrawer";
import { getNominationsByCompetitionId } from "@/services/nominationService";
import { useDataFetching } from "@/hooks/useDataFetching";
import CompetitionNominationsList from "../nominations/CompetitionNominationsList";

interface CompetitionDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  competition: Competition | null;
}

export default function CompetitionDetailsDrawer({
  opened,
  onClose,
  competition,
}: CompetitionDetailsDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={null}
      padding="xl"
      size="80rem"
      position="right"
      overlayProps={{ blur: 4 }}
    >
      {competition && (
        <Stack spacing="lg">
          <Box mb="md">
            <Title order={1} mb="xs">
              {competition.name}
            </Title>
            <Badge
              size="lg"
              color={
                competition.status === "ongoing"
                  ? "green"
                  : competition.status === "upcoming"
                  ? "blue"
                  : "gray"
              }
            >
              {t(`competitions.status.${competition.status}`)}
            </Badge>
          </Box>

          <Tabs defaultValue="info">
            <Tabs.List>
              <Tabs.Tab value="info" icon={<IconInfoCircle size={16} />}>
                {t("competition.tabs.info")}
              </Tabs.Tab>
              <Tabs.Tab value="nominations" icon={<IconUsers size={16} />}>
                {t("competition.tabs.nominations")}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="info" pt="md">
              <Stack spacing="lg">
                {/* Basic Information */}
                <Paper p="md" withBorder>
                  <Title order={3} mb="md">
                    {t("competitions.basicInfo")}
                  </Title>
                  <Stack spacing="xs">
                    <Group>
                      <Text weight={500}>{t("competitions.type")}:</Text>
                      <Text>
                        {t(
                          `competitions.equipmentType.${competition.equipmentType}`
                        )}
                      </Text>
                    </Group>
                    <Group>
                      <Text weight={500}>{t("competitions.dates")}:</Text>
                      <Text>
                        {format(new Date(competition.startDate), "PPP")}
                        {competition.endDate &&
                          ` - ${format(new Date(competition.endDate), "PPP")}`}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Location Information */}
                <Paper p="md" withBorder>
                  <Title order={3} mb="md">
                    {t("competitions.locationInfo")}
                  </Title>
                  <Stack spacing="xs">
                    <Group>
                      <Text weight={500}>{t("competitions.location")}:</Text>
                      <Text>{competition.location}</Text>
                    </Group>
                    {competition.address && (
                      <Group>
                        <Text weight={500}>{t("competitions.address")}:</Text>
                        <Text>{competition.address}</Text>
                      </Group>
                    )}
                    <Group>
                      <Text weight={500}>{t("competitions.city")}:</Text>
                      <Text>{competition.city}</Text>
                    </Group>
                    <Group>
                      <Text weight={500}>{t("competitions.country")}:</Text>
                      <Text>{competition.country}</Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Competition Details */}
                <Paper p="md" withBorder>
                  <Title order={3} mb="md">
                    {t("competitions.details")}
                  </Title>
                  <Stack spacing="xs">
                    <Group>
                      <Text weight={500}>
                        {t("competitions.hostFederation")}:
                      </Text>
                      <Text>
                        {typeof competition.hostFederation === "string"
                          ? competition.hostFederation
                          : competition.hostFederation.name}
                      </Text>
                    </Group>
                    {competition.hostMember && (
                      <Group>
                        <Text weight={500}>
                          {t("competitions.hostMember")}:
                        </Text>
                        <Text>
                          {typeof competition.hostMember === "string"
                            ? competition.hostMember
                            : competition.hostMember.name}
                        </Text>
                      </Group>
                    )}
                    <Group>
                      <Text weight={500}>{t("competitions.ageCategory")}:</Text>
                      <Group>
                        {competition.ageCategories.map((category) => (
                          <Badge key={category}>
                            {t(`competitions.ageCategories.${category}`)}
                          </Badge>
                        ))}
                      </Group>
                    </Group>
                    {competition.description && (
                      <Group>
                        <Text weight={500}>
                          {t("competitions.description")}:
                        </Text>
                        <Text>{competition.description}</Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="nominations" pt="md">
              <Stack spacing="lg">
                {/* Nomination Information */}
                <Paper p="md" withBorder>
                  <Title order={3} mb="md">
                    {t("competitions.nominationInfo")}
                  </Title>
                  <Stack spacing="xs">
                    <Group>
                      <Text weight={500}>
                        {t("competitions.nominationStart")}:
                      </Text>
                      <Text>
                        {format(new Date(competition.nominationStart), "PPP")}
                      </Text>
                    </Group>
                    <Group>
                      <Text weight={500}>
                        {t("competitions.nominationDeadline")}:
                      </Text>
                      <Text>
                        {format(
                          new Date(competition.nominationDeadline),
                          "PPP"
                        )}
                      </Text>
                    </Group>
                    <Group>
                      <Text weight={500}>
                        {t("competitions.eligibleFederations")}:
                      </Text>
                      <Group>
                        {competition.eligibleFederations.map((federation) => (
                          <Badge
                            key={
                              typeof federation === "string"
                                ? federation
                                : federation._id
                            }
                          >
                            {typeof federation === "string"
                              ? federation
                              : federation.name}
                          </Badge>
                        ))}
                      </Group>
                    </Group>
                  </Stack>
                </Paper>

                {/* Placeholder for nominations list - to be implemented */}
                <Paper p="md" withBorder>
                  <CompetitionNominationsList competition={competition} />
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}
    </Drawer>
  );
}
