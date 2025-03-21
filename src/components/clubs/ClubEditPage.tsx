"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Title, Loader, Group } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { notifications } from "@mantine/notifications"
import { ClubForm } from "./ClubForm"
import { getClubById, updateClub } from "../../services/clubService"
import { getAllFederations } from "../../services/federationService"
import type { Club, ClubFormValues, SelectOption } from "../../types"

export function ClubEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState<Club | null>(null)
  const [federations, setFederations] = useState<SelectOption[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      setLoading(true)
      try {
        // Fetch club details
        const response = await getClubById(id)
        if (response.success && response.data) {
          setClub(response.data)
        } else {
          notifications.show({
            title: t("clubs.notFound"),
            message: t("clubs.clubNotFound"),
            color: "red",
          })
          navigate("/clubs")
        }

        // Fetch federations for dropdown
        const fedsResponse = await getAllFederations()
        if (fedsResponse.success && fedsResponse.data) {
          const fedOptions = fedsResponse.data.map((fed) => ({
            value: fed._id,
            label: `${fed.name} (${fed.abbreviation})`,
          }))
          setFederations(fedOptions)
        }
      } catch (error) {
        console.error("Error fetching club:", error)
        notifications.show({
          title: t("common.error"),
          message: error instanceof Error ? error.message : t("common.unknownError"),
          color: "red",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, t])

  const handleSubmit = async (values: ClubFormValues) => {
    if (!id) return

    try {
      const response = await updateClub(id, values)
      if (response.success) {
        notifications.show({
          title: t("clubs.updateSuccess"),
          message: t("clubs.clubUpdated"),
          color: "green",
        })
        navigate(`/clubs/${id}`)
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      notifications.show({
        title: t("clubs.updateFailed"),
        message: error instanceof Error ? error.message : t("common.unknownError"),
        color: "red",
      })
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

  if (!club) {
    return (
      <Card withBorder p="xl">
        <Title order={3}>{t("clubs.notFound")}</Title>
      </Card>
    )
  }

  // Convert club data to form values
  const initialValues: ClubFormValues = {
    name: club.name,
    abbreviation: club.abbreviation,
    federationId: typeof club.federationId === "string" ? club.federationId : club.federationId._id,
    adminEmail: club.contactEmail || "",
    contactName: club.contactName || "",
    contactEmail: club.contactEmail || "",
    contactPhone: club.contactPhone || "",
    website: club.website || "",
    address: club.address || "",
    city: club.city || "",
    country: club.country || "",
    sendInvite: false,
  }

  return (
    <Card withBorder p="xl">
      <ClubForm initialValues={initialValues} onSubmit={handleSubmit} federations={federations} />
    </Card>
  )
}

