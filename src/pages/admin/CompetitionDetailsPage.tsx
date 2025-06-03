import { Competition, Federation, Nomination } from "@/types";
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
  Loader,
  Center,
} from "@mantine/core";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  IconInfoCircle,
  IconUsers,
  IconPlus,
  IconBuilding,
} from "@tabler/icons-react";
import { useState } from "react";
import InfoTab from "@/components/competitions/details-drawer/InfoTab";
import NominationTab from "@/components/competitions/details-drawer/NominationTab";
import GroupTab from "@/components/competitions/details-drawer/GroupTab";
import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { useCompetitionDetails } from "@/hooks/useCompetitionDetails";
import { useUrlParams } from "@/hooks/useUrlParams";

export default function CompetitionDetailsPage() {
  const { t } = useTranslation();
  const { federation } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { getParam, setParam } = useUrlParams();
  const openedTab = getParam("tab") || "info";

  const {
    competition,
    nominations,
    isLoading,
    hasError,
    isNotFound,
    competitionError,
    nominationsError,
    refetchNominations,
  } = useCompetitionDetails(id);

  // Early return for loading state
  if (isLoading) {
    return (
      <Page title={t("common.loading")}>
        <Center h={400}>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text>{t("common.loading")}</Text>
          </Stack>
        </Center>
      </Page>
    );
  }

  // Early return for error state
  if (hasError) {
    return (
      <Page title={t("common.error")}>
        <Center h={400}>
          <Stack align="center" spacing="md">
            <Text color="red" size="lg">
              {competitionError
                ? t("competition.errorLoadingCompetition")
                : t("competition.errorLoadingNominations")}
            </Text>
            <Button onClick={() => window.location.reload()}>
              {t("common.retry")}
            </Button>
          </Stack>
        </Center>
      </Page>
    );
  }

  // Early return for not found state
  if (isNotFound || !competition || !nominations) {
    return (
      <Page title={t("common.notFound")}>
        <Center h={400}>
          <Stack align="center" spacing="md">
            <Text color="red" size="lg">
              {t("common.notFound")}
            </Text>
            <Button onClick={() => window.history.back()}>
              {t("common.goBack")}
            </Button>
          </Stack>
        </Center>
      </Page>
    );
  }

  const tabs = [
    { value: "info", label: t("competition.tabs.info"), icon: IconInfoCircle },
    {
      value: "nominations",
      label: t("competition.tabs.nominations"),
      icon: IconUsers,
    },
  ];

  if (federation?._id === competition.hostFederation._id) {
    tabs.push({
      value: "groups",
      label: t("competition.tabs.groups"),
      icon: IconBuilding,
    });
  }

  return (
    <Page title={competition.name}>
      <Tabs
        defaultValue={openedTab}
        onTabChange={(value) =>
          setParam("tab", value?.toString() ?? "info")
        }
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              icon={<tab.icon size={16} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="info" pt="md">
          <InfoTab competition={competition} />
        </Tabs.Panel>

        <Tabs.Panel value="nominations" pt="md">
          <NominationTab competition={competition} />
        </Tabs.Panel>

        <Tabs.Panel value="groups" pt="md">
          <GroupTab
            competitionId={competition._id}
            nominations={nominations}
            onNominationsUpdated={refetchNominations}
          />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
