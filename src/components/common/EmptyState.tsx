import { Card, Text, Button, Group, Stack } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, Search, Users, Calendar, Award } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: "plus" | "search" | "users" | "calendar" | "award"
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon = "plus", action }: EmptyStateProps) {
  const { t } = useTranslation()

  const getIcon = () => {
    switch (icon) {
      case "search":
        return <Search size={48} />
      case "users":
        return <Users size={48} />
      case "calendar":
        return <Calendar size={48} />
      case "award":
        return <Award size={48} />
      default:
        return <Plus size={48} />
    }
  }

  return (
    <Card withBorder p="xl" radius="md">
      <Stack align="center" spacing="md">
        <Group position="center" spacing="xs">
          {getIcon()}
        </Group>
        <Text size="xl" weight={500} align="center">
          {title}
        </Text>
        <Text color="dimmed" align="center" size="sm">
          {description}
        </Text>
        {action && (
          <Button leftIcon={<Plus size={16} />} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Stack>
    </Card>
  )
} 