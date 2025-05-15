import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Grid,
  Group,
  Badge,
  Stack,
  Loader,
  Button,
  ActionIcon,
} from "@mantine/core";
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconWorld,
  IconPlus,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { getFederationsByTypeFilter } from "../../../services/federationService";
import type { Federation } from "../../../types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { FederationCard } from "@/components/federations/FederationCard";
import { DashboardFederationDrawer } from "./DashboardFederationDrawer";
import { useNavigate } from "react-router-dom";
import { FederationFormModal } from "@/components/federations/legacy/FederationFormModal";

export function DashboardInternationalFederationsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedFederation, setSelectedFederation] = useState<Federation | null>(null);

  const {
    data: federations,
    loading: federationsLoading,
    error: federationsError,
    refetch: refetchFederations,
  } = useDataFetching<Federation[]>(() =>
    getFederationsByTypeFilter(["INTERNATIONAL", "REGIONAL"])
  );

  const loading = federationsLoading;
  const error = federationsError;

  // Handle success after creating or editing a federation
  const handleCreateSuccess = () => {
    setCreateModalOpened(false);
    refetchFederations();
  };

  const handleEditSuccess = () => {
    setEditModalOpened(false);
    setSelectedFederation(null);
    refetchFederations();
  };

  const handleCardClick = (federation: Federation) => {
    navigate(`/federations/${federation._id}`);
  };

  const handleEditClick = (e: React.MouseEvent, federation: Federation) => {
    e.stopPropagation(); // Prevent navigation to federation details
    setSelectedFederation(federation);
    setEditModalOpened(true);
  };

  if (loading) {
    return (
      <Card>
        <Group position="center" py="xl">
          <Loader />
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text color="red" align="center">
          {error}
        </Text>
      </Card>
    );
  }

  const sortedFederations = federations?.sort((a, b) => {
    if (a.type === "INTERNATIONAL" && b.type !== "INTERNATIONAL") return -1;
    if (a.type !== "INTERNATIONAL" && b.type === "INTERNATIONAL") return 1;
    return 0; // Keep the original order for the same type
  });

  // Find the INTERNATIONAL federation to use as default parent
  const internationalFederation = federations?.find(
    (fed) => fed.type === "INTERNATIONAL"
  );
  const hasInternational = !!internationalFederation;
  const defaultParentId = internationalFederation?._id || "";

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <Title order={2}>{t("federations.INTERNATIONAL.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => setCreateModalOpened(true)}
        >
          {t("federations.create")}
        </Button>
      </Group>
      <Stack spacing="md">
        {sortedFederations?.map((federation) => (
          <FederationCard
            key={federation._id}
            federation={federation}
            onEdit={(e) => handleEditClick(e, federation)}
            onDelete={() => {
              // TODO: Implement delete functionality
            }}
            onClick={() => handleCardClick(federation)}
          />
        ))}
      </Stack>

      {/* Create Federation Modal */}
      <FederationFormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        federations={federations || []}
        modalTitle={t("federations.create")}
        allowedTypes={
          hasInternational ? ["REGIONAL"] : ["INTERNATIONAL", "REGIONAL"]
        }
        defaultType={hasInternational ? "REGIONAL" : "INTERNATIONAL"}
        defaultParentId={hasInternational ? defaultParentId : ""}
      />

      {/* Edit Federation Modal */}
      {selectedFederation && (
        <FederationFormModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setSelectedFederation(null);
          }}
          onSuccess={handleEditSuccess}
          federations={federations || []}
          modalTitle={t("federations.edit")}
          allowedTypes={["INTERNATIONAL", "REGIONAL"]}
          federationToEdit={selectedFederation}
          isEditMode={true}
        />
      )}
    </Stack>
  );
}
