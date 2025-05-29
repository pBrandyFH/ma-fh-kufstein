import { useState } from "react";
import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getMembersByFederationId } from "@/services/memberService";
import { Member } from "@/types";
import { Tabs, Button, Box, Flex } from "@mantine/core";
import { IconBuilding, IconChartBar, IconUsers, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import MembersList from "@/components/members/MembersList";
import MemberFormModal from "@/components/members/MemberFormModal";

export default function MyMembersPage() {
  const { t } = useTranslation();
  const { federation } = useAuth();
  const { getParam, setParam } = useUrlParams();
  const openedTab = getParam("tab") || "members";
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const tabs = [
    { value: "members", label: t("members.tabs.members"), icon: IconChartBar },
    {
      value: "requests",
      label: t("members.tabs.requests"),
      icon: IconUsers,
    },
  ];

  const {
    data: members,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useDataFetching<Member[]>({
    fetchFunction: () => getMembersByFederationId(federation?._id ?? ""),
  });

  const handleCreateSuccess = () => {
    setCreateModalOpened(false);
    refetchMembers();
  };

  if (!federation) {
    return <div>no fed</div>;
  }

  return (
    <Page title={t("members.title")}>
      <Tabs
        value={openedTab}
        onTabChange={(value) =>
          setParam("tab", value?.toString() ?? "members")
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

        <Tabs.Panel value="members" pt="xl">
          <Flex direction="column" gap="sm">
            <Box>
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={() => setCreateModalOpened(true)}
              >
                {t("members.create")}
              </Button>
            </Box>
            <MembersList members={members ?? []} loading={membersLoading} />
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="requests" pt="xl">
          <div>requests</div>
        </Tabs.Panel>
      </Tabs>

      <MemberFormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        modalTitle={t("members.create")}
        federation={federation}
      />
    </Page>
  );
}
