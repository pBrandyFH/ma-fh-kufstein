import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Card, Grid } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function OverviewPage() {
  const { t } = useTranslation();
  const { user, federation } = useAuth();
  const { getParam, setParam } = useUrlParams();

  console.log(user);
  console.log(federation);
  return (
    <Page title={t("dashboard.title")}>
      <Grid>
        <Grid.Col md={6}>
          <Card withBorder> test</Card>
        </Grid.Col>
        <Grid.Col md={6}>
          <Card withBorder> test</Card>
        </Grid.Col>
        <Grid.Col md={6}>
          <Card withBorder> test</Card>
        </Grid.Col>
        <Grid.Col md={6}>
          <Card withBorder> test</Card>
        </Grid.Col>
      </Grid>
    </Page>
  );
}
