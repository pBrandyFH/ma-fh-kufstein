import { Page } from "@/components/common/Page";
import { useTranslation } from "react-i18next";
import {
  IconTrophy,
  IconUsers,
  IconUserCheck,
  IconBuilding,
  IconChartBar,
} from "@tabler/icons-react";
import { Anchor, Breadcrumbs, Stack, Tabs } from "@mantine/core";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChildFederations,
  getFederationById,
} from "@/services/federationService";
import { Federation, Member } from "@/types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FederationCard } from "@/components/federations/FederationCard";
import ChildFederationList from "@/components/federations/ChildFederationList";
import { getMembersByFederationId } from "@/services/memberService";
import FederationMemberList from "@/components/federations/FederationMemberList";
import FederationInfo from "@/components/federations/FederationInfo";

async function fetchFederationHierarchy(fedId: string): Promise<Federation[]> {
  const chain: Federation[] = [];
  let currentId = fedId;
  while (currentId) {
    const res = await getFederationById(currentId);
    if (!res.success || !res.data) break;
    chain.unshift(res.data);
    currentId = res.data.parents?.[0]?._id || ""; // pick first for linear fallback
  }
  return chain;
}

async function fetchAllFederationHierarchies(
  fedId: string
): Promise<Federation[][]> {
  const base = await getFederationById(fedId);
  if (!base.success || !base.data) return [];

  const federation = base.data;

  if (!federation.parents || federation.parents.length === 0) {
    return [[federation]];
  }

  const parentChains = await Promise.all(
    federation.parents.map(async (parent: Federation) => {
      const chain = await fetchFederationHierarchy(parent._id);
      return [...chain, federation];
    })
  );

  return parentChains;
}

export default function FederationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { getParam, setParam } = useUrlParams();

  const [hierarchies, setHierarchies] = useState<Federation[][]>([]);

  const openedTab = getParam("tab") || "info";
  const tabs = [
    { value: "info", label: t("federations.tabs.info"), icon: IconChartBar },
    {
      value: "children",
      label: t("federations.tabs.children"),
      icon: IconBuilding,
    },
    { value: "members", label: t("federations.tabs.members"), icon: IconUsers },
  ];

  const {
    data: federation,
    loading: fedLoading,
    error: fedError,
  } = useDataFetching<Federation>({
    fetchFunction: () => getFederationById(id ?? ""),
    dependencies: [id],
  });

  useEffect(() => {
    if (federation?._id) {
      fetchAllFederationHierarchies(federation._id).then(setHierarchies);
    }
  }, [federation?._id]);

  return (
    <Page title={federation?.name ?? ""}>
      <Stack spacing={4} mb="md">
        {hierarchies.map((chain, index) => (
          <Breadcrumbs key={index}>
            {chain.map((fed, idx) =>
              idx < chain.length - 1 ? (
                <Anchor
                  key={fed._id}
                  onClick={() => navigate(`/federations/${fed._id}`)}
                >
                  {fed.name}
                </Anchor>
              ) : (
                <span key={fed._id}>{fed.name}</span>
              )
            )}
          </Breadcrumbs>
        ))}
      </Stack>

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

        <Tabs.Panel value="info" pt="xl">
          <FederationInfo federation={federation} />
        </Tabs.Panel>
        <Tabs.Panel value="children" pt="xl">
          <ChildFederationList
            federation={federation}
            federationLoading={fedLoading}
          />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="xl">
          <FederationMemberList
            federation={federation}
            federationLoading={fedLoading}
          />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
