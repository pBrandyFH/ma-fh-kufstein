import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  MultiSelect,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import {
  createFederation,
  getFederationsByTypeFilter,
  updateFederation,
} from "../../services/federationService";
import { Federation, FederationType } from "../../types";
import { getChildFederations } from "@/services/federationService"; // to load potential parents
import { useDataFetching } from "@/hooks/useDataFetching";

interface FederationFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  allowedTypes?: FederationType[];
  defaultType?: FederationType;
  parent: Federation | null;
  federationToEdit?: Federation;
  isEditMode?: boolean;
}

export function FederationFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  defaultType,
  parent,
  federationToEdit,
  isEditMode = false,
}: FederationFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);


  const initialParentIds =
    federationToEdit?.parents?.map((p) => p._id) ||
    (parent ? [parent._id] : []);

  const form = useForm({
    initialValues: {
      name: federationToEdit?.name || "",
      abbreviation: federationToEdit?.abbreviation || "",
      type: federationToEdit?.type || defaultType,
      parentIds: initialParentIds,
      contactName: federationToEdit?.contactName || "",
      contactEmail: federationToEdit?.contactEmail || "",
      contactPhone: federationToEdit?.contactPhone || "",
      website: federationToEdit?.website || "",
      city: federationToEdit?.city || "",
      country: federationToEdit?.country || "",
    },
    validate: {
      name: (value) => (value ? null : t("validation.required")),
      abbreviation: (value) => (value ? null : t("validation.required")),
      type: (value) => (value ? null : t("validation.required")),
      parentIds: (value, values) =>
        values.type !== "INTERNATIONAL" && (!value || value.length === 0)
          ? t("validation.required")
          : null,
      contactEmail: (value) =>
        value && !/^\S+@\S+$/.test(value) ? t("validation.email") : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const isValid = form.isValid();
    if (isValid) {
      try {
        const { parentIds, ...restValues } = values;
        const federationData: any = {
          ...restValues,
          type: values.type,
        };

        if (parentIds && parentIds.length > 0) {
          federationData.parents = parentIds;
        }

        let response;

        if (isEditMode && federationToEdit) {
          response = await updateFederation(
            federationToEdit._id,
            federationData
          );
        } else {
          response = await createFederation(federationData);
        }

        if (response.success) {
          form.reset();
          onSuccess();
        } else {
          console.error(
            `Failed to ${isEditMode ? "update" : "create"} federation:`,
            response.error
          );
        }
      } catch (error) {
        console.error(
          `Error ${isEditMode ? "updating" : "creating"} federation:`,
          error
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            label={t("federations.name")}
            placeholder={t("federations.namePlaceholder")}
            required
            {...form.getInputProps("name")}
          />
          <TextInput
            label={t("federations.abbreviation")}
            placeholder={t("federations.abbreviationPlaceholder")}
            required
            {...form.getInputProps("abbreviation")}
          />

          <TextInput
            label={t("federations.contactName")}
            placeholder={t("federations.contactNamePlaceholder")}
            {...form.getInputProps("contactName")}
          />
          <TextInput
            label={t("federations.contactEmail")}
            placeholder={t("federations.contactEmailPlaceholder")}
            {...form.getInputProps("contactEmail")}
          />
          <TextInput
            label={t("federations.contactPhone")}
            placeholder={t("federations.contactPhonePlaceholder")}
            {...form.getInputProps("contactPhone")}
          />
          <TextInput
            label={t("federations.website")}
            placeholder={t("federations.websitePlaceholder")}
            {...form.getInputProps("website")}
          />
          <TextInput
            label={t("federations.city")}
            placeholder={t("federations.city")}
            {...form.getInputProps("city")}
          />
          <TextInput
            label={t("federations.country")}
            placeholder={t("federations.country")}
            {...form.getInputProps("country")}
          />
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
