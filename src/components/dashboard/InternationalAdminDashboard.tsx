"use client"

import { useEffect, useState } from "react"
import { Grid, Card, Title, Text, Group, Button, TextInput, SimpleGrid, ActionIcon, Menu, Loader, Box } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Plus, MoreVertical, Edit, Trash, Mail, Search } from "lucide-react"
import { Link } from "react-router-dom"
import type { Federation, Competition } from "../../types"
import { getFederationById, getFederationsByType } from "../../services/federationService"
import { getCompetitionsByFederation } from "../../services/competitionService"

interface InternationalAdminDashboardProps {
  federationId: string
}

export function InternationalAdminDashboard({ federationId }: InternationalAdminDashboardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [federation, setFederation] = useState<Federation | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [continentalFederations, setContinentalFederations] = useState<Federation[]>([])
  const [searchCompetitions, setSearchCompetitions] = useState("")
  const [searchFederations, setSearchFederations] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch federation details
      const fedResponse = await getFederationById(federationId)
      if (fedResponse.success && fedResponse.data) {
        setFederation(fedResponse.data)
      }

      // Fetch competitions
      const compsResponse = await getCompetitionsByFederation(federationId)
      if (compsResponse.success && compsResponse.data) {
        setCompetitions(compsResponse.data)
      }

      // Fetch continental federations
      const contFedsResponse = await getFederationsByType("continental")
      if (contFedsResponse.success && contFedsResponse.data) {
        setContinentalFederations(contFedsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (federationId) {
      fetchData()
    }
  }, [federationId])

  const filteredCompetitions = competitions.filter(comp => 
    comp.name.toLowerCase().includes(searchCompetitions.toLowerCase())
  )

  const filteredFederations = continentalFederations.filter(fed => 
    fed.name.toLowerCase().includes(searchFederations.toLowerCase()) ||
    fed.abbreviation.toLowerCase().includes(searchFederations.toLowerCase())
  )

  if (loading) {
    return (
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder p="xl">
            <Group position="center">
              <Loader />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    )
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={2} mb="md">{t("dashboard.internationalCompetitions")}</Title>
          <TextInput
            icon={<Search size={16} />}
            placeholder={t("common.search")}
            value={searchCompetitions}
            onChange={(e) => setSearchCompetitions(e.target.value)}
            mb="md"
          />
          {filteredCompetitions.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {filteredCompetitions.map((comp) => (
                <Link key={comp._id} to={`/competitions/${comp._id}`} style={{ textDecoration: 'none' }}>
                  <Card withBorder p="md">
                    <Group position="apart">
                      <div>
                        <Text weight={500}>{comp.name}</Text>
                        <Text size="sm" color="dimmed">
                          {new Date(comp.startDate).toLocaleDateString()} • {comp.city}, {comp.country}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </Link>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noInternationalCompetitions")}</Text>
          )}
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={2} mb="md">{t("dashboard.federations")}</Title>
          <TextInput
            icon={<Search size={16} />}
            placeholder={t("common.search")}
            value={searchFederations}
            onChange={(e) => setSearchFederations(e.target.value)}
            mb="md"
          />
          {filteredFederations.length > 0 ? (
            <SimpleGrid cols={1} spacing="md">
              {/* IPF Federation Card */}
              <Link to={`/federations/${federation?._id}`} style={{ textDecoration: 'none' }}>
                <Card withBorder p="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>International Powerlifting Federation (IPF)</Text>
                      <Text size="sm" color="dimmed">IPF</Text>
                    </div>
                  </Group>
                </Card>
              </Link>

              {/* Continental Federations */}
              {filteredFederations.map((fed) => (
                <Link key={fed._id} to={`/federations/${fed._id}`} style={{ textDecoration: 'none' }}>
                  <Card withBorder p="md">
                    <Group position="apart">
                      <div>
                        <Text weight={500}>{fed.name}</Text>
                        <Text size="sm" color="dimmed">{fed.abbreviation}</Text>
                      </div>
                    </Group>
                  </Card>
                </Link>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="dimmed">{t("dashboard.noFederations")}</Text>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

