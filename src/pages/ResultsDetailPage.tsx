import { useState } from "react";
import { Page } from "@/components/common/Page";
import { useParams } from "react-router-dom";
import { useDataFetching } from "@/hooks/useDataFetching";
import { getCompetitionById } from "@/services/competitionService";
import { resultService } from "@/services/resultService";
import { maleCategories, femaleCategories } from "@/utils/weightCategories";
import {
  Stack,
  Card,
  Title,
  Text,
  Group,
  Badge,
  TextInput,
  Table,
  LoadingOverlay,
  Select,
  Grid,
  Box,
  SegmentedControl,
  Divider,
  Paper,
} from "@mantine/core";
import {
  IconSearch,
  IconCalendar,
  IconMapPin,
  IconBuilding,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { Result } from "@/types";

type GroupedResults = {
  [gender: string]: {
    [weightCategory: string]: {
      [ageCategory: string]: Result[];
    };
  };
};

const getWeightCategoryValue = (category: string): number => {
  // Handle special categories
  if (category.startsWith("o")) {
    // For 'over' categories, add a large number to ensure they come after 'under' categories
    return parseInt(category.slice(1)) + 10000;
  }
  if (category.startsWith("u")) {
    // For 'under' categories, use the number directly
    return parseInt(category.slice(1));
  }
  // For regular categories, just use the number
  return parseInt(category.replace(/[^0-9]/g, ""));
};

const TABLE_COLUMNS = {
  place: { width: 80 },
  name: { width: "25%" },
  bodyweight: { width: 100 },
  squat: { width: 100 },
  bench: { width: 100 },
  deadlift: { width: 100 },
  total: { width: 100 },
  wilks: { width: 100 },
} as const;

export default function ResultsDetailPage() {
  const { t } = useTranslation();
  const { id: competitionId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeightCategory, setSelectedWeightCategory] = useState<
    string | null
  >(null);
  const [selectedGender, setSelectedGender] = useState<string>("male");
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string | null>(
    null
  );

  const {
    data: competition,
    loading: competitionLoading,
    error: competitionError,
  } = useDataFetching({
    fetchFunction: () => getCompetitionById(competitionId!),
  });

  const {
    data: groupedResults,
    loading: resultsLoading,
    error: resultsError,
  } = useDataFetching<GroupedResults>({
    fetchFunction: () => resultService.getResultsByCompetition(competitionId!),
  });

  const loading = competitionLoading || resultsLoading;

  const getWeightCategoryOptions = () => {
    if (!groupedResults) return [];
    const categories = new Set<string>();
    Object.values(groupedResults).forEach((genderResults) => {
      Object.keys(genderResults).forEach((category) =>
        categories.add(category)
      );
    });

    // Get the appropriate category list based on gender
    const categoryList =
      selectedGender === "male" ? maleCategories : femaleCategories;

    // Filter to only include categories that exist in the results
    return categoryList
      .filter((cat) => categories.has(cat.value))
      .map((cat) => ({
        value: cat.value,
        label: cat.label,
      }));
  };

  const getAgeCategoryOptions = (gender: string, weightCategory: string) => {
    if (!groupedResults?.[gender]?.[weightCategory]) return [];
    return Object.keys(groupedResults[gender][weightCategory]).map(
      (category) => ({
        value: category,
        label: t(`competitions.ageCategories.${category}`),
      })
    );
  };

  const filterResults = (results: Result[]) => {
    if (!Array.isArray(results)) return [];

    return results.filter((result) => {
      const athleteName =
        typeof result.athleteId === "object"
          ? `${result.athleteId.firstName} ${result.athleteId.lastName}`
          : "";

      const matchesSearch = searchQuery
        ? athleteName.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesWeightCategory =
        !selectedWeightCategory ||
        result.weightCategory === selectedWeightCategory;

      return matchesSearch && matchesWeightCategory;
    });
  };

  const hasFilteredResults = (results: Result[]) => {
    if (!Array.isArray(results)) return false;
    return filterResults(results).length > 0;
  };

  const hasAnyFilteredResultsInAgeCategories = (
    ageCategories: Record<string, Result[]>
  ) => {
    return Object.values(ageCategories).some((results) =>
      hasFilteredResults(results)
    );
  };

  if (competitionError || resultsError) {
    return (
      <Page title={t("common.error")}>
        <Text color="red">{competitionError || resultsError}</Text>
      </Page>
    );
  }

  return (
    <Page title={competition?.name || t("results.title")}>
      <LoadingOverlay visible={loading} />
      <Stack spacing="xl">
        {/* Competition Info Card */}
        <Card withBorder p="md">
          <Stack spacing="md">
            <Group position="apart">
              <Title order={2}>{competition?.name}</Title>
              <Badge
                size="lg"
                color={competition?.status === "completed" ? "green" : "blue"}
              >
                {t(`competitions.status.${competition?.status}`)}
              </Badge>
            </Group>

            <Group spacing="xl">
              <Group spacing="xs">
                <IconCalendar size={16} />
                <Text size="sm">
                  {competition?.startDate &&
                    format(new Date(competition.startDate), "PPP")}
                  {competition?.endDate &&
                    ` - ${format(new Date(competition.endDate), "PPP")}`}
                </Text>
              </Group>

              <Group spacing="xs">
                <IconMapPin size={16} />
                <Text size="sm">
                  {competition?.city}, {competition?.country}
                </Text>
              </Group>

              {competition?.hostFederation && (
                <Group spacing="xs">
                  <IconBuilding size={16} />
                  <Text size="sm">{competition.hostFederation.name}</Text>
                </Group>
              )}
            </Group>

            <Group spacing="xs">
              <Badge variant="light" color="blue">
                {t(`competitions.equipmentTypes.${competition?.equipmentType}`)}
              </Badge>
              {competition?.ageCategories.map((category) => (
                <Badge key={category} variant="light" color="gray">
                  {t(`competitions.ageCategories.${category}`)}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Card>

        {/* Results Section */}
        <Card withBorder p="md">
          <Stack spacing="xl">
            <Title order={3}>{t("results.title")}</Title>

            {/* Filters */}
            <Grid>
              <Grid.Col span={searchQuery ? 12 : 8}>
                <TextInput
                  placeholder={t("common.search")}
                  icon={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  style={{ width: "100%" }}
                />
              </Grid.Col>
              {!searchQuery && (
                <Grid.Col span={4}>
                  <Select
                    placeholder={t("results.weightCategory")}
                    data={getWeightCategoryOptions()}
                    value={selectedWeightCategory}
                    onChange={setSelectedWeightCategory}
                    clearable
                    style={{ width: "100%" }}
                  />
                </Grid.Col>
              )}
            </Grid>

            {/* Gender Segmented Control */}
            <SegmentedControl
              fullWidth
              value={selectedGender}
              onChange={setSelectedGender}
              data={[
                { value: "male", label: t("common.male") },
                { value: "female", label: t("common.female") },
              ]}
            />

            {/* Results Tables */}
            <Stack spacing="xl">
              {groupedResults?.[selectedGender] &&
                Object.entries(groupedResults[selectedGender])
                  .sort(([a], [b]) => {
                    const categoryList =
                      selectedGender === "male"
                        ? maleCategories
                        : femaleCategories;
                    const aIndex = categoryList.findIndex(
                      (cat) => cat.value === a
                    );
                    const bIndex = categoryList.findIndex(
                      (cat) => cat.value === b
                    );
                    return aIndex - bIndex;
                  })
                  .filter(
                    ([_, ageCategories]) =>
                      // Show all groups when not searching, or only groups with filtered results when searching
                      !searchQuery ||
                      hasAnyFilteredResultsInAgeCategories(ageCategories)
                  )
                  .map(([weightCategory, ageCategories]) => {
                    const ageCategoryOptions = getAgeCategoryOptions(
                      selectedGender,
                      weightCategory
                    );
                    const hasMultipleAgeCategories =
                      ageCategoryOptions.length > 1;

                    return (
                      <Paper key={weightCategory} withBorder p="md" radius="md">
                        <Stack spacing="xl">
                          <Title order={4}>
                            {t(
                              `athletes.weightCategories.${selectedGender}.${weightCategory}`
                            )}
                          </Title>

                          {hasMultipleAgeCategories && (
                            <SegmentedControl
                              fullWidth
                              value={
                                selectedAgeCategory ||
                                ageCategoryOptions[0]?.value
                              }
                              onChange={setSelectedAgeCategory}
                              data={ageCategoryOptions.filter(
                                (option) =>
                                  // Only show age categories that have filtered results when searching
                                  !searchQuery ||
                                  hasFilteredResults(
                                    ageCategories[option.value]
                                  )
                              )}
                            />
                          )}

                          <Stack spacing="xl">
                            {Object.entries(ageCategories)
                              .filter(
                                ([ageCategory]) =>
                                  // Filter by selected age category and check for filtered results
                                  (!selectedAgeCategory ||
                                    ageCategory === selectedAgeCategory) &&
                                  (!searchQuery ||
                                    hasFilteredResults(
                                      ageCategories[ageCategory]
                                    ))
                              )
                              .map(([ageCategory, results], index, array) => {
                                if (!Array.isArray(results)) return null;
                                const filteredResults = filterResults(results);
                                if (filteredResults.length === 0) return null;

                                return (
                                  <Box key={ageCategory}>
                                    {hasMultipleAgeCategories && (
                                      <>
                                        <Title order={5} mb="md">
                                          {t(
                                            `competitions.ageCategories.${ageCategory}`
                                          )}
                                        </Title>
                                        <Divider mb="md" />
                                      </>
                                    )}
                                    <Box sx={{ overflowX: "auto" }}>
                                      <Table striped highlightOnHover>
                                        <thead>
                                          <tr>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.place.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.place")}
                                            </th>
                                            <th
                                              style={{
                                                width: TABLE_COLUMNS.name.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("athletes.name")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.bodyweight
                                                    .width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.bodyweight")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.squat.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.squat")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.bench.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.bench")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.deadlift.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.deadlift")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.total.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.total")}
                                            </th>
                                            <th
                                              style={{
                                                width:
                                                  TABLE_COLUMNS.wilks.width,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t("results.wilks")}
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredResults.map(
                                            (result, index) => {
                                              const athleteName =
                                                typeof result.athleteId ===
                                                "object"
                                                  ? `${result.athleteId.firstName} ${result.athleteId.lastName}`
                                                  : result.athleteId;

                                              return (
                                                <tr key={result._id}>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.place
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.place || index + 1}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.name
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {athleteName}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.bodyweight
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.weighIn
                                                      ?.bodyweight || "-"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.squat
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.best?.squat || "-"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.bench
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.best?.bench || "-"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.deadlift
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.best?.deadlift ||
                                                      "-"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.total
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.total || "-"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      width:
                                                        TABLE_COLUMNS.wilks
                                                          .width,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {result.wilks?.toFixed(2) ||
                                                      "-"}
                                                  </td>
                                                </tr>
                                              );
                                            }
                                          )}
                                        </tbody>
                                      </Table>
                                    </Box>
                                    {index < array.length - 1 && (
                                      <Divider my="xl" />
                                    )}
                                  </Box>
                                );
                              })}
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}

              {(!groupedResults ||
                Object.keys(groupedResults).length === 0) && (
                <Text align="center" color="dimmed" py="xl">
                  {t("common.emptyState.noResults")}
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Page>
  );
}
