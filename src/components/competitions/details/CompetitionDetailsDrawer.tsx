import { Competition } from "@/types";
import { Drawer, Stack, Title, Badge, Box, Tabs } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconInfoCircle, IconUsers } from "@tabler/icons-react";
import NominationTab from "./NominationTab";
import InfoTab from "./InfoTab";

interface CompetitionDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  competition: Competition | null;
}

export default function CompetitionDetailsDrawer({
  opened,
  onClose,
  competition,
}: CompetitionDetailsDrawerProps) {
  const { t } = useTranslation();

  const tabs = [
    { value: "info", label: t("competition.tabs.info"), icon: IconInfoCircle },
    {
      value: "nominations",
      label: t("competition.tabs.nominations"),
      icon: IconUsers,
    },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={null}
      padding="xl"
      size="80rem"
      position="right"
      overlayProps={{ blur: 4 }}
    >
      {competition && (
        <Stack spacing="lg">
          <Box mb="md">
            <Title order={1} mb="xs">
              {competition.name}
            </Title>
            <Badge
              size="lg"
              color={
                competition.status === "ongoing"
                  ? "green"
                  : competition.status === "upcoming"
                  ? "blue"
                  : "gray"
              }
            >
              {t(`competitions.status.${competition.status}`)}
            </Badge>
          </Box>

          <Tabs defaultValue="info">
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
          </Tabs>
        </Stack>
      )}
    </Drawer>
  );
}
