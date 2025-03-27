import { Drawer, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Federation } from "../../../types";

interface DashboardFederationDrawerProps {
  opened: boolean;
  onClose: () => void;
  federation: Federation | null;
}

export const DashboardFederationDrawer = ({
  opened,
  onClose,
  federation,
}: DashboardFederationDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={federation ? federation.name : ""}
      padding="xl"
      size="80rem"
      position="right"
      overlayProps={{ blur: 4 }}
    >
      {federation && (
        <Stack>
          <Text size="lg" weight={500}>
            {t("federations.details")}
          </Text>
          <Text>
            {t("federations.type")}: {federation.type}
          </Text>
          <Text>
            {t("federations.abbreviation")}: {federation.abbreviation}
          </Text>
          <Text>
            {t("federations.contact")}: {federation.contactName}
          </Text>
          <Text>
            {t("federations.email")}: {federation.contactEmail}
          </Text>
          <Text>
            {t("federations.phone")}: {federation.contactPhone}
          </Text>
          <Text>
            {t("federations.website")}: {federation.website}
          </Text>
          {/* Add any other relevant information here */}
        </Stack>
      )}
    </Drawer>
  );
};
