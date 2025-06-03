import AthleteFormModal from "@/components/athletes/AthleteFormModal";
import AthleteList from "@/components/athletes/AthleteList";
import { Page } from "@/components/common/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import {
  getAthletesByFederation,
  getAthletesByMember,
} from "@/services/athleteService";
import { Athlete } from "@/types";
import { Box, Button, Flex } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FederationAthletesPage() {
  const { t } = useTranslation();
  const { federation, isMemberAdmin, member } = useAuth();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const {
    data: athletes,
    loading: athletesLoading,
    error: athletesError,
    refetch: refetchAthletes,
  } = useDataFetching<Athlete[]>({
    fetchFunction: () =>
      isMemberAdmin
        ? getAthletesByMember(member?._id ?? "")
        : getAthletesByFederation(federation?._id ?? ""),
    skip: !federation?._id || !member?._id,
  });

  const handleCreateSuccess = () => {
    setCreateModalOpened(false);
    refetchAthletes();
  };

  if (!federation) {
    return <div>no fed</div>;
  }

  return (
    <Page title={t("athletes.title")}>
      <Flex direction="column" gap="sm">
        <Box>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
          >
            {t("athletes.create")}
          </Button>
        </Box>
        <AthleteList athletes={athletes ?? []} />
      </Flex>

      <AthleteFormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        modalTitle={t("athletes.create")}
        existingMember={isMemberAdmin ? member : null}
        federation={federation}
      />
    </Page>
  );
}
