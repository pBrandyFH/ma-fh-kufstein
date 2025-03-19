"use client"

import { useState } from "react"
import { useForm } from "@mantine/form"
import { TextInput, Button, Box, Select, Grid, DatePicker, Divider, Title, Switch } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import type { AthleteFormValues, Gender } from "../../types"

interface AthleteFormProps {
  initialValues?: Partial<AthleteFormValues>
  onSubmit: (values: AthleteFormValues) => Promise<void>
  clubs: { value: string; label: string }[]
  federations: { value: string; label: string }[]
}

export function AthleteForm({ initialValues, onSubmit, clubs, federations }: AthleteFormProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const form = useForm<AthleteFormValues>({
    initialValues: initialValues || {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: null,
      gender: "",
      weightCategory: "",
      clubId: "",
      federationId: "",
      sendInvite: true,
    },
    validate: {
      firstName: (value) => (value ? null : t("auth.required")),
      lastName: (value) => (value ? null : t("auth.required")),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("auth.invalidEmail")),
      gender: (value) => (value ? null : t("auth.required")),
      weightCategory: (value) => (value ? null : t("auth.required")),
      clubId: (value) => (value ? null : t("auth.required")),
      federationId: (value) => (value ? null : t("auth.required")),
    },
  })

  const handleSubmit = async (values: AthleteFormValues) => {
    setLoading(true)
    try {
      await onSubmit(values)

      notifications.show({
        title: initialValues ? t("athletes.updateSuccess") : t("athletes.createSuccess"),
        message: initialValues ? t("athletes.athleteUpdated") : t("athletes.athleteCreated"),
        color: "green",
      })
    } catch (error) {
      notifications.show({
        title: initialValues ? t("athletes.updateFailed") : t("athletes.createFailed"),
        message: error instanceof Error ? error.message : t("auth.errorOccurred"),
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate weight category options based on gender
  const getWeightCategoryOptions = () => {
    const gender = form.values.gender as Gender
    if (!gender) return []

    if (gender === "male") {
      return [
        { value: "u53", label: t("athletes.weightCategories.men.u53") },
        { value: "u59", label: t("athletes.weightCategories.men.u59") },
        { value: "u66", label: t("athletes.weightCategories.men.u66") },
        { value: "u74", label: t("athletes.weightCategories.men.u74") },
        { value: "u83", label: t("athletes.weightCategories.men.u83") },
        { value: "u93", label: t("athletes.weightCategories.men.u93") },
        { value: "u105", label: t("athletes.weightCategories.men.u105") },
        { value: "u120", label: t("athletes.weightCategories.men.u120") },
        { value: "o120", label: t("athletes.weightCategories.men.o120") },
      ]
    } else {
      return [
        { value: "u43", label: t("athletes.weightCategories.women.u43") },
        { value: "u47", label: t("athletes.weightCategories.women.u47") },
        { value: "u52", label: t("athletes.weightCategories.women.u52") },
        { value: "u57", label: t("athletes.weightCategories.women.u57") },
        { value: "u63", label: t("athletes.weightCategories.women.u63") },
        { value: "u69", label: t("athletes.weightCategories.women.u69") },
        { value: "u76", label: t("athletes.weightCategories.women.u76") },
        { value: "u84", label: t("athletes.weightCategories.women.u84") },
        { value: "o84", label: t("athletes.weightCategories.women.o84") },
      ]
    }
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={3} mb="md">
          {initialValues ? t("athletes.edit") : t("athletes.create")}
        </Title>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              required
              label={t("athletes.firstName")}
              placeholder={t("auth.enterFirstName")}
              {...form.getInputProps("firstName")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              required
              label={t("athletes.lastName")}
              placeholder={t("auth.enterLastName")}
              {...form.getInputProps("lastName")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <TextInput
          required
          label={t("athletes.email")}
          placeholder="athlete@example.com"
          {...form.getInputProps("email")}
          mb="md"
        />

        <Grid>
          <Grid.Col span={6}>
            <DatePicker
              required
              label={t("athletes.dateOfBirth")}
              placeholder={t("athletes.selectDate")}
              {...form.getInputProps("dateOfBirth")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              required
              label={t("athletes.gender")}
              placeholder={t("athletes.selectGender")}
              data={[
                { value: "male", label: t("athletes.male") },
                { value: "female", label: t("athletes.female") },
              ]}
              {...form.getInputProps("gender")}
              mb="md"
              onChange={(value) => {
                form.setFieldValue("gender", value || "")
                form.setFieldValue("weightCategory", "")
              }}
            />
          </Grid.Col>
        </Grid>

        <Select
          required
          label={t("athletes.weightCategory")}
          placeholder={t("athletes.selectWeightCategory")}
          data={getWeightCategoryOptions()}
          {...form.getInputProps("weightCategory")}
          mb="md"
          disabled={!form.values.gender}
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              required
              label={t("athletes.federation")}
              placeholder={t("athletes.selectFederation")}
              data={federations}
              {...form.getInputProps("federationId")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              required
              label={t("athletes.club")}
              placeholder={t("athletes.selectClub")}
              data={clubs}
              {...form.getInputProps("clubId")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        <Switch
          label={t("athletes.sendInviteEmail")}
          {...form.getInputProps("sendInvite", { type: "checkbox" })}
          mb="lg"
        />

        <Button type="submit" loading={loading}>
          {initialValues ? t("common.save") : t("common.create")}
        </Button>
      </form>
    </Box>
  )
}

