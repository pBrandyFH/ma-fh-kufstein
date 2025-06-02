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
import CompetitionCard from "./CompetitionCard";

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
        const handleEdit = () => {
          setCompToUpdate(competition);
          setEditModalOpened(true);
        };

        const handleClick = () => {
          setCompToView(competition);
          setDrawerOpen(true);
        };
        return (
          <CompetitionCard
            key={competition._id}
            competition={competition}
            hostFederation={hostFederation}
            onClick={handleClick}
            onClickEdit={handleEdit}
          />
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
