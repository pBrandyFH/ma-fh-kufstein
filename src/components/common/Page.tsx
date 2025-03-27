import { ReactNode } from "react";
import { Container, Title, Box, Group, Stack, Paper } from "@mantine/core";

interface PageProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  backButton?: boolean;
  backUrl?: string;
  containerSize?: "xs" | "sm" | "md" | "lg" | "xl";
  withPaper?: boolean;
}

export function Page({
  title,
  children,
  actions,
  containerSize = "xl",
  withPaper = false,
}: PageProps) {
  const content = withPaper ? (
    <Paper p="md" radius="sm" withBorder>
      {children}
    </Paper>
  ) : (
    children
  );

  return (
    <Container size={containerSize} py="xl">
      <Stack spacing="xl">
        <Group position="apart" align="center">
          <Group spacing="sm">
            <Title order={1}>{title}</Title>
          </Group>
          {actions && <Box>{actions}</Box>}
        </Group>
        {content}
      </Stack>
    </Container>
  );
}
