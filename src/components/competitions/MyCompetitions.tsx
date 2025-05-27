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
import { IconCalendar, IconEdit, IconPlus, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getFedTypeColor } from "../federations/utils";
import CompetitionFormModal from "./CompetitionFormModal";

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
    refetch: refetchComps,
  } = useDataFetching<Competition[]>({
    fetchFunction: () =>
      getCompetitionByHostFederationId(federation?._id ?? ""),
  });

  const handleEditSuccess = () => {
    setEditModalOpened(false);
    refetchComps();
  };

  const handleCreateSuccess = () => {
    setCreateModalOpened(false);
    refetchComps();
  };

  if (!federation) {
    return <div>no fed</div>;
  }

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
        const hostFederation = competition.hostFederation;
        return (
          <Card
            key={competition._id}
            withBorder
            style={{ marginBottom: "1rem" }}
          >
            <Stack spacing="xs">
              <Group position="apart">
                <Group>
                  <Text size="lg" weight={500}>
                    {competition.name}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCompetition(competition);
                      setEditModalOpened(true);
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
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
            </Stack>
          </Card>
        );
      })}

      <CompetitionFormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        modalTitle={t("competitions.add", {
          parentFederation: federation?.name,
        })}
        hostFederation={federation}
      />

      {selectedCompetition && (
        <CompetitionFormModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setSelectedCompetition(null);
          }}
          onSuccess={handleEditSuccess}
          modalTitle={t("competitions.edit")}
          competitionToEdit={selectedCompetition}
          hostFederation={federation}
          isEditMode
        />
      )}
    </Flex>
  );
}
