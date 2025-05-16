import { useDataFetching } from "@/hooks/useDataFetching";
import { getCompetitionByHostFederationId } from "@/services/competitionService";
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
  Flex,
  Box,
} from "@mantine/core";
import { IconCalendar, IconPlus, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface MyCompetitionsProps {
  federation: Federation | null;
}

export default function MyCompetitions({ federation }: MyCompetitionsProps) {
  const { t } = useTranslation();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>({
    fetchFunction: () =>
      getCompetitionByHostFederationId(federation?._id ?? ""),
  });

  return (
    <Flex direction="column" gap="sm">
      <Box>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => setCreateModalOpened(true)}
        >
          {t("competition.create")}
        </Button>
      </Box>
      {competitions?.map((competition) => {
        return (
          <Card
            key={competition._id}
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
        );
      })}
    </Flex>
  );
}
