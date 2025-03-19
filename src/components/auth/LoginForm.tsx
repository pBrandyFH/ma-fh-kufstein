"use client"

import { useState } from "react"
import { useForm } from "@mantine/form"
import { TextInput, PasswordInput, Button, Group, Box, Anchor } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import type { LoginFormValues } from "../../types"
import { login } from "../../services/authService"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
      password: (value) => (value.length >= 8 ? null : t("auth.passwordTooShort")),
    },
  })

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      const response = await login(values)

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        notifications.show({
          title: t("auth.loginSuccess"),
          message: t("auth.welcomeBack"),
          color: "green",
        })

        if (onSuccess) onSuccess()
      } else {
        throw new Error(response.error || t("auth.invalidCredentials"))
      }
    } catch (error) {
      notifications.show({
        title: t("auth.loginFailed"),
        message: error instanceof Error ? error.message : t("auth.invalidCredentials"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box mx="auto" sx={{ maxWidth: 400 }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label={t("auth.email")}
          placeholder="your.email@example.com"
          {...form.getInputProps("email")}
          mb="md"
        />

        <PasswordInput
          required
          label={t("auth.password")}
          placeholder={t("auth.enterPassword")}
          {...form.getInputProps("password")}
          mb="md"
        />

        <Group position="apart" mt="lg">
          <Anchor component="button" type="button" color="dimmed" size="sm">
            {t("auth.forgotPassword")}
          </Anchor>
        </Group>

        <Button fullWidth mt="xl" type="submit" loading={loading}>
          {t("auth.login")}
        </Button>
      </form>
    </Box>
  )
}

