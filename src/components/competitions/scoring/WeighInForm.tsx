import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Title,
  Stack,
  Group,
  TextInput,
  NumberInput,
  Button,
  Table,
  Text,
  Badge,
  ActionIcon,
  LoadingOverlay,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconEdit, IconCheck } from "@tabler/icons-react";
import { Nomination, Athlete, Gender, WeightCategory, Result } from "@/types";
import { resultService } from "@/services/resultService";
import { useDataFetching } from "@/hooks/useDataFetching";

interface WeighInFormProps {
  nominations: Nomination[];
  competitionId: string;
  results: Result[];
  onSubmit: (data: {
    athleteId: string;
    bodyweight: number;
    lotNumber: number;
    startWeights: {
      squat: number;
      bench: number;
      deadlift: number;
    };
    ageCategory: string;
    weightCategory: string;
  }) => void;
}

interface WeighInEntry {
  athleteId: string;
  athleteName: string;
  gender: Gender;
  weightCategory: WeightCategory;
  ageCategory: string;
  bodyweight: number | "";
  lotNumber: number | "";
  startWeights: {
    squat: number | "";
    bench: number | "";
    deadlift: number | "";
  };
  isEditing: boolean;
  result?: Result;
}

const getWeightCategoryValue = (category: string): number => {
  const weight = parseInt(category.replace(/[^0-9]/g, ''));
  return category.startsWith('o') ? weight + 0.5 : weight;
};

export function WeighInForm({ nominations, competitionId, results, onSubmit }: WeighInFormProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<WeighInEntry[]>([]);

  // Create initial entries from nominations using useMemo
  const initialEntries = useMemo(() => {
    console.log('WeighInForm nominations:', nominations);
    console.log('WeighInForm results:', results);
    
    const entries = nominations
      .sort((a, b) => getWeightCategoryValue(a.weightCategory) - getWeightCategoryValue(b.weightCategory))
      .map((nom) => {
        const athlete = nom.athleteId as Athlete;
        console.log('Processing nomination:', {
          nomination: nom,
          athlete,
          athleteId: athlete._id
        });
        return {
          athleteId: athlete._id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          gender: athlete.gender,
          weightCategory: nom.weightCategory,
          ageCategory: nom.ageCategory,
          bodyweight: "" as number | "",
          lotNumber: "" as number | "",
          startWeights: {
            squat: "" as number | "",
            bench: "" as number | "",
            deadlift: "" as number | "",
          },
          isEditing: false,
        };
      });
    
    console.log('Created entries:', entries);
    return entries;
  }, [nominations]);

  // Update entries when results change
  useEffect(() => {
    if (results) {
      const resultsMap = new Map(results.map(result => [
        typeof result.athleteId === 'string' ? result.athleteId : result.athleteId._id,
        result
      ]));
      
      const updatedEntries: WeighInEntry[] = initialEntries.map(entry => {
        const result = resultsMap.get(entry.athleteId);
        if (result) {
          return {
            ...entry,
            bodyweight: result.weighIn?.bodyweight || "" as number | "",
            lotNumber: result.weighIn?.lotNumber || "" as number | "",
            startWeights: {
              squat: result.attempts?.squat[0]?.weight || "" as number | "",
              bench: result.attempts?.bench[0]?.weight || "" as number | "",
              deadlift: result.attempts?.deadlift[0]?.weight || "" as number | "",
            },
            result,
          };
        }
        return entry;
      });

      setEntries(updatedEntries);
    } else {
      setEntries(initialEntries);
    }
  }, [results, initialEntries]);

  const handleEdit = (index: number) => {
    setEntries(
      entries.map((entry, i) => ({
        ...entry,
        isEditing: i === index,
      }))
    );
  };

  const handleSave = (index: number) => {
    const entry = entries[index];
    if (
      entry.bodyweight !== "" &&
      entry.lotNumber !== "" &&
      entry.startWeights.squat !== "" &&
      entry.startWeights.bench !== "" &&
      entry.startWeights.deadlift !== ""
    ) {
      onSubmit({
        athleteId: entry.athleteId,
        bodyweight: Number(entry.bodyweight),
        lotNumber: Number(entry.lotNumber),
        startWeights: {
          squat: Number(entry.startWeights.squat),
          bench: Number(entry.startWeights.bench),
          deadlift: Number(entry.startWeights.deadlift),
        },
        ageCategory: entry.ageCategory,
        weightCategory: entry.weightCategory,
      });
      setEntries(
        entries.map((e, i) => ({
          ...e,
          isEditing: false,
        }))
      );
    }
  };

  const handleChange = (
    index: number,
    field: "bodyweight" | "lotNumber" | "squat" | "bench" | "deadlift",
    value: number | ""
  ) => {
    setEntries(
      entries.map((entry, i) => {
        if (i === index) {
          if (field === "bodyweight" || field === "lotNumber") {
            return { ...entry, [field]: value };
          } else {
            return {
              ...entry,
              startWeights: {
                ...entry.startWeights,
                [field]: value,
              },
            };
          }
        }
        return entry;
      })
    );
  };

  return (
    <Stack spacing="md" pos="relative">
      <LoadingOverlay visible={false} />
      <Title order={3}>{t("competition.weighIn")}</Title>
      <Text size="sm" color="dimmed">
        {t("competition.weighInDescription")}
      </Text>

      <Table>
        <thead>
          <tr>
            <th style={{ width: '120px' }}>{t("athletes.weightCategory")}</th>
            <th style={{ width: '200px' }}>{t("athletes.name")}</th>
            <th style={{ width: '100px' }}>{t("athletes.bodyweight")}</th>
            <th style={{ width: '100px' }}>{t("competition.lotNumber")}</th>
            <th style={{ width: '100px' }}>{t("results.squat")}</th>
            <th style={{ width: '100px' }}>{t("results.bench")}</th>
            <th style={{ width: '100px' }}>{t("results.deadlift")}</th>
            <th style={{ width: '80px' }}>{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.athleteId} style={{ height: '48px' }}>
              <td style={{ height: '48px' }}>{t(`athletes.weightCategories.${entry.gender}.${entry.weightCategory}`)}</td>
              <td style={{ height: '48px' }}>{entry.athleteName}</td>
              <td style={{ height: '48px' }}>
                {entry.isEditing ? (
                  <NumberInput
                    value={entry.bodyweight}
                    onChange={(value) => handleChange(index, "bodyweight", value)}
                    min={0}
                    max={300}
                    precision={2}
                    step={0.5}
                    size="xs"
                    styles={{
                      input: { height: '32px', minHeight: '32px' }
                    }}
                  />
                ) : (
                  <div style={{ height: '32px', lineHeight: '32px' }}>{entry.bodyweight || "-"}</div>
                )}
              </td>
              <td style={{ height: '48px' }}>
                {entry.isEditing ? (
                  <NumberInput
                    value={entry.lotNumber}
                    onChange={(value) => handleChange(index, "lotNumber", value)}
                    min={1}
                    max={entries.length}
                    size="xs"
                    styles={{
                      input: { height: '32px', minHeight: '32px' }
                    }}
                  />
                ) : (
                  <div style={{ height: '32px', lineHeight: '32px' }}>{entry.lotNumber || "-"}</div>
                )}
              </td>
              <td style={{ height: '48px' }}>
                {entry.isEditing ? (
                  <NumberInput
                    value={entry.startWeights.squat}
                    onChange={(value) => handleChange(index, "squat", value)}
                    min={0}
                    max={1000}
                    step={2.5}
                    size="xs"
                    styles={{
                      input: { height: '32px', minHeight: '32px' }
                    }}
                  />
                ) : (
                  <div style={{ height: '32px', lineHeight: '32px' }}>{entry.startWeights.squat || "-"}</div>
                )}
              </td>
              <td style={{ height: '48px' }}>
                {entry.isEditing ? (
                  <NumberInput
                    value={entry.startWeights.bench}
                    onChange={(value) => handleChange(index, "bench", value)}
                    min={0}
                    max={1000}
                    step={2.5}
                    size="xs"
                    styles={{
                      input: { height: '32px', minHeight: '32px' }
                    }}
                  />
                ) : (
                  <div style={{ height: '32px', lineHeight: '32px' }}>{entry.startWeights.bench || "-"}</div>
                )}
              </td>
              <td style={{ height: '48px' }}>
                {entry.isEditing ? (
                  <NumberInput
                    value={entry.startWeights.deadlift}
                    onChange={(value) => handleChange(index, "deadlift", value)}
                    min={0}
                    max={1000}
                    step={2.5}
                    size="xs"
                    styles={{
                      input: { height: '32px', minHeight: '32px' }
                    }}
                  />
                ) : (
                  <div style={{ height: '32px', lineHeight: '32px' }}>{entry.startWeights.deadlift || "-"}</div>
                )}
              </td>
              <td style={{ height: '48px' }}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                  {entry.isEditing ? (
                    <ActionIcon
                      color="green"
                      onClick={() => handleSave(index)}
                      disabled={
                        entry.bodyweight === "" ||
                        entry.lotNumber === "" ||
                        entry.startWeights.squat === "" ||
                        entry.startWeights.bench === "" ||
                        entry.startWeights.deadlift === ""
                      }
                      size="sm"
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                  ) : (
                    <ActionIcon onClick={() => handleEdit(index)} size="sm">
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Group position="right">
        <Badge size="lg">
          {t("competition.athletesCount", {
            count: entries.filter(
              (e) =>
                e.bodyweight !== "" &&
                e.lotNumber !== "" &&
                e.startWeights.squat !== "" &&
                e.startWeights.bench !== "" &&
                e.startWeights.deadlift !== ""
            ).length,
          })}
        </Badge>
      </Group>
    </Stack>
  );
} 