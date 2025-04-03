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
} from "../../services/federationService";
import { Federation, FederationType } from "../../types";

interface FederationFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  federations: Federation[];
  modalTitle: string;
  allowedTypes?: FederationType[]; // Allow specifying which federation types to show
  defaultType?: FederationType; // Default selected type
  defaultParentId?: string; // Default selected parent federation ID
  federationToEdit?: Federation; // Federation to edit (if editing mode)
  isEditMode?: boolean; // Whether we're editing or creating
}

export function FederationFormModal({
  opened,
  onClose,
  onSuccess,
  federations,
  modalTitle,
  defaultType,
  allowedTypes = ["continental", "national", "federalState"],
  defaultParentId = "",
  federationToEdit,
  isEditMode = false,
}: FederationFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasInternational, setHasInternational] = useState(false);

  console.log(federationToEdit?.parent);

  // Check if international federation already exists
  useEffect(() => {
    const internationalExists = federations.some(
      (fed) =>
        fed.type === "international" &&
        (!federationToEdit || fed._id !== federationToEdit._id)
    );
    setHasInternational(internationalExists);
  }, [federations, federationToEdit]);

  const form = useForm({
    initialValues: {
      name: federationToEdit?.name || "",
      abbreviation: federationToEdit?.abbreviation || "",
      type: federationToEdit?.type || defaultType || "continental",
      parentId: federationToEdit?.parent?._id || defaultParentId,
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
        values.type !== "international" && !value
          ? t("validation.required")
          : null,
      contactEmail: (value) =>
        value && !/^\S+@\S+$/.test(value) ? t("validation.email") : null,
    },
  });

  // Filter allowed types based on hierarchy
  const getAvailableTypes = () => {
    // If editing, always include the current type
    let availableTypes = [...allowedTypes];
    if (isEditMode && federationToEdit) {
      if (!availableTypes.includes(federationToEdit.type)) {
        availableTypes.push(federationToEdit.type);
      }

      // When editing, we can't change the type if there are children
      if (federationToEdit.children && federationToEdit.children.length > 0) {
        return [federationToEdit.type];
      }
    }

    // Remove international if one already exists (unless we're editing the international federation)
    if (hasInternational && availableTypes.includes("international")) {
      availableTypes.splice(availableTypes.indexOf("international"), 1);
    }

    // In regular creation mode, check parent hierarchy
    if (!isEditMode) {
      // Check if we have parents for each type
      const hasContinental = federations.some(
        (fed) => fed.type === "continental"
      );
      const hasNational = federations.some((fed) => fed.type === "national");

      // Remove types that don't have parent federations
      if (!hasInternational && availableTypes.includes("continental")) {
        availableTypes.splice(availableTypes.indexOf("continental"), 1);
      }

      if (!hasContinental && availableTypes.includes("national")) {
        availableTypes.splice(availableTypes.indexOf("national"), 1);
      }

      if (!hasNational && availableTypes.includes("federalState")) {
        availableTypes.splice(availableTypes.indexOf("federalState"), 1);
      }
    }

    return availableTypes;
  };

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

  // Get potential parent federations based on the selected federation type
  const getParentOptions = () => {
    const selectedType = form.values.type;

    if (selectedType === "continental") {
      return federations
        .filter((fed) => fed.type === "international")
        .map((fed) => ({ value: fed._id, label: fed.name }));
    } else if (selectedType === "national") {
      return federations
        .filter((fed) => fed.type === "continental")
        .map((fed) => ({ value: fed._id, label: fed.name }));
    } else if (selectedType === "federalState") {
      return federations
        .filter((fed) => fed.type === "national")
        .map((fed) => ({ value: fed._id, label: fed.name }));
    }

    return [];
  };

  // Create type options from available types
  const availableTypes = getAvailableTypes();
  const typeOptions = availableTypes.map((type) => ({
    value: type,
    label: t(`federations.types.${type}`),
  }));

  // Get parent options based on current type
  const parentOptions = getParentOptions();

  // Check if form should be disabled
  const isFormDisabled = typeOptions.length === 0;

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="lg">
      {isFormDisabled ? (
        <Stack spacing="md">
          <Text color="red">{t("federations.noAvailableTypes")}</Text>
          <Text>{t("federations.createHierarchyFirst")}</Text>
          <Button onClick={onClose}>{t("common.close")}</Button>
        </Stack>
      ) : (
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
            <Select
              label={t("federations.type")}
              placeholder={t("federations.typePlaceholder")}
              data={typeOptions}
              required
              disabled={
                isEditMode &&
                federationToEdit?.children &&
                federationToEdit.children.length > 0
              }
              {...form.getInputProps("type")}
              onChange={(value) => {
                form.setFieldValue("type", value as FederationType);
                // Reset parent when type changes unless it's a valid parent for the new type
                const validParents = getParentOptions().map((p) => p.value);
                if (!validParents.includes(form.values.parentId)) {
                  form.setFieldValue("parentId", "");
                }
              }}
            />
            {form.values.type !== "international" && (
              <Select
                label={t("federations.parent")}
                placeholder={t("federations.parentPlaceholder")}
                data={parentOptions}
                required
                {...form.getInputProps("parentId")}
              />
            )}
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
      )}
    </Modal>
  );
}
