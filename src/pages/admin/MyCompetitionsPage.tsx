import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Badge,
  Group,
  Button,
  Stack,
  TextInput,
  Select,
  Card,
  ActionIcon,
  Box,
  Paper,
  Grid,
  LoadingOverlay,
  Tabs,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconBarbell,
  IconSearch,
  IconEye,
  IconBuilding,
  IconChartBar,
} from "@tabler/icons-react";
import {
  getAllCompetitions,
  getInternationalCompetitions,
  type CompetitionWithAthleteCount,
} from "../../services/competitionService";
import type { Competition, Federation } from "../../types";
import { Page } from "@/components/common/Page";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useDataFetching } from "@/hooks/useDataFetching";
import InternationalCompetitions from "@/components/competitions/InternationalCompetitions";
import MyCompetitions from "@/components/competitions/MyCompetitions";
import NationalCompetitions from "@/components/competitions/NationalCompetitions";

export function MyCompetitionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { federation } = useAuth();
  const { getParam, setParam } = useUrlParams();
  const openedTab = getParam("tab") || "my";
  const tabs = [
    { value: "my", label: t("competition.tabs.my"), icon: IconChartBar },
    {
      value: "national",
      label: t("competition.tabs.national"),
      icon: IconBuilding,
    },
    {
      value: "international",
      label: t("competition.tabs.international"),
      icon: IconUsers,
    },
  ];

  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>({
    fetchFunction: () => getInternationalCompetitions(federation?._id ?? ""),
  });

  // if (federation?.type === "NATIONAL" ) {
  //   tabs.push({
  //     value: "international",
  //     label: t("federations.tabs.international"),
  //     icon: IconBuilding,
  //   });
  // }

  return (
    <Page title={t("competition.title")}>
      <Tabs
        value={openedTab}
        onTabChange={(value) =>
          setParam("tab", value?.toString() ?? "overview")
        }
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              icon={<tab.icon size={14} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="my" pt="xl">
          <MyCompetitions federation={federation} />
        </Tabs.Panel>
        <Tabs.Panel value="national" pt="xl">
          <NationalCompetitions federation={federation} />
        </Tabs.Panel>
        <Tabs.Panel value="international" pt="xl">
          <InternationalCompetitions federation={federation} />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
