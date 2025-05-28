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
import {
  IconCalendar,
  IconEdit,
  IconPlus,
  IconTrophy,
} from "@tabler/icons-react";
import { format, set } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getFedTypeColor } from "../federations/utils";
import CompetitionFormModal from "./CompetitionFormModal";
import CompetitionDetailsDrawer from "./CompetitionDetailsDrawer";

interface MyCompetitionsProps {
  federation: Federation | null;
}

export default function MyCompetitions({ federation }: MyCompetitionsProps) {
  const { t } = useTranslation();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [compToUpdate, setCompToUpdate] = useState<Competition | null>(null);
  const [compToView, setCompToView] = useState<Competition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
              setCompToView(competition);
              setDrawerOpen(true);
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
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompToUpdate(competition);
                    setEditModalOpened(true);
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
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

      {compToUpdate && (
        <CompetitionFormModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setCompToUpdate(null);
          }}
          onSuccess={handleEditSuccess}
          modalTitle={t("competitions.edit")}
          competitionToEdit={compToUpdate}
          hostFederation={federation}
          isEditMode
        />
      )}
      <CompetitionDetailsDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        competition={compToView}
      />
    </Flex>
  );
}
