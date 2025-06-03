import { useDataFetching } from "@/hooks/useDataFetching";
import { Competition, Federation } from "@/types";
import { getNationalCompetitions } from "@/services/competitionService";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Loader,
  SimpleGrid,
  ActionIcon,
  Menu,
  Badge,
  Select,
  Stack,
  Divider,
  Box,
  Flex,
} from "@mantine/core";
import { IconCalendar, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { getFedTypeColor } from "../federations/utils";
import { useState } from "react";
import CompetitionDetailsDrawer from "./details-drawer/CompetitionDetailsDrawer";
import CompetitionCard from "./CompetitionCard";

interface NationalCompetitionsProps {
  federation: Federation | null;
}

export default function NationalCompetitions({
  federation,
}: NationalCompetitionsProps) {
  const [compToView, setCompToView] = useState<Competition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useDataFetching<Competition[]>({
    fetchFunction: () => getNationalCompetitions(federation?._id ?? ""),
  });

  return (
    <Flex direction="column" gap="sm">
      <Box>
        {competitions?.map((competition) => {
          const hostFederation = competition.hostFederation;

          const handleClick = () => {
            setCompToView(competition);
            setDrawerOpen(true);
          };
          return (
            <CompetitionCard
              key={competition._id}
              competition={competition}
              hostFederation={hostFederation}
              onClick={handleClick}
            />
          );
        })}
      </Box>
      <CompetitionDetailsDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        competition={compToView}
      />
    </Flex>
  );
}
