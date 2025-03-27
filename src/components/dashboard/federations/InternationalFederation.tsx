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
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { getFederationsByTypeFilter } from "../../../services/federationService";
import type { Federation } from "../../../types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { FederationCard } from "@/components/federations/FederationCard";
import { DashboardFederationDrawer } from "./DashboardFederationDrawer";
import { useNavigate } from "react-router-dom";

export function DashboardInternationalFederationsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: federations,
    loading: federationsLoading,
    error: federationsError,
  } = useDataFetching<Federation[]>(() =>
    getFederationsByTypeFilter(["international", "continental"])
  );

  const loading = federationsLoading;
  const error = federationsError;

  const handleCardClick = (federation: Federation) => {
    navigate(`/federations/${federation._id}`);
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
    if (a.type === "international" && b.type !== "international") return -1;
    if (a.type !== "international" && b.type === "international") return 1;
    return 0; // Keep the original order for the same type
  });

  return (
    <Stack spacing="xl">
      <Title order={2}>{t("federations.international.title")}</Title>

      <Stack spacing="md">
        {sortedFederations?.map((federation) => (
          <FederationCard
            key={federation._id}
            federation={federation}
            onEdit={() => {
              // TODO: Implement edit functionality
            }}
            onDelete={() => {
              // TODO: Implement delete functionality
            }}
            onClick={() => handleCardClick(federation)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
