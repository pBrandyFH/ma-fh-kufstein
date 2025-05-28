import { useDataFetching } from "@/hooks/useDataFetching";
import {
  getFederationsByTypeFilter,
  updateFederationHierarchy,
} from "@/services/federationService";
import { Federation, FederationType } from "@/types";
import {
  Button,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddExistingFederationModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  parent: Federation | null;
  childrenIds: string[];
}

export default function AddExistingFederationModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  parent,
  childrenIds,
}: AddExistingFederationModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const skip = !parent;

  const getTypeFilters = (
    hostFederationType: FederationType
  ): FederationType[] => {
    if (hostFederationType === "REGIONAL") {
      return ["NATIONAL", "STATE", "LOCAL"];
    } else if (hostFederationType === "NATIONAL") {
      return ["STATE", "LOCAL"];
    } else if (hostFederationType === "STATE") {
      return ["LOCAL"];
    } else {
      return [];
    }
  };

  const {
    data: federationsToAssign,
    loading: federationsLoading,
    error: federationsError,
    refetch: refetchFederations,
  } = useDataFetching<Federation[]>({
    fetchFunction: () =>
      getFederationsByTypeFilter(getTypeFilters(parent?.type ?? "LOCAL")),
    skip: skip,
  });

  const form = useForm({
    initialValues: {
      childrenIds: childrenIds,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const isValid = form.isValid();
    if (isValid) {
      try {
        if (!parent) {
          console.error("Parent missing");
          return;
        }

        const { childrenIds } = values;
        const response = await updateFederationHierarchy(
          parent?._id,
          childrenIds
        );

        if (response.success) {
          form.reset();
          onSuccess();
        } else {
          console.error(`Error updating federation hierarchy:`, response.error);
        }
      } catch (error) {
        console.error(`Error updating federation hierarchy:`, error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      styles={{ content: { height: "50vh" } }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {federationsToAssign && (
            <MultiSelect
              label={t("federations.parent")}
              placeholder={t("federations.selectParent")}
              data={federationsToAssign?.map((f) => ({
                label: f.name,
                value: f._id,
              }))}
              searchable
              clearable
              {...form.getInputProps("childrenIds")}
              value={form.values.childrenIds}
              onChange={(value) => form.setFieldValue("childrenIds", value)}
            />
          )}
          <Group position="right" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={loading}>
              {t("common.save")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
