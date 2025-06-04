import { Nomination } from "@/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useFlightsFromNominations(nominations: Nomination[]) {
  const { t } = useTranslation();
  const flights = useMemo(() => {
    if (!nominations) return [];

    const flightMap = new Map<number, Map<number, Nomination[]>>();

    nominations.forEach((nomination) => {
      if (!nomination.flightNumber || !nomination.groupNumber) return;

      if (!flightMap.has(nomination.flightNumber)) {
        flightMap.set(nomination.flightNumber, new Map());
      }

      const groupMap = flightMap.get(nomination.flightNumber)!;
      if (!groupMap.has(nomination.groupNumber)) {
        groupMap.set(nomination.groupNumber, []);
      }

      groupMap.get(nomination.groupNumber)!.push(nomination);
    });

    return Array.from(flightMap.entries())
      .map(([flightNumber, groups]) => ({
        number: flightNumber,
        groups: Array.from(groups.entries()).map(
          ([groupNumber, nominations]) => ({
            number: groupNumber,
            name:
              nominations[0]?.groupName ||
              `${t("competition.group")} ${groupNumber}`,
            startTime: nominations[0]?.groupStartTime,
            status: "pending" as const,
            nominations,
          })
        ),
      }))
      .sort((a, b) => a.number - b.number);
  }, [nominations, t]);

  return flights;
}
