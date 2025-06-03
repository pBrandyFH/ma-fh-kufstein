import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Select,
  Group,
  Text,
  Checkbox,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { createAthlete } from "@/services/athleteService";
import { getMembersByFederationId } from "@/services/memberService";
import { useDataFetching } from "@/hooks/useDataFetching";
import {
  Athlete,
  AthleteFormValues,
  Federation,
  Gender,
  Member,
  WeightCategory,
} from "@/types";
import { notifications } from "@mantine/notifications";
import {
  femaleCategories,
  maleCategories,
  WeightCategoryOption,
} from "@/utils/weightCategories";

interface AthleteFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  federation: Federation;
  existingMember?: Member | null;
  athleteToEdit?: Athlete;
  isEditMode?: boolean;
}

export default function AthleteFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  federation,
  athleteToEdit,
  existingMember,
  isEditMode = false,
}: AthleteFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    data: members,
    loading: membersLoading,
    error: membersError,
  } = useDataFetching<Member[]>({
    fetchFunction: () => getMembersByFederationId(federation._id),
  });

  const form = useForm<AthleteFormValues>({
    initialValues: {
      firstName: athleteToEdit?.firstName || "",
      lastName: athleteToEdit?.lastName || "",
      email: athleteToEdit?.email || "",
      dateOfBirth: athleteToEdit?.dateOfBirth || null,
      gender: athleteToEdit?.gender || null,
      weightCategory: athleteToEdit?.weightCategory || null,
      member: athleteToEdit?.member._id || existingMember?._id || "",
      federation: federation._id,
      sendInvite: true,
    },
    validate: {
      firstName: (value) => (!value ? t("validation.required") : null),
      lastName: (value) => (!value ? t("validation.required") : null),
      email: (value) =>
        !value
          ? t("validation.required")
          : /^\S+@\S+$/.test(value)
          ? null
          : t("validation.invalidEmail"),
      dateOfBirth: (value) => (!value ? t("validation.required") : null),
      gender: (value) => (!value ? t("validation.required") : null),
      weightCategory: (value) => (!value ? t("validation.required") : null),
      member: (value) => (!value ? t("validation.required") : null),
      federation: (value) => (!value ? t("validation.required") : null),
    },
  });

  const getWeightCategories = (gender: Gender): WeightCategoryOption[] => {
    if (gender === "male") {
      return maleCategories;
    } else {
      return femaleCategories;
    }
  };

  const handleSubmit = async (values: AthleteFormValues) => {
    setLoading(true);
    try {
      const response = await createAthlete(values);

      if (response.success) {
        notifications.show({
          title: t("notifications.success"),
          message: t("athletes.createSuccess"),
          color: "green",
        });
        form.reset();
        onSuccess();
      } else {
        notifications.show({
          title: t("notifications.error"),
          message: response.error || t("athletes.createError"),
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error creating athlete:", error);
      notifications.show({
        title: t("notifications.error"),
        message: t("athletes.createError"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Group grow>
            <TextInput
              label={t("athletes.firstName")}
              placeholder={t("athletes.firstNamePlaceholder")}
              required
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label={t("athletes.lastName")}
              placeholder={t("athletes.lastNamePlaceholder")}
              required
              {...form.getInputProps("lastName")}
            />
          </Group>

          <TextInput
            label={t("athletes.email")}
            placeholder={t("athletes.emailPlaceholder")}
            required
            {...form.getInputProps("email")}
          />

          <DateInput
            label={t("athletes.dateOfBirth")}
            placeholder={t("athletes.dateOfBirthPlaceholder")}
            required
            valueFormat="DD/MM/YYYY"
            popoverProps={{ withinPortal: true }}
            {...form.getInputProps("dateOfBirth")}
            value={
              form.values.dateOfBirth ? new Date(form.values.dateOfBirth) : null
            }
            onChange={(date: Date | null) =>
              form.setFieldValue("dateOfBirth", date)
            }
          />

          <Select
            label={t("athletes.gender")}
            placeholder={t("athletes.genderPlaceholder")}
            required
            data={[
              { value: "male", label: t("athletes.male") },
              { value: "female", label: t("athletes.female") },
            ]}
            {...form.getInputProps("gender")}
            onChange={(value) => {
              form.setFieldValue("gender", value as Gender);
              form.setFieldValue("weightCategory", null); // Reset weight category when gender changes
            }}
          />

          {form.values.gender && (
            <Select
              withinPortal
              label={t("athletes.weightCategory")}
              placeholder={t("athletes.weightCategoryPlaceholder")}
              required
              data={getWeightCategories(form.values.gender as Gender)}
              {...form.getInputProps("weightCategory")}
            />
          )}

          {!existingMember && (
            <Select
              label={t("athletes.member")}
              placeholder={t("athletes.memberPlaceholder")}
              required
              data={
                members?.map((member) => ({
                  value: member._id,
                  label: member.name,
                })) ?? []
              }
              {...form.getInputProps("member")}
            />
          )}

          <Checkbox
            label={t("athletes.sendInvite")}
            {...form.getInputProps("sendInvite", { type: "checkbox" })}
          />
          {existingMember && (
            <Text size="sm" c="dimmed">
              {t("members.addToMember", { member: existingMember.name })}
            </Text>
          )}

          <Text size="sm" c="dimmed">
            {t("members.federationInfo", { federation: federation.name })}
          </Text>

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={loading}>
              {isEditMode ? t("common.save") : t("common.create")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
