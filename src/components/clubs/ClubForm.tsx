"use client"

import { useState } from "react"
import { useForm } from "@mantine/form"
import { TextInput, Button, Box, Select, Grid, Divider, Title, Switch } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"

interface ClubFormValues {
  name: string
  abbreviation: string
  federationId: string
  adminEmail: string
  contactName: string
  contactEmail: string
  contactPhone: string
  website: string
  address: string
  city: string
  country: string
  sendInvite: boolean
}

interface ClubFormProps {
  initialValues?: Partial<ClubFormValues>
  onSubmit: (values: ClubFormValues) => Promise<void>
  federations: { value: string; label: string }[]
}

export function ClubForm({ initialValues, onSubmit, federations }: ClubFormProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const form = useForm<ClubFormValues>({
    initialValues: initialValues || {
      name: "",
      abbreviation: "",
      federationId: "",
      adminEmail: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      address: "",
      city: "",
      country: "",
      sendInvite: true,
    },
    validate: {
      name: (value) => (value ? null : t("auth.required")),
      abbreviation: (value) => (value ? null : t("auth.required")),
      federationId: (value) => (value ? null : t("auth.required")),
      adminEmail: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
    },
  })

  const handleSubmit = async (values: ClubFormValues) => {
    setLoading(true)
    try {
      await onSubmit(values)

      notifications.show({
        title: initialValues ? t("clubs.updateSuccess") : t("clubs.createSuccess"),
        message: initialValues ? t("clubs.clubUpdated") : t("clubs.clubCreated"),
        color: "green",
      })
    } catch (error) {
      notifications.show({
        title: initialValues ? t("clubs.updateFailed") : t("clubs.createFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={3} mb="md">
          {initialValues ? t("clubs.edit") : t("clubs.create")}
        </Title>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              required
              label={t("clubs.name")}
              placeholder={t("clubs.enterName")}
              {...form.getInputProps("name")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              required
              label={t("clubs.abbreviation")}
              placeholder={t("clubs.enterAbbreviation")}
              {...form.getInputProps("abbreviation")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Select
          required
          label={t("clubs.federation")}
          placeholder={t("clubs.selectFederation")}
          data={federations}
          {...form.getInputProps("federationId")}
          mb="md"
        />

        <Divider my="md" label={t("clubs.admin")} />

        <TextInput
          required
          label={t("clubs.adminEmail")}
          placeholder="admin@example.com"
          {...form.getInputProps("adminEmail")}
          mb="md"
        />

        <Switch
          label={t("clubs.sendInviteEmail")}
          {...form.getInputProps("sendInvite", { type: "checkbox" })}
          mb="lg"
        />

        <Divider my="md" label={t("clubs.contact")} />

        <TextInput
          label={t("clubs.contactName")}
          placeholder={t("clubs.enterContactName")}
          {...form.getInputProps("contactName")}
          mb="md"
        />

        <TextInput
          label={t("clubs.contactEmail")}
          placeholder="contact@example.com"
          {...form.getInputProps("contactEmail")}
          mb="md"
        />

        <TextInput
          label={t("clubs.contactPhone")}
          placeholder={t("clubs.enterContactPhone")}
          {...form.getInputProps("contactPhone")}
          mb="md"
        />

        <TextInput
          label={t("clubs.website")}
          placeholder="https://example.com"
          {...form.getInputProps("website")}
          mb="md"
        />

        <Divider my="md" label={t("clubs.address")} />

        <TextInput
          label={t("clubs.address")}
          placeholder={t("clubs.enterAddress")}
          {...form.getInputProps("address")}
          mb="md"
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label={t("clubs.city")}
              placeholder={t("clubs.enterCity")}
              {...form.getInputProps("city")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label={t("clubs.country")}
              placeholder={t("clubs.enterCountry")}
              {...form.getInputProps("country")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Button type="submit" loading={loading} mt="lg">
          {initialValues ? t("common.save") : t("common.create")}
        </Button>
      </form>
    </Box>
  )
}

