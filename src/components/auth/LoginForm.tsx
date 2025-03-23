"use client"

import { useState } from "react"
import { useForm } from "@mantine/form"
import { TextInput, PasswordInput, Button, Group, Box, Anchor, Container, Paper, Title, Text, Stack, rem, Alert } from "@mantine/core"
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
      email: "ipf.admin@example.com",
      password: "password123",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
      password: (value) => (value.length >= 4 ? null : t("auth.passwordTooShort")),
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
    <Container size="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper
        radius="md"
        p="xl"
        withBorder
        sx={{
          width: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack spacing="xl">
          <Box ta="center">
            <Title order={2} size="h1" fw={900} mb="xs">
              {t("auth.welcomeMessage")}
            </Title>
            <Text c="dimmed" size="sm" mb="md">
              {t("auth.loginMessage")}
            </Text>
          </Box>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                required
                label={t("auth.email")}
                placeholder="your.email@example.com"
                size="md"
                {...form.getInputProps("email")}
              />

              <PasswordInput
                required
                label={t("auth.password")}
                placeholder={t("auth.enterPassword")}
                size="md"
                {...form.getInputProps("password")}
              />

              <Group position="apart" mt="md">
                <Anchor component="button" type="button" color="dimmed" size="sm">
                  {t("auth.forgotPassword")}
                </Anchor>
              </Group>

              <Button fullWidth size="md" type="submit" loading={loading} mt="xl">
                {t("auth.login")}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}

