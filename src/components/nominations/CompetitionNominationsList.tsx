import { getNominationsByCompetitionId } from "@/services/nominationService";
import {
  Nomination,
  Gender,
  AgeCategory,
  WeightCategory,
  Competition,
} from "@/types";
import {
  Box,
  Text,
  Tabs,
  Select,
  Stack,
  Paper,
  Title,
  Group,
  Badge,
  Button,
  Loader,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { IconPlus } from "@tabler/icons-react";
import NominationDrawer from "./NominationDrawer";
import { useDataFetching } from "@/hooks/useDataFetching";

interface CompetitionNominationsListProps {
  competition: Competition | null;
}

// Weight category order mapping for sorting
const weightCategoryOrder: Record<WeightCategory, number> = {
  // Female categories
  u43: 1,
  u47: 2,
  u52: 3,
  u57: 4,
  u63: 5,
  u69: 6,
  u76: 7,
  u84: 8,
  o84: 9,
  // Male categories
  u53: 10,
  u59: 11,
  u66: 12,
  u74: 13,
  u83: 14,
  u93: 15,
  u105: 16,
  u120: 17,
  o120: 18,
};

export default function CompetitionNominationsList({
  competition,
}: CompetitionNominationsListProps) {
  const { t } = useTranslation();
  const [nominationDrawerOpened, setNominationDrawerOpened] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>("male");
  const [selectedAgeCategory, setSelectedAgeCategory] =
    useState<AgeCategory | null>(null);

  const {
    data: nominations,
    loading: nominationsLoading,
    refetch: refetchNominations,
  } = useDataFetching<Nomination[]>({
    fetchFunction: () => getNominationsByCompetitionId(competition?._id ?? ""),
    dependencies: [competition?._id],
    skip: !competition?._id,
  });

  // Get unique age categories from nominations
  const ageCategories = useMemo(() => {
    if (!nominations) return [];
    const categories = new Set<AgeCategory>();
    nominations.forEach((nomination) => {
      categories.add(nomination.ageCategory);
    });
    return Array.from(categories).sort();
  }, [nominations]);

  // Filter and sort nominations
  const filteredNominations = useMemo(() => {
    if (!nominations) return [];

    return nominations
      .filter((nomination) => {
        const athleteGender =
          typeof nomination.athleteId === "string"
            ? null
            : nomination.athleteId.gender;

        const matchesGender = athleteGender === selectedGender;
        const matchesAgeCategory =
          !selectedAgeCategory ||
          nomination.ageCategory === selectedAgeCategory;

        return matchesGender && matchesAgeCategory;
      })
      .sort((a, b) => {
        return (
          weightCategoryOrder[a.weightCategory] -
          weightCategoryOrder[b.weightCategory]
        );
      });
  }, [nominations, selectedGender, selectedAgeCategory]);

  // Group nominations by weight category
  const groupedNominations = useMemo(() => {
    const groups: Record<WeightCategory, Nomination[]> = {} as Record<
      WeightCategory,
      Nomination[]
    >;

    filteredNominations.forEach((nomination) => {
      if (!groups[nomination.weightCategory]) {
        groups[nomination.weightCategory] = [];
      }
      groups[nomination.weightCategory].push(nomination);
    });

    return groups;
  }, [filteredNominations]);

  if (nominationsLoading) {
    return (
      <Center h={200}>
        <Stack align="center" spacing="md">
          <Loader size="lg" />
          <Text>{t("common.loading")}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack spacing="md">
      <Group position="apart" mb="md">
        <Title order={3}>{t("competitions.nominationsList")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => setNominationDrawerOpened(true)}
          disabled={competition?.status !== "upcoming"}
        >
          {t("nominations.create")}
        </Button>
      </Group>
      <Group position="apart">
        <Tabs
          value={selectedGender}
          onTabChange={(value) => setSelectedGender(value as Gender)}
        >
          <Tabs.List>
            <Tabs.Tab value="male">{t("athletes.male")}</Tabs.Tab>
            <Tabs.Tab value="female">{t("athletes.female")}</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Select
          placeholder={t("nominations.selectAgeCategory")}
          value={selectedAgeCategory}
          onChange={(value) =>
            setSelectedAgeCategory(value as AgeCategory | null)
          }
          data={[
            { value: "", label: t("nominations.allAgeCategories") },
            ...ageCategories.map((category) => ({
              value: category,
              label: t(`competitions.ageCategories.${category}`),
            })),
          ]}
          style={{ width: 200 }}
        />
      </Group>

      {Object.entries(groupedNominations).map(
        ([weightCategory, nominations]) => (
          <Paper key={weightCategory} p="md" withBorder>
            <Title order={3} mb="sm">
              {t(
                `athletes.weightCategories.${selectedGender}.${weightCategory}`
              )}
              <Badge ml="sm" size="sm">
                {nominations.length}
              </Badge>
            </Title>
            <Stack spacing="xs">
              {nominations.map((nomination) => (
                <Group key={nomination._id} position="apart">
                  <Text>
                    {typeof nomination.athleteId === "string"
                      ? nomination.athleteId
                      : `${nomination.athleteId.firstName} ${nomination.athleteId.lastName}`}
                  </Text>
                  <Badge>
                    {t(`competitions.ageCategories.${nomination.ageCategory}`)}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        )
      )}

      {filteredNominations.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          {t("nominations.noNominationsFound")}
        </Text>
      )}
      <NominationDrawer
        opened={nominationDrawerOpened}
        onClose={() => setNominationDrawerOpened(false)}
        competition={competition}
        onNominationsChange={refetchNominations}
      />
    </Stack>
  );
}
