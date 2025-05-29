import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  ActionIcon,
  Box,
  Paper,
  Grid,
  LoadingOverlay,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { IconUsers, IconEye } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { Member } from "@/types";

interface MembersListProps {
  members: Member[];
  loading?: boolean;
}

export default function MembersList({ members, loading }: MembersListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box pos="relative" h={200}>
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (!members?.length) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          {t("members.empty")}
        </Text>
      </Paper>
    );
  }

  return (
    <Grid>
      {members.map((member) => (
        <Grid.Col key={member._id} span={4}>
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group style={{ justifyContent: "space-between" }}>
                <Text fw={500} size="lg">
                  {member.name}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => navigate(`/members/${member._id}`)}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
            </Card.Section>

            <Stack style={{ gap: "0.5rem" }} mt="md">
              <Group style={{ gap: "0.5rem" }}>
                <IconUsers size={16} />
                <Text size="sm" c="dimmed">
                  {member.athletes.length} {t("members.athletes")}
                </Text>
              </Group>

              <Group style={{ gap: "0.5rem" }}>
                <Badge variant="light" color="blue">
                  {member.federation?.name || t("common.unknown")}
                </Badge>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
} 