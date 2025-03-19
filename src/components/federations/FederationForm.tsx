"use client"

import { useState, useEffect } from "react"
import { useForm } from "@mantine/form"
import { TextInput, Button, Box, Select, Grid, Divider, Title, Switch } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import type { FederationFormValues, FederationType } from "../../types"
import { getFederationById, determineFederationType } from "../../services/federationService"

interface FederationFormProps {
  initialValues?: Partial<FederationFormValues>
  onSubmit: (values: FederationFormValues) => Promise<void>
  parentFederations: { value: string; label: string }[]
}

export function FederationForm({ initialValues, onSubmit, parentFederations }: FederationFormProps) {
  const [loading, setLoading] = useState(false)
  const [parentFederationType, setParentFederationType] = useState<FederationType | null>(null)
  const [federationType, setFederationType] = useState<FederationType | "">("")
  const { t } = useTranslation()

  const form = useForm<FederationFormValues>({
    initialValues: initialValues || {
      name: "",
      abbreviation: "",
      type: "",
      parentFederationId: "",
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
      type: (value) => (value ? null : t("auth.required")),
      adminEmail: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
    },
  })

  useEffect(() => {
    // Set federation type based on parent federation
    if (form.values.parentFederationId) {
      const fetchParentType = async () => {
        try {
          const response = await getFederationById(form.values.parentFederationId)
          if (response.success && response.data) {
            const parentType = response.data.type as FederationType
            setParentFederationType(parentType)

            // Determine federation type based on parent
            const type = determineFederationType(parentType)
            setFederationType(type)
            form.setFieldValue("type", type)
          }
        } catch (error) {
          console.error("Error fetching parent federation:", error)
        }
      }

      fetchParentType()
    } else {
      // If no parent, it's an international federation
      setParentFederationType(null)
      setFederationType("international")
      form.setFieldValue("type", "international")
    }
  }, [form.values.parentFederationId])

  const handleSubmit = async (values: FederationFormValues) => {
    setLoading(true)
    try {
      await onSubmit(values)

      notifications.show({
        title: initialValues ? t("federations.updateSuccess") : t("federations.createSuccess"),
        message: initialValues ? t("federations.federationUpdated") : t("federations.federationCreated"),
        color: "green",
      })
    } catch (error) {
      notifications.show({
        title: initialValues ? t("federations.updateFailed") : t("federations.createFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get federation type options based on parent federation
  const getFederationTypeOptions = () => {
    if (!form.values.parentFederationId) {
      return [{ value: "international", label: t("federations.types.international") }]
    }

    switch (parentFederationType) {
      case "international":
        return [{ value: "continental", label: t("federations.types.continental") }]
      case "continental":
        return [{ value: "national", label: t("federations.types.national") }]
      case "national":
        return [{ value: "federalState", label: t("federations.types.federalState") }]
      default:
        return [
          { value: "international", label: t("federations.types.international") },
          { value: "continental", label: t("federations.types.continental") },
          { value: "national", label: t("federations.types.national") },
          { value: "federalState", label: t("federations.types.federalState") },
        ]
    }
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={3} mb="md">
          {initialValues ? t("federations.edit") : t("federations.create")}
        </Title>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              required
              label={t("federations.name")}
              placeholder={t("federations.enterName")}
              {...form.getInputProps("name")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              required
              label={t("federations.abbreviation")}
              placeholder={t("federations.enterAbbreviation")}
              {...form.getInputProps("abbreviation")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Select
              label={t("federations.parentFederation")}
              placeholder={t("federations.selectParentFederation")}
              data={parentFederations}
              {...form.getInputProps("parentFederationId")}
              mb="md"
              clearable
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              required
              label={t("federations.type")}
              placeholder={t("federations.selectType")}
              data={getFederationTypeOptions()}
              {...form.getInputProps("type")}
              mb="md"
              disabled={!!form.values.parentFederationId} // Disable if parent is selected
            />
          </Grid.Col>
        </Grid>

        <Divider my="md" label={t("federations.admin")} />

        <TextInput
          required
          label={t("federations.adminEmail")}
          placeholder="admin@example.com"
          {...form.getInputProps("adminEmail")}
          mb="md"
        />

        <Switch
          label={t("federations.sendInviteEmail")}
          {...form.getInputProps("sendInvite", { type: "checkbox" })}
          mb="lg"
        />

        <Divider my="md" label={t("federations.contact")} />

        <TextInput
          label={t("federations.contactName")}
          placeholder={t("federations.enterContactName")}
          {...form.getInputProps("contactName")}
          mb="md"
        />

        <TextInput
          label={t("federations.contactEmail")}
          placeholder="contact@example.com"
          {...form.getInputProps("contactEmail")}
          mb="md"
        />

        <TextInput
          label={t("federations.contactPhone")}
          placeholder={t("federations.enterContactPhone")}
          {...form.getInputProps("contactPhone")}
          mb="md"
        />

        <TextInput
          label={t("federations.website")}
          placeholder="https://example.com"
          {...form.getInputProps("website")}
          mb="md"
        />

        <Divider my="md" label={t("federations.address")} />

        <TextInput
          label={t("federations.address")}
          placeholder={t("federations.enterAddress")}
          {...form.getInputProps("address")}
          mb="md"
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label={t("federations.city")}
              placeholder={t("federations.enterCity")}
              {...form.getInputProps("city")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label={t("federations.country")}
              placeholder={t("federations.enterCountry")}
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

