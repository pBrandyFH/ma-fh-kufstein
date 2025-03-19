"use client"

import { useState } from "react"
import { useForm } from "@mantine/form"
import { Button, Box, Select, Title, MultiSelect, Card, Text, Group } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"

interface NominationFormProps {
  onSubmit: (values: any) => Promise<void>
  competitions: { value: string; label: string }[]
  athletes: { value: string; label: string }[]
}

export function NominationForm({ onSubmit, competitions, athletes }: NominationFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [competitionDetails, setCompetitionDetails] = useState<any>(null)
  const { t } = useTranslation()

  const form = useForm({
    initialValues: {
      competitionId: "",
      athletes: [],
    },
    validate: {
      competitionId: (value) => (value ? null : t("auth.required")),
      athletes: (value) => (value.length > 0 ? null : t("nominations.selectAtLeastOneAthlete")),
    },
  })

  // Mock function to fetch competition details
  const fetchCompetitionDetails = async (competitionId: string) => {
    // In a real app, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      id: competitionId,
      name: "2023 European Powerlifting Championships",
      date: "2023-05-15",
      location: "Paris, France",
      equipmentType: "classic",
      ageCategories: ["open", "juniors"],
      federation: "EPF",
    }
  }

  const handleCompetitionChange = async (value: string) => {
    form.setFieldValue("competitionId", value)
    setSelectedCompetition(value)

    if (value) {
      const details = await fetchCompetitionDetails(value)
      setCompetitionDetails(details)
    } else {
      setCompetitionDetails(null)
    }
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      await onSubmit(values)

      notifications.show({
        title: t("nominations.success"),
        message: t("nominations.athletesNominated"),
        color: "green",
      })

      // Reset form
      form.reset()
      setSelectedCompetition(null)
      setCompetitionDetails(null)
    } catch (error) {
      notifications.show({
        title: t("nominations.failed"),
        message: t("auth.errorOccurred"),
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
          {t("nominations.create")}
        </Title>

        <Select
          required
          label={t("nominations.competition")}
          placeholder={t("nominations.selectCompetition")}
          data={competitions}
          {...form.getInputProps("competitionId")}
          mb="md"
          onChange={handleCompetitionChange}
        />

        {competitionDetails && (
          <Card withBorder mb="xl">
            <Title order={4}>{competitionDetails.name}</Title>
            <Group position="apart" mt="md">
              <Text>
                {t("competitions.date")}: {competitionDetails.date}
              </Text>
              <Text>
                {t("competitions.location")}: {competitionDetails.location}
              </Text>
            </Group>
            <Text mt="xs">
              {t("competitions.equipmentType")}: {t(`competitions.equipmentTypes.${competitionDetails.equipmentType}`)}
            </Text>
            <Text mt="xs">
              {t("competitions.ageCategories")}:{" "}
              {competitionDetails.ageCategories.map((cat: string) => t(`competitions.ageCategories.${cat}`)).join(", ")}
            </Text>
          </Card>
        )}

        <MultiSelect
          required
          label={t("nominations.athletes")}
          placeholder={t("nominations.selectAthletes")}
          data={athletes}
          {...form.getInputProps("athletes")}
          mb="md"
          disabled={!selectedCompetition}
          searchable
        />

        <Button type="submit" loading={loading} mt="lg" disabled={!selectedCompetition}>
          {t("nominations.submit")}
        </Button>
      </form>
    </Box>
  )
}

