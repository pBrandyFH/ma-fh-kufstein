import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Title,
  Stack,
  Group,
  Text,
  Table,
  NumberInput,
  Select,
  Badge,
  ActionIcon,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconCheck, IconEdit, IconX } from "@tabler/icons-react";
import { Nomination, Athlete, Result, JudgeDecision, AttemptStatus } from "@/types";

interface ScoringFormProps {
  nominations: Nomination[];
  competitionId: string;
  results: Result[];
  liftType: "squat" | "bench" | "deadlift";
  onSubmit: (data: {
    athleteId: string;
    attemptNumber: number;
    weight: number;
    status: AttemptStatus;
  }) => void;
}

interface AthleteEntry {
  athleteId: string;
  firstName: string;
  lastName: string;
  weightCategory: string;
  lotNumber: number;
  attempts: {
    squat: Array<{
      weight: number | "";
      status: AttemptStatus | "";
    }>;
    bench: Array<{
      weight: number | "";
      status: AttemptStatus | "";
    }>;
    deadlift: Array<{
      weight: number | "";
      status: AttemptStatus | "";
    }>;
  };
  isEditing: boolean;
}

const getWeightCategoryValue = (category: string): number => {
  const weight = parseInt(category.replace(/[^0-9]/g, ''));
  return category.startsWith('o') ? weight + 0.5 : weight;
};

export function ScoringForm({ nominations, competitionId, results, liftType, onSubmit }: ScoringFormProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AthleteEntry[]>([]);

  // Helper function to sort entries
  const sortEntries = (entriesToSort: AthleteEntry[]) => {
    return entriesToSort.sort((a, b) => {
      // Count attempts for each athlete
      const countAttempts = (entry: AthleteEntry) => {
        return entry.attempts[liftType].filter(attempt => 
          attempt.weight !== "" && attempt.status !== ""
        ).length;
      };

      const aAttempts = countAttempts(a);
      const bAttempts = countAttempts(b);

      // First sort by number of attempts (ascending)
      if (aAttempts !== bAttempts) {
        return aAttempts - bAttempts;
      }

      // If attempts are equal, sort by latest attempt weight
      const getCurrentAttemptWeight = (entry: AthleteEntry) => {
        const attempts = entry.attempts[liftType];
        // Find the last attempt with a weight by iterating backwards
        for (let i = attempts.length - 1; i >= 0; i--) {
          if (attempts[i].weight !== "") {
            return attempts[i].weight;
          }
        }
        return 0;
      };

      const aWeight = getCurrentAttemptWeight(a);
      const bWeight = getCurrentAttemptWeight(b);
      return Number(aWeight) - Number(bWeight);
    });
  };

  // Create initial entries from nominations using useMemo
  const initialEntries = useMemo(() => {
    const entries = nominations.map((nom) => {
      const athlete = nom.athleteId as Athlete;
      const emptyAttempt = {
        weight: "" as number | "",
        status: "" as AttemptStatus | "",
      };
      return {
        athleteId: athlete._id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        weightCategory: nom.weightCategory,
        lotNumber: 0,
        attempts: {
          squat: Array(3).fill(null).map(() => ({ ...emptyAttempt })),
          bench: Array(3).fill(null).map(() => ({ ...emptyAttempt })),
          deadlift: Array(3).fill(null).map(() => ({ ...emptyAttempt })),
        },
        isEditing: false,
      };
    });

    return sortEntries(entries);
  }, [nominations, liftType]);

  // Update entries when results change
  useEffect(() => {
    if (results) {
      const resultsMap = new Map(results.map(result => [
        typeof result.athleteId === 'string' ? result.athleteId : result.athleteId._id,
        result
      ]));
      
      const updatedEntries: AthleteEntry[] = initialEntries.map(entry => {
        const result = resultsMap.get(entry.athleteId);
        if (result) {
          const mapAttempts = (attempts: Result["attempts"][keyof Result["attempts"]] = []) => 
            attempts.map(attempt => ({
              weight: attempt.weight || "" as number | "",
              status: attempt.status || "" as AttemptStatus | "",
            })) || Array(3).fill(null).map(() => ({
              weight: "" as number | "",
              status: "" as AttemptStatus | "",
            }));

          return {
            ...entry,
            lotNumber: result.weighIn?.lotNumber || 0,
            attempts: {
              squat: mapAttempts(result.attempts?.squat),
              bench: mapAttempts(result.attempts?.bench),
              deadlift: mapAttempts(result.attempts?.deadlift),
            },
          };
        }
        return entry;
      });

      setEntries(sortEntries(updatedEntries));
    } else {
      setEntries(initialEntries);
    }
  }, [results, initialEntries, liftType]);

  const handleEdit = (index: number) => {
    setEntries(entries.map((entry, i) => ({
      ...entry,
      isEditing: i === index,
    })));
  };

  const handleAttemptChange = (
    index: number,
    attemptNumber: number,
    field: "weight" | "status",
    value: number | AttemptStatus | ""
  ) => {
    const updatedEntries = entries.map((entry, i) => {
      if (i === index) {
        const updatedAttempts = { ...entry.attempts };
        updatedAttempts[liftType] = [...entry.attempts[liftType]];
        updatedAttempts[liftType][attemptNumber] = {
          ...entry.attempts[liftType][attemptNumber],
          [field]: value,
        };
        return {
          ...entry,
          attempts: updatedAttempts,
        };
      }
      return entry;
    });

    setEntries(updatedEntries);
  };

  const handleCancel = (index: number) => {
    // Reset the entry's editing state and restore original values
    const updatedEntries = entries.map((entry, i) => {
      if (i === index) {
        // Find the original result for this athlete
        const originalResult = results.find(r => 
          (typeof r.athleteId === 'string' ? r.athleteId : r.athleteId._id) === entry.athleteId
        );
        
        if (originalResult) {
          // Restore the original attempts
          const mapAttempts = (attempts: Result["attempts"][keyof Result["attempts"]] = []) => 
            attempts.map(attempt => ({
              weight: attempt.weight || "" as number | "",
              status: attempt.status || "" as AttemptStatus | "",
            })) || Array(3).fill(null).map(() => ({
              weight: "" as number | "",
              status: "" as AttemptStatus | "",
            }));

          return {
            ...entry,
            isEditing: false,
            attempts: {
              squat: mapAttempts(originalResult.attempts?.squat),
              bench: mapAttempts(originalResult.attempts?.bench),
              deadlift: mapAttempts(originalResult.attempts?.deadlift),
            },
          };
        }
      }
      return entry;
    });

    setEntries(updatedEntries);
  };

  const handleSave = (index: number, attemptNumber: number) => {
    const entry = entries[index];
    const attempt = entry.attempts[liftType][attemptNumber];
    
    if (attempt.weight === "") {
      return;
    }

    // If no status is selected, send as pending
    const status = attempt.status || "pending";

    onSubmit({
      athleteId: entry.athleteId,
      attemptNumber: attemptNumber + 1,
      weight: Number(attempt.weight),
      status,
    });

    // Update entries and resort only after saving
    const updatedEntries = entries.map((entry, i) => ({
      ...entry,
      isEditing: false,
    }));
    setEntries(sortEntries(updatedEntries));
  };

  return (
    <Stack spacing="md" pos="relative">
      <LoadingOverlay visible={false} />
      <Title order={3}>{t(`competition.${liftType}`)}</Title>
      <Text size="sm" color="dimmed">
        {t("competition.scoringDescription")}
      </Text>

      <Table>
        <thead>
          <tr>
            <th style={{ width: '80px' }}>{t("competition.lotNumber")}</th>
            <th style={{ width: '200px' }}>{t("competition.athlete")}</th>
            <th style={{ width: '120px' }}>{t("competition.weightCategory")}</th>
            <th style={{ width: '80px' }}>{t("competition.attempt")}</th>
            <th style={{ width: '120px' }}>{t("competition.weight")}</th>
            <th style={{ width: '200px' }}>{t("competition.status")}</th>
            <th style={{ width: '100px' }}>{t("competition.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <>
              {[0, 1, 2].map((attemptNumber) => {
                const attempt = entry.attempts[liftType][attemptNumber];
                const isLastAttempt = attemptNumber === 2;

                return (
                  <tr 
                    key={`${entry.athleteId}-${attemptNumber}`} 
                    style={{ 
                      height: '48px',
                      borderBottom: isLastAttempt ? '2px solid #adb5bd' : undefined 
                    }}
                  >
                    {attemptNumber === 0 && (
                      <>
                        <td rowSpan={3} style={{ height: '144px' }}>{entry.lotNumber}</td>
                        <td rowSpan={3} style={{ height: '144px' }}>{entry.firstName} {entry.lastName}</td>
                        <td rowSpan={3} style={{ height: '144px' }}>{entry.weightCategory}</td>
                      </>
                    )}
                    <td>{attemptNumber + 1}</td>
                    <td>
                      {entry.isEditing ? (
                        <NumberInput
                          value={attempt.weight}
                          onChange={(value) => handleAttemptChange(index, attemptNumber, "weight", value || "")}
                          min={0}
                          step={2.5}
                          size="xs"
                          styles={{
                            input: { height: '32px', minHeight: '32px' }
                          }}
                        />
                      ) : (
                        <div style={{ height: '32px', lineHeight: '32px' }}>{attempt.weight || "-"}</div>
                      )}
                    </td>
                    <td>
                      {entry.isEditing ? (
                        <Group spacing="xs" style={{ height: '32px' }}>
                          <Button
                            variant={attempt.status === "good" ? "filled" : "outline"}
                            color="green"
                            onClick={() => handleAttemptChange(index, attemptNumber, "status", "good")}
                            size="xs"
                            style={{ height: '28px', padding: '0 8px' }}
                          >
                            {t("competition.good")}
                          </Button>
                          <Button
                            variant={attempt.status === "noGood" ? "filled" : "outline"}
                            color="red"
                            onClick={() => handleAttemptChange(index, attemptNumber, "status", "noGood")}
                            size="xs"
                            style={{ height: '28px', padding: '0 8px' }}
                          >
                            {t("competition.noGood")}
                          </Button>
                          <Button
                            variant={attempt.status === "pending" ? "filled" : "outline"}
                            color="gray"
                            onClick={() => handleAttemptChange(index, attemptNumber, "status", "pending")}
                            size="xs"
                            style={{ height: '28px', padding: '0 8px' }}
                          >
                            {t("competition.pending")}
                          </Button>
                        </Group>
                      ) : (
                        <div style={{ height: '32px', lineHeight: '32px' }}>
                          <Badge 
                            color={
                              attempt.status === "good" ? "green" : 
                              attempt.status === "noGood" ? "red" : 
                              "gray"
                            }
                          >
                            {attempt.status || t("competition.pending")}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                        {entry.isEditing ? (
                          <Group spacing="xs">
                            <ActionIcon
                              color="green"
                              onClick={() => handleSave(index, attemptNumber)}
                              disabled={attempt.weight === ""}
                              size="sm"
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                              color="gray"
                              onClick={() => handleCancel(index)}
                              size="sm"
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Group>
                        ) : (
                          <ActionIcon onClick={() => handleEdit(index)} size="sm">
                            <IconEdit size={16} />
                          </ActionIcon>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </Table>
    </Stack>
  );
} 