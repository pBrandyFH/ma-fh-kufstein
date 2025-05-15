import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import {
  createFederation,
  updateFederation,
} from "../../../services/federationService";
import { Federation, FederationType } from "../../../types";

interface FederationFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  allowedTypes?: FederationType[]; // Allow specifying which federation types to show
  defaultType?: FederationType; // Default selected type
  parentId: string; // Default selected parent federation ID
  federationToEdit?: Federation; // Federation to edit (if editing mode)
  isEditMode?: boolean; // Whether we're editing or creating
}

export function FederationFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  defaultType,
  parentId,
  federationToEdit,
  isEditMode = false,
}: FederationFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: federationToEdit?.name || "",
      abbreviation: federationToEdit?.abbreviation || "",
      type: federationToEdit?.type || defaultType,
      parentId: federationToEdit?.parent?._id || parentId,
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
      parentId: (value, values) =>
        values.type !== "INTERNATIONAL" && !value
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
        if (!values.type) {
          console.error("Federation type is undefined");
          setLoading(false);
          return;
        }

        // Prepare federation data - remove parentId from the data we send to API
        const { parentId, ...restValues } = values;

        // Create federation data with proper parent format
        const federationData: any = {
          ...restValues,
          type: values.type,
        };

        // Only add parent if it's specified
        if (parentId) {
          federationData.parent = parentId;
        }

        let response;

        if (isEditMode && federationToEdit) {
          // Update existing federation
          response = await updateFederation(
            federationToEdit._id,
            federationData
          );
        } else {
          // Create new federation
          response = await createFederation(federationData);
        }

        if (response.success) {
          form.reset();
          onSuccess();
        } else {
          // Handle error
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
