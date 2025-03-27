import { ClubList } from "@/components/clubs/ClubList";
import { ChildFederationList } from "@/components/federations/ChildFederationList";
import { useDataFetching } from "@/hooks/useDataFetching";
import {
  getFederationById,
  deleteFederation,
} from "@/services/federationService";
import { Federation } from "@/types";
import { notifications } from "@mantine/notifications";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Loader,
  Grid,
  Tabs,
  Stack,
} from "@mantine/core";
import { Users, Building, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { IconEdit } from "@tabler/icons-react";
import { Page } from "@/components/common/Page";

export default function FederationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: federation,
    loading,
    error,
  } = useDataFetching<Federation>(() => getFederationById(id ?? ""));

  const handleDelete = async () => {
    if (!federation) return;

    if (window.confirm(t("federations.confirmDelete"))) {
      try {
        const response = await deleteFederation(federation._id);
        if (response.success) {
          notifications.show({
            title: t("federations.deleteSuccess"),
            message: t("federations.federationDeleted"),
            color: "green",
          });
          navigate("/federations");
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        notifications.show({
          title: t("federations.deleteFailed"),
          message:
            error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        });
      }
    }
  };

  const getFederationTypeLabel = (type: string): string => {
    switch (type) {
      case "international":
        return t("federations.types.international");
      case "continental":
        return t("federations.types.continental");
      case "national":
        return t("federations.types.national");
      case "federalState":
        return t("federations.types.federalState");
      default:
        return type;
    }
  };

  const getFederationTypeColor = (type: string): string => {
    switch (type) {
      case "international":
        return "blue";
      case "continental":
        return "green";
      case "national":
        return "orange";
      case "federalState":
        return "grape";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Card withBorder p="xl">
        <Group position="center">
          <Loader />
        </Group>
      </Card>
    );
  }

  if (!federation) {
    return (
      <Card withBorder p="xl">
        <Text align="center">{t("federations.notFound")}</Text>
      </Card>
    );
  }

  return (
    <Page
      title={federation.name}
      actions={
        <Button
          leftIcon={<IconEdit size={16} />}
          component="a"
          href={`/federations/${federation._id}/edit`}
        >
          Edit
        </Button>
      }
    >
      <Stack>
        <Tabs defaultValue="details">
          <Tabs.List mb="md">
            <Tabs.Tab value="details" icon={<Building size={14} />}>
              {t("federations.details")}
            </Tabs.Tab>
            <Tabs.Tab value="clubs" icon={<Users size={14} />}>
              {t("clubs.title")}
            </Tabs.Tab>
            {(federation.type === "international" ||
              federation.type === "continental" ||
              federation.type === "national") && (
              <Tabs.Tab value="federations" icon={<Building size={14} />}>
                {t("federations.childFederations")}
              </Tabs.Tab>
            )}
            <Tabs.Tab value="competitions" icon={<Calendar size={14} />}>
              {t("competitions.title")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details">
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Title order={4} mb="md">
                    {t("federations.contact")}
                  </Title>
                  {federation.contactName && (
                    <Text mb="xs">
                      <strong>{t("federations.contactName")}:</strong>{" "}
                      {federation.contactName}
                    </Text>
                  )}
                  {federation.contactEmail && (
                    <Text mb="xs">
                      <strong>{t("federations.contactEmail")}:</strong>{" "}
                      <a href={`mailto:${federation.contactEmail}`}>
                        {federation.contactEmail}
                      </a>
                    </Text>
                  )}
                  {federation.contactPhone && (
                    <Text mb="xs">
                      <strong>{t("federations.contactPhone")}:</strong>{" "}
                      {federation.contactPhone}
                    </Text>
                  )}
                  {federation.website && (
                    <Text mb="xs">
                      <strong>{t("federations.website")}:</strong>{" "}
                      <a
                        href={federation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {federation.website}
                      </a>
                    </Text>
                  )}
                </Card>
              </Grid.Col>

              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Title order={4} mb="md">
                    {t("federations.address")}
                  </Title>
                  {federation.address && (
                    <Text mb="xs">
                      <strong>{t("federations.address")}:</strong>{" "}
                      {federation.address}
                    </Text>
                  )}
                  {federation.city && (
                    <Text mb="xs">
                      <strong>{t("federations.city")}:</strong>{" "}
                      {federation.city}
                    </Text>
                  )}
                  {federation.country && (
                    <Text mb="xs">
                      <strong>{t("federations.country")}:</strong>{" "}
                      {federation.country}
                    </Text>
                  )}
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="clubs">
            <ClubList federationId={federation._id} />
          </Tabs.Panel>

          {(federation.type === "international" ||
            federation.type === "continental" ||
            federation.type === "national") && (
            <Tabs.Panel value="federations">
              <ChildFederationList parentFederationId={federation._id} />
            </Tabs.Panel>
          )}

          <Tabs.Panel value="competitions">
            <Text>{t("competitions.noCompetitions")}</Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Page>
  );
}
