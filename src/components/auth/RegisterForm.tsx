"use client"

import { useState, useEffect } from "react"
import { useForm } from "@mantine/form"
import { TextInput, PasswordInput, Button, Box, Loader, Alert, Group, Text, Badge } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { useSearchParams, useNavigate } from "react-router-dom"
import { AlertCircle, Check } from "lucide-react"
import { register } from "../../services/authService"
import { validateInviteCode } from "../../services/invitationService"
import type { RegisterFormValues } from "../../types"

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [validatingInvite, setValidatingInvite] = useState(false)
  const [inviteValid, setInviteValid] = useState(false)
  const [inviteDetails, setInviteDetails] = useState<any>(null)
  const { t } = useTranslation()
  const searchParams = useSearchParams()[0]
  const navigate = useNavigate()

  const inviteCode = searchParams.get("inviteCode") || ""
  const email = searchParams.get("email") || ""

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: email,
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      inviteCode: inviteCode,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
      password: (value) => (value.length >= 8 ? null : t("auth.passwordTooShort")),
      confirmPassword: (value, values) => (value === values.password ? null : t("auth.passwordsDoNotMatch")),
      firstName: (value) => (value.length > 0 ? null : t("auth.required")),
      lastName: (value) => (value.length > 0 ? null : t("auth.required")),
      inviteCode: (value) => (value ? null : t("auth.inviteRequired")),
    },
  })

  useEffect(() => {
    const checkInviteCode = async () => {
      if (inviteCode && email) {
        setValidatingInvite(true)
        try {
          const response = await validateInviteCode(inviteCode, email)
          if (response.success && response.data) {
            setInviteValid(true)
            setInviteDetails(response.data)

            // Pre-fill form with data from invitation
            form.setValues({
              ...form.values,
              firstName: response.data.firstName || "",
              lastName: response.data.lastName || "",
            })
          } else {
            setInviteValid(false)
            notifications.show({
              title: t("auth.invalidInvite"),
              message: response.error || t("auth.inviteCodeInvalid"),
              color: "red",
            })
          }
        } catch (error) {
          setInviteValid(false)
          notifications.show({
            title: t("auth.invalidInvite"),
            message: error instanceof Error ? error.message : t("auth.errorOccurred"),
            color: "red",
          })
        } finally {
          setValidatingInvite(false)
        }
      }
    }

    checkInviteCode()
  }, [inviteCode, email, form, t])

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true)
    try {
      const response = await register(values)

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        notifications.show({
          title: t("auth.registrationSuccess"),
          message: t("auth.accountCreated"),
          color: "green",
        })

        if (onSuccess) onSuccess()
        else navigate("/dashboard")
      } else {
        throw new Error(response.error || t("auth.registrationFailed"))
      }
    } catch (error) {
      notifications.show({
        title: t("auth.registrationFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
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

  if (validatingInvite) {
    return (
      <Box mx="auto" sx={{ maxWidth: 400 }}>
        <Group position="center" direction="column" spacing="md">
          <Loader size="lg" />
          <Text>{t("auth.validatingInvite")}</Text>
        </Group>
      </Box>
    )
  }

  return (
    <Box mx="auto" sx={{ maxWidth: 400 }}>
      {inviteValid && inviteDetails && (
        <Alert icon={<Check size={16} />} title={t("auth.validInvite")} color="green" mb="lg">
          <Text mb="xs">
            {t("auth.invitedAs")} <Badge>{getRoleName(inviteDetails.role)}</Badge>
          </Text>

          {inviteDetails.federation && (
            <Text size="sm">
              {t("auth.federation")}: {inviteDetails.federation.name}
            </Text>
          )}

          {inviteDetails.club && (
            <Text size="sm">
              {t("auth.club")}: {inviteDetails.club.name}
            </Text>
          )}

          <Text size="xs" mt="xs">
            {t("auth.inviteExpires")} {new Date(inviteDetails.expiresAt).toLocaleDateString()}
          </Text>
        </Alert>
      )}

      {!inviteValid && inviteCode && (
        <Alert icon={<AlertCircle size={16} />} title={t("auth.invalidInvite")} color="red" mb="lg">
          {t("auth.inviteCodeInvalid")}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label={t("auth.firstName")}
          placeholder={t("auth.enterFirstName")}
          {...form.getInputProps("firstName")}
          mb="md"
        />

        <TextInput
          required
          label={t("auth.lastName")}
          placeholder={t("auth.enterLastName")}
          {...form.getInputProps("lastName")}
          mb="md"
        />

        <TextInput
          required
          label={t("auth.email")}
          placeholder="your.email@example.com"
          {...form.getInputProps("email")}
          mb="md"
          disabled={!!email} // Disable if email is provided in URL
        />

        <PasswordInput
          required
          label={t("auth.password")}
          placeholder={t("auth.enterPassword")}
          {...form.getInputProps("password")}
          mb="md"
        />

        <PasswordInput
          required
          label={t("auth.confirmPassword")}
          placeholder={t("auth.enterPasswordAgain")}
          {...form.getInputProps("confirmPassword")}
          mb="md"
        />

        <TextInput
          required
          label={t("auth.inviteCode")}
          placeholder={t("auth.enterInviteCode")}
          {...form.getInputProps("inviteCode")}
          mb="md"
          disabled={!!inviteCode} // Disable if invite code is provided in URL
        />

        <Button fullWidth mt="xl" type="submit" loading={loading} disabled={!inviteValid}>
          {t("auth.register")}
        </Button>
      </form>
    </Box>
  )
}

