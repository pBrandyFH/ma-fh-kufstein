"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Title, Loader, Group } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { notifications } from "@mantine/notifications"
import { FederationForm } from "./FederationForm"
import { getFederationById, updateFederation, getAllFederations } from "../../../services/federationService"
import type { Federation, FederationFormValues, SelectOption } from "../../../types"

export function FederationEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [parentFederations, setParentFederations] = useState<SelectOption[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      setLoading(true)
      try {
        // Fetch federation details
        const response = await getFederationById(id)
        if (response.success && response.data) {
          setFederation(response.data)
        } else {
          notifications.show({
            title: t("federations.notFound"),
            message: t("federations.federationNotFound"),
            color: "red",
          })
          navigate("/federations")
        }

        // Fetch parent federations for dropdown
        const parentsResponse = await getAllFederations()
        if (parentsResponse.success && parentsResponse.data) {
          // Filter out the current federation and its children
          const filteredFederations = parentsResponse.data
            .filter((fed) => fed._id !== id)
            .map((fed) => ({
              value: fed._id,
              label: `${fed.name} (${fed.abbreviation})`,
            }))
          setParentFederations(filteredFederations)
        }
      } catch (error) {
        console.error("Error fetching federation:", error)
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

  const handleSubmit = async (values: FederationFormValues) => {
    if (!id) return

    try {
      const response = await updateFederation(id, values)
      if (response.success) {
        notifications.show({
          title: t("federations.updateSuccess"),
          message: t("federations.federationUpdated"),
          color: "green",
        })
        navigate(`/federations/${id}`)
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      notifications.show({
        title: t("federations.updateFailed"),
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

  if (!federation) {
    return (
      <Card withBorder p="xl">
        <Title order={3}>{t("federations.notFound")}</Title>
      </Card>
    )
  }

  // Convert federation data to form values
  const initialValues: FederationFormValues = {
    name: federation.name,
    abbreviation: federation.abbreviation,
    type: federation.type,
    parentFederationId: federation.parentFederation || "",
    adminEmail: federation.contactEmail || "",
    contactName: federation.contactName || "",
    contactEmail: federation.contactEmail || "",
    contactPhone: federation.contactPhone || "",
    website: federation.website || "",
    address: federation.address || "",
    city: federation.city || "",
    country: federation.country || "",
    sendInvite: false,
  }

  return (
    <Card withBorder p="xl">
      <FederationForm initialValues={initialValues} onSubmit={handleSubmit} parentFederations={parentFederations} />
    </Card>
  )
}

