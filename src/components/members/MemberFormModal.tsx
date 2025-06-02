import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Select,
  Group,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { createMember, updateFederation } from "@/services/memberService";
import type { Member, Federation, MemberFormValues } from "@/types";
import { notifications } from "@mantine/notifications";

interface MemberFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modalTitle: string;
  federation: Federation;
  memberToEdit?: Member;
  isEditMode?: boolean;
}

export default function MemberFormModal({
  opened,
  onClose,
  onSuccess,
  modalTitle,
  federation,
  memberToEdit,
  isEditMode = false,
}: MemberFormModalProps) {
  const { t } = useTranslation();

  const form = useForm<MemberFormValues>({
    initialValues: {
      name: memberToEdit?.name || "",
      federationId: federation._id,
      type: memberToEdit?.type || "CLUB",
    },
    validate: {
      name: (value) => (!value ? t("validation.required") : null),
      type: (value) => (!value ? t("validation.required") : null),
    },
  });

  const handleSubmit = async (values: MemberFormValues) => {
    try {
      if (isEditMode && memberToEdit) {
        await updateFederation(memberToEdit._id, values);
        notifications.show({
          title: t("notifications.success"),
          message: t("members.updateSuccess"),
          color: "green",
        });
      } else {
        await createMember({
          ...values,
          federationId: federation._id,
        });
        notifications.show({
          title: t("notifications.success"),
          message: t("members.createSuccess"),
          color: "green",
        });
      }
      onSuccess();
    } catch (error) {
      notifications.show({
        title: t("notifications.error"),
        message: t("members.createError"),
        color: "red",
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label={t("members.name")}
            placeholder={t("members.namePlaceholder")}
            required
            {...form.getInputProps("name")}
          />

          <Select
            label={t("members.type")}
            placeholder={t("members.typePlaceholder")}
            data={[
              { value: "CLUB", label: t("members.types.club") },
              { value: "INDIVIDUAL", label: t("members.types.individual") },
              { value: "UNIVERSITY", label: t("members.types.university") },
            ]}
            required
            withinPortal
            {...form.getInputProps("type")}
          />

          <Text size="sm" c="dimmed">
            {t("members.federationInfo", { federation: federation.name })}
          </Text>

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              {isEditMode ? t("common.save") : t("common.create")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
