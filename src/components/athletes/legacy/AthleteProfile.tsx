"use client"

import { useState, useEffect } from "react"
import { Card, Title, Text, Group, Avatar, Badge, Tabs, Table, Grid, Divider, SimpleGrid, Container, Stack, Button } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Edit } from "lucide-react"

interface AthleteProfileProps {
  athleteId?: string
}

export function AthleteProfile({ athleteId: propAthleteId }: AthleteProfileProps) {
  const { t } = useTranslation()
  const { id } = useParams()
  const athleteId = propAthleteId || id
  const [loading, setLoading] = useState(true)
  const [athlete, setAthlete] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  useEffect(() => {
    // Mock data - in a real app, these would be API calls
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAthlete({
        id: athleteId,
        firstName: "John",
        lastName: "Doe",
        federation: "Austria",
        club: "Vienna Powerlifting Club",
        weightCategory: "-83kg",
        ageCategory: "Open",
        dateOfBirth: "1990-05-15",
        bestTotal: 620,
        bestWilks: 380.5,
        bestIpfPoints: 650.2,
        nationalRanking: 2,
        internationalRanking: 15,
      })

      setResults([
        {
          id: "1",
          competition: "2023 National Championships",
          date: "2023-03-15",
          location: "Vienna, Austria",
          weightCategory: "-83kg",
          bodyweight: 82.5,
          squat: 220,
          bench: 150,
          deadlift: 250,
          total: 620,
          wilks: 380.5,
          ipfPoints: 650.2,
          place: 1,
        },
        {
          id: "2",
          competition: "2022 European Championships",
          date: "2022-10-22",
          location: "Berlin, Germany",
          weightCategory: "-83kg",
          bodyweight: 82.1,
          squat: 215,
          bench: 145,
          deadlift: 245,
          total: 605,
          wilks: 372.8,
          ipfPoints: 640.5,
          place: 5,
        },
        {
          id: "3",
          competition: "2022 National Championships",
          date: "2022-03-18",
          location: "Vienna, Austria",
          weightCategory: "-83kg",
          bodyweight: 81.8,
          squat: 210,
          bench: 140,
          deadlift: 240,
          total: 590,
          wilks: 365.2,
          ipfPoints: 630.1,
          place: 2,
        },
      ])

      setPerformanceData([
        { date: "2022-03", total: 590, squat: 210, bench: 140, deadlift: 240 },
        { date: "2022-10", total: 605, squat: 215, bench: 145, deadlift: 245 },
        { date: "2023-03", total: 620, squat: 220, bench: 150, deadlift: 250 },
      ])

      setLoading(false)
    }

    fetchData()
  }, [athleteId])

  if (loading) {
    return (
      <Card withBorder p="xl">
        <Text align="center">{t("common.loading")}</Text>
      </Card>
    )
  }

  if (!athlete) {
    return (
      <Card withBorder p="xl">
        <Text align="center">{t("athletes.notFound")}</Text>
      </Card>
    )
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Group position="apart">
            <Group>
              <Avatar size={80} radius="xl" color="blue">
                {athlete.firstName.charAt(0)}
                {athlete.lastName.charAt(0)}
              </Avatar>
              <div>
                <Title order={2}>
                  {athlete.firstName} {athlete.lastName}
                </Title>
                <Group spacing="xs">
                  <Text color="dimmed">{athlete.club}</Text>
                  <Text color="dimmed">•</Text>
                  <Text color="dimmed">{athlete.federation}</Text>
                </Group>
              </div>
            </Group>
            <Group>
              <Badge size="lg">{athlete.weightCategory}</Badge>
              <Badge size="lg" color="grape">
                {athlete.ageCategory}
              </Badge>
            </Group>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col md={4}>
        <Card withBorder p="xl" h="100%">
          <Title order={3} mb="md">
            {t("athletes.personalBests")}
          </Title>
          <SimpleGrid cols={1} spacing="md">
            <div>
              <Text size="sm" color="dimmed">
                {t("results.total")}
              </Text>
              <Text size="xl" weight={700}>
                {athlete.bestTotal} kg
              </Text>
            </div>
            <Divider />
            <div>
              <Text size="sm" color="dimmed">
                {t("results.wilks")}
              </Text>
              <Text size="xl" weight={700}>
                {athlete.bestWilks}
              </Text>
            </div>
            <Divider />
            <div>
              <Text size="sm" color="dimmed">
                {t("results.ipfPoints")}
              </Text>
              <Text size="xl" weight={700}>
                {athlete.bestIpfPoints}
              </Text>
            </div>
            <Divider />
            <div>
              <Text size="sm" color="dimmed">
                {t("athletes.nationalRanking")}
              </Text>
              <Text size="xl" weight={700}>
                #{athlete.nationalRanking}
              </Text>
            </div>
            <Divider />
            <div>
              <Text size="sm" color="dimmed">
                {t("athletes.internationalRanking")}
              </Text>
              <Text size="xl" weight={700}>
                #{athlete.internationalRanking}
              </Text>
            </div>
          </SimpleGrid>
        </Card>
      </Grid.Col>

      <Grid.Col md={8}>
        <Card withBorder p="xl" h="100%">
          <Title order={3} mb="md">
            {t("athletes.performanceHistory")}
          </Title>
          <Tabs defaultValue="total">
            <Tabs.List mb="md">
              <Tabs.Tab value="total">{t("results.total")}</Tabs.Tab>
              <Tabs.Tab value="lifts">{t("athletes.individualLifts")}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="total">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Tabs.Panel>

            <Tabs.Panel value="lifts">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="squat" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="bench" stroke="#40c057" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="deadlift" stroke="#fa5252" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Card withBorder p="xl">
          <Title order={3} mb="md">
            {t("athletes.competitionHistory")}
          </Title>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>{t("results.date")}</th>
                <th>{t("results.competition")}</th>
                <th>{t("results.weightCategory")}</th>
                <th>{t("results.bodyweight")}</th>
                <th>{t("results.squat")}</th>
                <th>{t("results.bench")}</th>
                <th>{t("results.deadlift")}</th>
                <th>{t("results.total")}</th>
                <th>{t("results.wilks")}</th>
                <th>{t("results.place")}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.date}</td>
                  <td>{result.competition}</td>
                  <td>{result.weightCategory}</td>
                  <td>{result.bodyweight}</td>
                  <td>{result.squat}</td>
                  <td>{result.bench}</td>
                  <td>{result.deadlift}</td>
                  <td>
                    <strong>{result.total}</strong>
                  </td>
                  <td>{result.wilks}</td>
                  <td>{result.place}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Grid.Col>
    </Grid>
  )
}

