import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  Grid,
  Title,
  Text,
  Badge,
  Group,
  ActionIcon,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import MemberFormModal from "@/components/members/MemberFormModal";

export default function OverviewForMemberAdmin() {
  const { t } = useTranslation();
  const { federation, member, setData } = useAuth();
  const navigate = useNavigate();
  const [editModalOpened, setEditModalOpened] = useState(false);

  const handleEditSuccess = async () => {
    setEditModalOpened(false);
    await setData();
  };

  return (
    <Page title={t("dashboard.title")}>
      <Grid gutter="md">
        <Grid.Col xs={12}>
          <Card withBorder>
            <Group position="apart" align="flex-start">
              <Group>
                <Title order={4}>{member?.name}</Title>
                <ActionIcon
                  variant="subtle"
                  onClick={() => setEditModalOpened(true)}
                  title={t("common.edit")}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Group>
              <Badge size="lg" variant="light">
                {t(`members.types.${member?.type?.toLowerCase()}`)}
              </Badge>
            </Group>
            <Text size="sm" color="dimmed" mt="xs">
              {t("members.federationInfo", { federation: federation?.name })}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Card withBorder onClick={() => navigate("/competitions")}>
            <Title order={4}>Competitions</Title>
            <Text size="sm" color="dimmed">
              some info
            </Text>
            <Text size="sm" color="dimmed">
              some info
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Card withBorder onClick={() => navigate("/fed-athletes")}>
            <Title order={4}>Athletes</Title>
            <Text size="sm" color="dimmed">
              some info
            </Text>
            <Text size="sm" color="dimmed">
              some info
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {member && federation && (
        <MemberFormModal
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          onSuccess={handleEditSuccess}
          modalTitle={t("members.edit")}
          federation={federation}
          memberToEdit={member}
          isEditMode={true}
        />
      )}
    </Page>
  );
}
