"use client"

import { useState, useEffect } from "react"
import { Card, Title, Text, Group, Button, Loader, Table, Badge, ActionIcon, Menu, Modal } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Mail, Trash, RefreshCw, MoreVertical, Plus } from "lucide-react"
import {
  getMyInvitations,
  getAllInvitations,
  resendInvitation,
  deleteInvitation,
  type InvitationData,
} from "../../services/invitationService"
import { getCurrentUser } from "../../services/authService"
import { notifications } from "@mantine/notifications"
import { InvitationForm } from "./InvitationForm"

export function InvitationList() {
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()
  const currentUser = getCurrentUser()
  const isInternationalAdmin = currentUser?.role === "internationalAdmin"

  const fetchInvitations = async () => {
    setLoading(true)
    try {
      const response = isInternationalAdmin ? await getAllInvitations() : await getMyInvitations()

      if (response.success && response.data) {
        setInvitations(response.data)
      } else {
        throw new Error(response.error || t("invitations.fetchFailed"))
      }
    } catch (error) {
      notifications.show({
        title: t("invitations.fetchFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [isInternationalAdmin, t])

  const handleResend = async (id: string) => {
    try {
      const response = await resendInvitation(id)
      if (response.success) {
        notifications.show({
          title: t("invitations.resendSuccess"),
          message: t("invitations.invitationResent"),
          color: "green",
        })
        fetchInvitations()
      } else {
        throw new Error(response.error || t("invitations.resendFailed"))
      }
    } catch (error) {
      notifications.show({
        title: t("invitations.resendFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t("invitations.confirmDelete"))) {
      try {
        const response = await deleteInvitation(id)
        if (response.success) {
          notifications.show({
            title: t("invitations.deleteSuccess"),
            message: t("invitations.invitationDeleted"),
            color: "green",
          })
          fetchInvitations()
        } else {
          throw new Error(response.error || t("invitations.deleteFailed"))
        }
      } catch (error) {
        notifications.show({
          title: t("invitations.deleteFailed"),
          message: error instanceof Error ? error.message : t("auth.errorOccurred"),
          color: "red",
        })
      }
    }
  }

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "athlete":
        return "blue"
      case "coach":
        return "green"
      case "official":
        return "orange"
      case "clubAdmin":
        return "grape"
      case "federalStateAdmin":
        return "pink"
      case "stateAdmin":
        return "red"
      case "continentalAdmin":
        return "indigo"
      case "internationalAdmin":
        return "violet"
      default:
        return "gray"
    }
  }

  const getRoleName = (role: string): string => {
    switch (role) {
      case "athlete":
        return t("roles.athlete")
      case "coach":
        return t("roles.coach")
      case "official":
        return t("roles.official")
      case "clubAdmin":
        return t("roles.clubAdmin")
      case "federalStateAdmin":
        return t("roles.federalStateAdmin")
      case "stateAdmin":
        return t("roles.stateAdmin")
      case "continentalAdmin":
        return t("roles.continentalAdmin")
      case "internationalAdmin":
        return t("roles.internationalAdmin")
      default:
        return role
    }
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
    <>
      <Card withBorder p="xl">
        <Group position="apart" mb="xl">
          <Title order={2}>{t("invitations.title")}</Title>
          <Group>
            <Button leftIcon={<RefreshCw size={16} />} onClick={fetchInvitations}>
              {t("common.refresh")}
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              {t("invitations.new")}
            </Button>
          </Group>
        </Group>

        {invitations.length > 0 ? (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>{t("auth.email")}</th>
                <th>{t("auth.name")}</th>
                <th>{t("invitations.role")}</th>
                <th>{t("invitations.status")}</th>
                <th>{t("invitations.expires")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation._id}>
                  <td>{invitation.email}</td>
                  <td>
                    {invitation.firstName} {invitation.lastName}
                  </td>
                  <td>
                    <Badge color={getRoleBadgeColor(invitation.role)}>{getRoleName(invitation.role)}</Badge>
                  </td>
                  <td>
                    <Badge color={invitation.used ? "gray" : "green"}>
                      {invitation.used ? t("invitations.used") : t("invitations.pending")}
                    </Badge>
                  </td>
                  <td>
                    {new Date(invitation.expiresAt) < new Date() ? (
                      <Badge color="red">{t("invitations.expired")}</Badge>
                    ) : (
                      new Date(invitation.expiresAt).toLocaleDateString()
                    )}
                  </td>
                  <td>
                    <Group spacing={0} position="right">
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon>
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {!invitation.used && new Date(invitation.expiresAt) > new Date() && (
                            <Menu.Item icon={<Mail size={14} />} onClick={() => handleResend(invitation._id)}>
                              {t("invitations.resend")}
                            </Menu.Item>
                          )}
                          {!invitation.used && (
                            <Menu.Item
                              icon={<Trash size={14} />}
                              color="red"
                              onClick={() => handleDelete(invitation._id)}
                            >
                              {t("common.delete")}
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Text align="center">{t("invitations.noInvitations")}</Text>
        )}
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={t("invitations.new")} size="lg">
        <InvitationForm
          onSuccess={() => {
            setModalOpen(false)
            fetchInvitations()
          }}
        />
      </Modal>
    </>
  )
}

