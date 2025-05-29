import { useDataFetching } from "@/hooks/useDataFetching";
import {
  createCompetition,
  updateCompetition,
} from "@/services/competitionService";
import {
  getFederationsByType,
  getFederationsByTypeFilter,
} from "@/services/federationService";
import {
  Competition,
  CompetitionFormValues,
  EquipmentType,
  Federation,
  FederationType,
  Member,
} from "@/types";
import {
  Button,
  MultiSelect,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Group } from "@mantine/core";
import { Modal } from "@mantine/core";
import { Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CompetitionFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  hostFederation: Federation;
  competitionToEdit?: Competition; // Federation to edit (if editing mode)
  isEditMode?: boolean; // Whether we're editing or creating
}

export default function CompetitionFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  competitionToEdit,
  hostFederation,
  isEditMode = false,
}: CompetitionFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const skipEligibleFeds = hostFederation.type === "INTERNATIONAL";

  const getTypeFilters = (
    hostFederationType: FederationType
  ): FederationType[] => {
    if (hostFederationType === "INTERNATIONAL") {
      return [];
    } else if (hostFederationType === "REGIONAL") {
      return ["REGIONAL"];
    } else if (hostFederationType === "NATIONAL") {
      return ["REGIONAL", "NATIONAL"];
    } else if (hostFederationType === "STATE") {
      return ["NATIONAL", "STATE", "LOCAL"];
    } else if (hostFederationType === "LOCAL") {
      return ["NATIONAL", "STATE", "LOCAL"];
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
      getFederationsByTypeFilter(getTypeFilters(hostFederation.type)),
    skip: skipEligibleFeds,
  });

  const form = useForm<CompetitionFormValues>({
    initialValues: {
      name: competitionToEdit?.name || "European Equipped Championships 2025",
      startDate: competitionToEdit?.startDate || null,
      endDate: competitionToEdit?.endDate || null,
      location: competitionToEdit?.location || "Vestergard Hall Stockholm",
      address: competitionToEdit?.address || "Test street 1",
      city: competitionToEdit?.city || "Stockholm",
      country: competitionToEdit?.country || "Sweden",
      hostFederation: competitionToEdit?.hostFederation || hostFederation._id,
      hostMember: competitionToEdit?.hostMember || null,
      eligibleFederations: competitionToEdit?.eligibleFederations || [],
      equipmentType: competitionToEdit?.equipmentType || null,
      ageCategories: competitionToEdit?.ageCategories || [],
      description: competitionToEdit?.description || "",
      nominationStart: competitionToEdit?.nominationDeadline || null,
      nominationDeadline: competitionToEdit?.nominationDeadline || null,
    },
    validate: {
      name: (value: string) => (value ? null : t("validation.required")),
      startDate: (value: Date | null, values) => {
        if (!value) return null;
        if (values.nominationDeadline && value < values.nominationDeadline) {
          return t("validation.endDateAfterStart");
        }
        return null;
      },
      endDate: (value: Date | null, values) => {
        if (!value) return null;
        if (values.startDate && value < values.startDate) {
          return t("validation.endDateAfterStart");
        }
        return null;
      },
      nominationStart: (value: Date | null) =>
        value ? null : t("validation.required"),
      nominationDeadline: (value: Date | null, values) => {
        if (!value) return null;
        if (values.nominationStart && value < values.nominationStart) {
          return t("validation.endDateAfterStart");
        }
        return null;
      },
      location: (value: string) => (value ? null : t("validation.required")),
      address: (value: string) => (value ? null : t("validation.required")),
      city: (value: string) => (value ? null : t("validation.required")),
      country: (value: string) => (value ? null : t("validation.required")),
      hostFederation: (value: string | Federation) =>
        value ? null : t("validation.required"),
      equipmentType: (value: EquipmentType | null) =>
        value ? null : t("validation.required"),
      ageCategories: (value: string[]) =>
        value.length > 0 ? null : t("validation.required"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const isValid = form.isValid();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      let response;
      const formDataValues: CompetitionFormValues = {
        ...values,
        equipmentType: values.equipmentType as EquipmentType,
        hostFederation:
          typeof values.hostFederation === "string"
            ? values.hostFederation
            : values.hostFederation._id,
        hostMember:
          typeof values.hostMember === "string"
            ? values.hostMember
            : values.hostMember !== null
            ? values.hostMember._id
            : null,
        eligibleFederations: values.eligibleFederations.map((fed) =>
          typeof fed === "string" ? fed : fed._id
        ),
      };
      if (isEditMode && competitionToEdit) {
        response = await updateCompetition(
          competitionToEdit?._id ?? "",
          formDataValues
        );
      } else {
        response = await createCompetition(values);
      }

      if (response.success) {
        form.reset();
        onSuccess();
      } else {
        // Handle error
        console.error(
          `Failed to ${isEditMode ? "update" : "create"} competition:`,
          response.error
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} competition:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            label={t("competitions.name")}
            placeholder={t("competitions.namePlaceholder")}
            required
            {...form.getInputProps("name")}
          />

          <Group grow>
            <DateInput
              label={t("competitions.nominationStart")}
              placeholder={t("competitions.nominationStartPlaceholder")}
              required
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps("nominationStart")}
              value={
                form.values.nominationStart
                  ? new Date(form.values.nominationStart)
                  : null
              }
              onChange={(date) => form.setFieldValue("nominationStart", date)}
            />
            <DateInput
              label={t("competitions.nominationDeadline")}
              placeholder={t("competitions.nominationDeadlinePlaceholder")}
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps("nominationEnd")}
              value={
                form.values.nominationDeadline
                  ? new Date(form.values.nominationDeadline)
                  : null
              }
              onChange={(date) =>
                form.setFieldValue("nominationDeadline", date)
              }
            />
          </Group>

          <Group grow>
            <DateInput
              label={t("competitions.startDate")}
              placeholder={t("competitions.startDatePlaceholder")}
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps("startDate")}
              value={
                form.values.startDate ? new Date(form.values.startDate) : null
              }
              onChange={(date) => form.setFieldValue("startDate", date)}
            />
            <DateInput
              label={t("competitions.endDate")}
              placeholder={t("competitions.endDatePlaceholder")}
              required
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps("endDate")}
              value={form.values.endDate ? new Date(form.values.endDate) : null}
              onChange={(date) => form.setFieldValue("endDate", date)}
            />
          </Group>

          <TextInput
            label={t("competitions.location")}
            placeholder={t("competitions.locationPlaceholder")}
            required
            {...form.getInputProps("location")}
          />

          <TextInput
            label={t("competitions.address")}
            placeholder={t("competitions.addressPlaceholder")}
            required
            {...form.getInputProps("address")}
          />

          <Group grow>
            <TextInput
              label={t("competitions.city")}
              placeholder={t("competitions.cityPlaceholder")}
              required
              {...form.getInputProps("city")}
            />
            <TextInput
              label={t("competitions.country")}
              placeholder={t("competitions.countryPlaceholder")}
              required
              {...form.getInputProps("country")}
            />
          </Group>

          <Select
            label={t("competitions.equipmentType")}
            placeholder={t("competitions.equipmentTypePlaceholder")}
            required
            data={[
              {
                value: "CLASSIC",
                label: t("competitions.equipmentTypes.CLASSIC"),
              },
              {
                value: "SINGLE",
                label: t("competitions.equipmentTypes.SINGLE"),
              },
              {
                value: "BP_CLASSIC",
                label: t("competitions.equipmentTypes.BP_CLASSIC"),
              },
              {
                value: "BP_SINGLE",
                label: t("competitions.equipmentTypes.BP_SINGLE"),
              },
            ]}
            {...form.getInputProps("equipmentType")}
          />

          <MultiSelect
            label={t("competitions.ageCategory")}
            placeholder={t("competitions.ageCategoriesPlaceholder")}
            required
            data={[
              {
                value: "SUB_JUNIORS",
                label: t("competitions.ageCategories.SUB_JUNIORS"),
              },
              {
                value: "JUNIORS",
                label: t("competitions.ageCategories.JUNIORS"),
              },
              { value: "OPEN", label: t("competitions.ageCategories.OPEN") },
              {
                value: "MASTERS_1",
                label: t("competitions.ageCategories.MASTERS_1"),
              },
              {
                value: "MASTERS_2",
                label: t("competitions.ageCategories.MASTERS_2"),
              },
              {
                value: "MASTERS_3",
                label: t("competitions.ageCategories.MASTERS_3"),
              },
              {
                value: "MASTERS_4",
                label: t("competitions.ageCategories.MASTERS_4"),
              },
            ]}
            {...form.getInputProps("ageCategories")}
          />

          {!skipEligibleFeds && (
            <MultiSelect
              label={t("competitions.eligibleFederations")}
              placeholder={t("competitions.eligibleFederationsPlaceholder")}
              data={
                federationsToAssign?.map((fed) => ({
                  value: fed._id,
                  label: `${fed.name} (${fed.abbreviation})`,
                })) ?? []
              }
              {...form.getInputProps("eligibleFederations")}
            />
          )}

          <Textarea
            label={t("competitions.description")}
            placeholder={t("competitions.descriptionPlaceholder")}
            minRows={3}
            {...form.getInputProps("description")}
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
