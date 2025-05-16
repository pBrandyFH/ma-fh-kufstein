import { Competition } from "@/types";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CompetitionFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  hostFederationId: string;
  competitionToEdit?: Competition; // Federation to edit (if editing mode)
  isEditMode?: boolean; // Whether we're editing or creating
}

export default function CompetitionFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  competitionToEdit,
  hostFederationId,
  isEditMode = false,
}: CompetitionFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: competitionToEdit?.name || "",
      startDate: competitionToEdit?.startDate || null,
      endDate: competitionToEdit?.endDate || null,
      location: competitionToEdit?.location || "",
      address: competitionToEdit?.address || "",
      city: competitionToEdit?.city || "",
      country: competitionToEdit?.country || "",
      hostFederation: competitionToEdit?.hostFederation || hostFederationId,
      hostMember: competitionToEdit?.hostMember || "",
      eligibleFederations: competitionToEdit?.eligibleFederations || [],
      equipmentType: competitionToEdit?.equipmentType || "",
      ageCategories: competitionToEdit?.ageCategories || [],
      description: competitionToEdit?.description || "",
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
}
