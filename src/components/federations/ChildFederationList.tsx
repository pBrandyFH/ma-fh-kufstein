"use client"

import { useState, useEffect } from "react"
import { Card, Title, Text, Group, Button, Loader, ActionIcon, Menu, Badge, Box, Stack, Portal } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import type { Federation } from "../../types"
import { getChildFederations } from "../../services/federationService"

interface ChildFederationListProps {
  parentFederationId: string
}

export function ChildFederationList({ parentFederationId }: ChildFederationListProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federations, setFederations] = useState<Federation[]>([])

  useEffect(() => {
    const fetchChildFederations = async () => {
      try {
        const response = await getChildFederations(parentFederationId)
        if (response.success && response.data) {
          setFederations(response.data)
        }
      } catch (error) {
        console.error("Error fetching child federations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildFederations()
  }, [parentFederationId])

  const getFederationTypeColor = (type: string): string => {
    switch (type) {
      case "international":
        return "blue"
      case "continental":
        return "green"
      case "national":
        return "orange"
      case "federalState":
        return "grape"
      default:
        return "gray"
    }
  }

  const getFederationTypeLabel = (type: string): string => {
    switch (type) {
      case "international":
        return t("federations.types.international")
      case "continental":
        return t("federations.types.continental")
      case "national":
        return t("federations.types.national")
      case "federalState":
        return t("federations.types.federalState")
      default:
        return type
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (loading) {
    return (
      <Card withBorder p="xl">
        <Group position="center">
          <Loader />
        </Group>
      </Card>
    )
  }

  return (
    <Card withBorder p="xl">
      <Group position="apart" mb="xl">
        <Title order={2}>{t("federations.childFederations")}</Title>
        <Button leftIcon={<Plus size={16} />} component={Link} to={`/federations/create?parent=${parentFederationId}`}>
          {t("federations.create")}
        </Button>
      </Group>

      {federations.length === 0 ? (
        <Text color="dimmed" align="center">{t("federations.noChildFederations")}</Text>
      ) : (
        <Stack spacing="md">
          {federations.map((federation) => (
            <Card key={federation._id} withBorder p="md" component={Link} to={`/federations/${federation._id}`} sx={{ textDecoration: 'none' }}>
              <Group position="apart">
                <div>
                  <Group>
                    <Text weight={500}>{federation.name}</Text>
                    <Text size="sm" color="dimmed">
                      ({federation.abbreviation})
                    </Text>
                  </Group>
                  <Text size="sm" color="dimmed">
                    {federation.city && `${federation.city}, `}
                    {federation.country}
                  </Text>
                </div>
                <Group>
                  <Badge color={getFederationTypeColor(federation.type)}>{getFederationTypeLabel(federation.type)}</Badge>
                  <Box onClick={handleMenuClick}>
                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon>
                          <MoreVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Portal>
                        <Menu.Dropdown>
                          <Menu.Item icon={<Edit size={14} />} component={Link} to={`/federations/${federation._id}/edit`}>
                            {t("common.edit")}
                          </Menu.Item>
                          <Menu.Item icon={<Mail size={14} />} component="a" href={`mailto:${federation.contactEmail}`}>
                            {t("common.contact")}
                          </Menu.Item>
                          <Menu.Item icon={<Trash size={14} />} color="red">
                            {t("common.delete")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Portal>
                    </Menu>
                  </Box>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Card>
  )
} 