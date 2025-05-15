"use client"

import { useState, useEffect } from "react"
import { useForm } from "@mantine/form"
import { TextInput, Button, Box, Select, Title, Text, Alert, Group, Divider } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"
import { sendInvitation, type InviteFormValues } from "../../services/invitationService"
import { getAllFederations } from "../../services/federationService"
import { getAllClubs } from "../../services/clubService"
import { getCurrentUser } from "../../services/authService"

interface InvitationFormProps {
  onSuccess?: () => void
}

export function InvitationForm({ onSuccess }: InvitationFormProps) {
  const [loading, setLoading] = useState(false)
  const [federations, setFederations] = useState<{ value: string; label: string }[]>([])
  const [clubs, setClubs] = useState<{ value: string; label: string }[]>([])
  const { t } = useTranslation()
  const currentUser = getCurrentUser()

  const form = useForm<InviteFormValues>({
    initialValues: {
      email: "",
      role: "",
      firstName: "",
      lastName: "",
      federationId: currentUser?.federationId || "",
      clubId: currentUser?.clubId || "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
      role: (value) => (value ? null : t("auth.required")),
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch federations
        const fedResponse = await getAllFederations()
        if (fedResponse.success && fedResponse.data) {
          setFederations(
            fedResponse.data.map((fed) => ({
              value: fed._id,
              label: `${fed.name} (${fed.abbreviation})`,
            })),
          )
        }

        // Fetch clubs
        const clubsResponse = await getAllClubs()
        if (clubsResponse.success && clubsResponse.data) {
          setClubs(
            clubsResponse.data.map((club) => ({
              value: club._id,
              label: `${club.name} (${club.abbreviation})`,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    const roles = []

    // All admin roles can invite athletes, coaches, and officials
    roles.push(
      { value: "athlete", label: t("roles.athlete") },
      { value: "coach", label: t("roles.coach") },
      { value: "official", label: t("roles.official") },
    )

    // Club admins can only invite athletes, coaches, and officials
    if (!currentUser || currentUser.role === "clubAdmin") {
      return roles
    }

    // Federation admins can invite club admins
    roles.push({ value: "clubAdmin", label: t("roles.clubAdmin") })

    // Federal state admins can't invite higher level admins
    if (currentUser.role === "federalStateAdmin") {
      return roles
    }

    // National admins can invite federal state admins
    roles.push({ value: "federalStateAdmin", label: t("roles.federalStateAdmin") })

    // Continental admins can invite NATIONAL admins
    if (currentUser.role === "continentalAdmin" || currentUser.role === "internationalAdmin") {
      roles.push({ value: "stateAdmin", label: t("roles.stateAdmin") })
    }

    // International admins can invite REGIONAL admins
    if (currentUser.role === "internationalAdmin") {
      roles.push({ value: "continentalAdmin", label: t("roles.continentalAdmin") })
    }

    return roles
  }

  const handleSubmit = async (values: InviteFormValues) => {
    setLoading(true)
    try {
      const response = await sendInvitation(values)

      if (response.success) {
        notifications.show({
          title: t("invitations.success"),
          message: t("invitations.invitationSent"),
          color: "green",
        })

        form.reset()
        if (onSuccess) onSuccess()
      } else {
        throw new Error(response.error || t("invitations.failed"))
      }
    } catch (error) {
      notifications.show({
        title: t("invitations.failed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show federation/club fields based on selected role
  const shouldShowFederationField = () => {
    const role = form.values.role
    return (
      role === "federalStateAdmin" ||
      role === "stateAdmin" ||
      role === "continentalAdmin" ||
      role === "internationalAdmin"
    )
  }

  const shouldShowClubField = () => {
    const role = form.values.role
    return role === "clubAdmin" || role === "athlete" || role === "coach"
  }

  return (
    <Box mx="auto" sx={{ maxWidth: 500 }}>
      <Title order={3} mb="md">
        {t("invitations.sendInvite")}
      </Title>

      {!currentUser && (
        <Alert icon={<AlertCircle size={16} />} title={t("auth.notLoggedIn")} color="red" mb="lg">
          {t("auth.loginRequired")}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label={t("auth.email")}
          placeholder="email@example.com"
          {...form.getInputProps("email")}
          mb="md"
        />

        <Select
          required
          label={t("invitations.role")}
          placeholder={t("invitations.selectRole")}
          data={getAvailableRoles()}
          {...form.getInputProps("role")}
          mb="md"
        />

        <Group grow>
          <TextInput
            label={t("auth.firstName")}
            placeholder={t("auth.enterFirstName")}
            {...form.getInputProps("firstName")}
            mb="md"
          />

          <TextInput
            label={t("auth.lastName")}
            placeholder={t("auth.enterLastName")}
            {...form.getInputProps("lastName")}
            mb="md"
          />
        </Group>

        {shouldShowFederationField() && (
          <>
            <Divider my="md" label={t("federations.title")} />
            <Select
              label={t("federations.federation")}
              placeholder={t("federations.selectFederation")}
              data={federations}
              {...form.getInputProps("federationId")}
              mb="md"
              disabled={currentUser?.role !== "internationalAdmin" && !!currentUser?.federationId}
            />
          </>
        )}

        {shouldShowClubField() && (
          <>
            <Divider my="md" label={t("clubs.title")} />
            <Select
              label={t("clubs.club")}
              placeholder={t("clubs.selectClub")}
              data={clubs}
              {...form.getInputProps("clubId")}
              mb="md"
              disabled={currentUser?.role === "clubAdmin" && !!currentUser?.clubId}
            />
          </>
        )}

        <Text size="sm" color="dimmed" mb="lg">
          {t("invitations.explanation")}
        </Text>

        <Button fullWidth type="submit" loading={loading} disabled={!currentUser}>
          {t("invitations.send")}
        </Button>
      </form>
    </Box>
  )
}

