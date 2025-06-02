import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Card, Grid, Title, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function OverviewForFedAdmin() {
  const { t } = useTranslation();
  const { federation } = useAuth();
  const navigate = useNavigate();

  return (
    <Page title={t("dashboard.title")}>
      <Grid gutter="md">
        <Grid.Col xs={12} md={6}>
          <Card
            withBorder
            onClick={() => navigate(`/federations/${federation?._id}`)}
          >
            <Title order={4}>Federation</Title>
            <Text size="sm" color="dimmed">
              some info
            </Text>
            <Text size="sm" color="dimmed">
              some info
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
          <Card withBorder onClick={() => navigate("/members")}>
            <Title order={4}>Members</Title>
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
    </Page>
  );
}
