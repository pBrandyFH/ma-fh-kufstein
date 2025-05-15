import { useDataFetching } from "@/hooks/useDataFetching";
import { getChildFederations } from "@/services/federationService";
import { Federation, FederationType } from "@/types";
import { Box, Button, Container, Flex, Loader } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FederationCard } from "./FederationCard";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { FederationFormModal } from "./legacy/FederationFormModal";

interface ChildFederationListProps {
  federation: Federation | null;
  federationLoading: boolean;
}

export default function ChildFederationList({
  federation,
  federationLoading,
}: ChildFederationListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedFederation, setSelectedFederation] =
    useState<Federation | null>(null);
  const {
    data: childFeds,
    loading: childFedsLoading,
    error: childFedsError,
    refetch: refetchFederations,
  } = useDataFetching<Federation[]>({
    fetchFunction: () => getChildFederations(federation?._id ?? ""),
    skip: federationLoading,
  });

  const handleCreateSuccess = () => {
    setCreateModalOpened(false);
    refetchFederations();
  };

  const handleEditSuccess = () => {
    setEditModalOpened(false);
    refetchFederations();
  };
  const handleCardClick = (federation: Federation) => {
    navigate(`/federations/${federation._id}`, {});
  };

  const handleEditClick = (e: React.MouseEvent, federation: Federation) => {
    e.stopPropagation(); // Prevent navigation to federation details
    setSelectedFederation(federation);
    setEditModalOpened(true);
  };

  const getTypeToAdd = () => {
    switch (federation?.type) {
      case "INTERNATIONAL":
        return "REGIONAL" as FederationType;
      case "REGIONAL":
        return "NATIONAL" as FederationType;
      case "NATIONAL":
        return "STATE" as FederationType;
      case "STATE":
        return "LOCAL" as FederationType;
      case "LOCAL":
        return "LOCAL" as FederationType;
    }
  };

  if (federationLoading) {
    return <Loader />;
  }

  return (
    <Flex direction="column" gap="sm">
      <Box>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => setCreateModalOpened(true)}
        >
          {t("federations.create")}
        </Button>
      </Box>

      {childFeds?.map((fed) => {
        return (
          <FederationCard
            key={fed._id}
            federation={fed}
            onEdit={(e) => handleEditClick(e, fed)}
            onDelete={() => {
              // TODO: Implement delete functionality
            }}
            onClick={() => handleCardClick(fed)}
          />
        );
      })}

      <FederationFormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        modalTitle={t("federations.add", {
          parentFederation: federation?.name,
        })}
        defaultType={getTypeToAdd()}
        parentId={federation?._id ?? ""}
      />

      {selectedFederation && (
        <FederationFormModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setSelectedFederation(null);
          }}
          onSuccess={handleEditSuccess}
          modalTitle={t("federations.edit")}
          federationToEdit={selectedFederation}
          parentId={federation?._id ?? ""}
          isEditMode={true}
        />
      )}
    </Flex>
  );
}
