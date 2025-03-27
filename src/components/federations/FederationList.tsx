"use client"

import { useState, useEffect } from "react"
import { Card, Title, Text, Group, Button, Loader, ActionIcon, Menu, Badge, Accordion, Box } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import type { Federation } from "../../types"
import { getAllFederations } from "../../services/federationService"

interface FederationListProps {
  onEdit?: (federation: Federation) => void
  onDelete?: (federation: Federation) => void
  onContact?: (federation: Federation) => void
}

export function FederationList({ onEdit, onDelete, onContact }: FederationListProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federations, setFederations] = useState<Federation[]>([])
  const [internationalFederations, setInternationalFederations] = useState<Federation[]>([])

  useEffect(() => {
    const fetchFederations = async () => {
      setLoading(true)
      try {
        const response = await getAllFederations()
        if (response.success && response.data) {
          setFederations(response.data)

          // Filter international federations
          const international = response.data.filter((fed) => fed.type === "international")
          setInternationalFederations(international)
        }
      } catch (error) {
        console.error("Error fetching federations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFederations()
  }, [])

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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const renderFederationItem = (federation: Federation) => (
    <Card key={federation._id} withBorder p="md" mb="md" component={Link} to={`/federations/${federation._id}`} sx={{ textDecoration: 'none' }}>
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
              <Menu.Dropdown>
                {onEdit && (
                  <Menu.Item icon={<Edit size={14} />} onClick={() => onEdit(federation)}>
                    {t("common.edit")}
                  </Menu.Item>
                )}
                {onContact && (
                  <Menu.Item icon={<Mail size={14} />} onClick={() => onContact(federation)}>
                    {t("common.contact")}
                  </Menu.Item>
                )}
                {onDelete && (
                  <Menu.Item icon={<Trash size={14} />} color="red" onClick={() => onDelete(federation)}>
                    {t("common.delete")}
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Group>
      </Group>
    </Card>
  )

  const renderFederationHierarchy = (federation: Federation) => {
    const childFederations = federations.filter((fed) => fed.parentFederation === federation._id)

    return (
      <Accordion.Item key={federation._id} value={federation._id}>
        <Accordion.Control>
          <Group>
            <Text weight={500}>{federation.name}</Text>
            <Text size="sm" color="dimmed">
              ({federation.abbreviation})
            </Text>
            <Badge color={getFederationTypeColor(federation.type)}>{getFederationTypeLabel(federation.type)}</Badge>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Box ml={20}>
            {renderFederationItem(federation)}

            {childFederations.length > 0 && (
              <Accordion multiple>{childFederations.map((childFed) => renderFederationHierarchy(childFed))}</Accordion>
            )}
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    )
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
        <Title order={2}>{t("federations.title")}</Title>
        <Button leftIcon={<Plus size={16} />} component={Link} to="/federations/create">
          {t("federations.create")}
        </Button>
      </Group>

      <Accordion multiple>
        {internationalFederations.map((federation) => renderFederationHierarchy(federation))}
      </Accordion>
    </Card>
  )
}

