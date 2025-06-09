"use client"

import { useState, useEffect } from "react"
import { Card, Title, Text, Group, Select, Table, Badge, Tabs, TextInput, ActionIcon, Box, Stack } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { Search, X } from "lucide-react"

interface ResultsViewProps {
  isLive?: boolean
}

export function ResultsView({ isLive = false }: ResultsViewProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    federation: "",
    weightCategory: "",
    ageCategory: "",
    equipmentType: "",
  })

  useEffect(() => {
    // Mock data - in a real app, these would be API calls
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCompetitions([
        { value: "1", label: "2023 National Championships" },
        { value: "2", label: "2023 European Championships" },
        { value: "3", label: "2023 World Championships" },
      ])

      setResults([
        {
          id: "1",
          athlete: "John Doe",
          federation: "Austria",
          weightCategory: "-83kg",
          ageCategory: "Open",
          squat: 220,
          bench: 150,
          deadlift: 250,
          total: 620,
          wilks: 380.5,
          place: 1,
        },
        {
          id: "2",
          athlete: "Mike Smith",
          federation: "Germany",
          weightCategory: "-83kg",
          ageCategory: "Open",
          squat: 210,
          bench: 160,
          deadlift: 240,
          total: 610,
          wilks: 375.2,
          place: 2,
        },
        {
          id: "3",
          athlete: "Robert Johnson",
          federation: "France",
          weightCategory: "-83kg",
          ageCategory: "Open",
          squat: 200,
          bench: 155,
          deadlift: 245,
          total: 600,
          wilks: 370.1,
          place: 3,
        },
      ])

      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredResults = results.filter((result) => {
    // Filter by search query
    if (searchQuery && !result.athlete.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by federation
    if (filters.federation && result.federation !== filters.federation) {
      return false
    }

    // Filter by weight category
    if (filters.weightCategory && result.weightCategory !== filters.weightCategory) {
      return false
    }

    // Filter by age category
    if (filters.ageCategory && result.ageCategory !== filters.ageCategory) {
      return false
    }

    return true
  })

  const resetFilters = () => {
    setFilters({
      federation: "",
      weightCategory: "",
      ageCategory: "",
      equipmentType: "",
    })
    setSearchQuery("")
  }

  return (
    <Stack>
      <Group mb="md" position="apart">
        <Select
          placeholder={t("results.selectCompetition")}
          data={competitions}
          value={selectedCompetition}
          onChange={setSelectedCompetition}
          style={{ width: 300 }}
        />

        <TextInput
          placeholder={t("common.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          icon={<Search size={16} />}
          style={{ width: 250 }}
        />
      </Group>

      <Group mb="xl" position="apart">
        <Group>
          <Select
            placeholder={t("results.federation")}
            data={[
              { value: "Austria", label: "Austria" },
              { value: "Germany", label: "Germany" },
              { value: "France", label: "France" },
            ]}
            value={filters.federation}
            onChange={(value) => setFilters({ ...filters, federation: value || "" })}
            style={{ width: 150 }}
            clearable
          />

          <Select
            placeholder={t("results.weightCategory")}
            data={[
              { value: "-83kg", label: "-83kg" },
              { value: "-93kg", label: "-93kg" },
              { value: "-105kg", label: "-105kg" },
            ]}
            value={filters.weightCategory}
            onChange={(value) => setFilters({ ...filters, weightCategory: value || "" })}
            style={{ width: 150 }}
            clearable
          />

          <Select
            placeholder={t("results.ageCategory")}
            data={[
              { value: "Open", label: "Open" },
              { value: "Juniors", label: "Juniors" },
              { value: "Masters", label: "Masters" },
            ]}
            value={filters.ageCategory}
            onChange={(value) => setFilters({ ...filters, ageCategory: value || "" })}
            style={{ width: 150 }}
            clearable
          />
        </Group>

        <ActionIcon onClick={resetFilters} disabled={!searchQuery && !Object.values(filters).some(Boolean)}>
          <X size={16} />
        </ActionIcon>
      </Group>

      <Tabs defaultValue="total">
        <Tabs.List mb="md">
          <Tabs.Tab value="total">{t("results.total")}</Tabs.Tab>
          <Tabs.Tab value="squat">{t("results.squat")}</Tabs.Tab>
          <Tabs.Tab value="bench">{t("results.bench")}</Tabs.Tab>
          <Tabs.Tab value="deadlift">{t("results.deadlift")}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="total">
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>{t("results.place")}</th>
                  <th>{t("results.athlete")}</th>
                  <th>{t("results.federation")}</th>
                  <th>{t("results.weightCategory")}</th>
                  <th>{t("results.ageCategory")}</th>
                  <th>{t("results.squat")}</th>
                  <th>{t("results.bench")}</th>
                  <th>{t("results.deadlift")}</th>
                  <th>{t("results.total")}</th>
                  <th>{t("results.wilks")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} align="center">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <tr key={result.id}>
                      <td>{result.place}</td>
                      <td>{result.athlete}</td>
                      <td>{result.federation}</td>
                      <td>{result.weightCategory}</td>
                      <td>{result.ageCategory}</td>
                      <td>{result.squat}</td>
                      <td>{result.bench}</td>
                      <td>{result.deadlift}</td>
                      <td>
                        <strong>{result.total}</strong>
                      </td>
                      <td>{result.wilks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} align="center">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="squat">
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>{t("results.place")}</th>
                  <th>{t("results.athlete")}</th>
                  <th>{t("results.federation")}</th>
                  <th>{t("results.weightCategory")}</th>
                  <th>{t("results.ageCategory")}</th>
                  <th>{t("results.squat")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  [...filteredResults]
                    .sort((a, b) => b.squat - a.squat)
                    .map((result, index) => (
                      <tr key={result.id}>
                        <td>{index + 1}</td>
                        <td>{result.athlete}</td>
                        <td>{result.federation}</td>
                        <td>{result.weightCategory}</td>
                        <td>{result.ageCategory}</td>
                        <td>
                          <strong>{result.squat}</strong>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="bench">
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>{t("results.place")}</th>
                  <th>{t("results.athlete")}</th>
                  <th>{t("results.federation")}</th>
                  <th>{t("results.weightCategory")}</th>
                  <th>{t("results.ageCategory")}</th>
                  <th>{t("results.bench")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  [...filteredResults]
                    .sort((a, b) => b.bench - a.bench)
                    .map((result, index) => (
                      <tr key={result.id}>
                        <td>{index + 1}</td>
                        <td>{result.athlete}</td>
                        <td>{result.federation}</td>
                        <td>{result.weightCategory}</td>
                        <td>{result.ageCategory}</td>
                        <td>
                          <strong>{result.bench}</strong>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="deadlift">
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>{t("results.place")}</th>
                  <th>{t("results.athlete")}</th>
                  <th>{t("results.federation")}</th>
                  <th>{t("results.weightCategory")}</th>
                  <th>{t("results.ageCategory")}</th>
                  <th>{t("results.deadlift")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  [...filteredResults]
                    .sort((a, b) => b.deadlift - a.deadlift)
                    .map((result, index) => (
                      <tr key={result.id}>
                        <td>{index + 1}</td>
                        <td>{result.athlete}</td>
                        <td>{result.federation}</td>
                        <td>{result.weightCategory}</td>
                        <td>{result.ageCategory}</td>
                        <td>
                          <strong>{result.deadlift}</strong>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

