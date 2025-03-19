import { useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Box,
  Select,
  Grid,
  Divider,
  Title,
  MultiSelect,
  Textarea,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

interface CompetitionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<void>;
  federations: { value: string; label: string }[];
  clubs: { value: string; label: string }[];
}

export function CompetitionForm({
  initialValues,
  onSubmit,
  federations,
  clubs,
}: CompetitionFormProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm({
    initialValues: initialValues || {
      name: "",
      startDate: null,
      endDate: null,
      location: "",
      address: "",
      city: "",
      country: "",
      hostFederation: "",
      hostClub: "",
      eligibleFederations: [],
      equipmentType: "",
      ageCategories: [],
      description: "",
    },
    validate: {
      name: (value) => (value ? null : t("auth.required")),
      startDate: (value) => (value ? null : t("auth.required")),
      location: (value) => (value ? null : t("auth.required")),
      city: (value) => (value ? null : t("auth.required")),
      country: (value) => (value ? null : t("auth.required")),
      hostFederation: (value) => (value ? null : t("auth.required")),
      equipmentType: (value) => (value ? null : t("auth.required")),
      ageCategories: (value) => (value.length > 0 ? null : t("auth.required")),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await onSubmit(values);

      notifications.show({
        title: initialValues
          ? t("competitions.updateSuccess")
          : t("competitions.createSuccess"),
        message: initialValues
          ? t("competitions.competitionUpdated")
          : t("competitions.competitionCreated"),
        color: "green",
      });
    } catch {
      notifications.show({
        title: initialValues
          ? t("competitions.updateFailed")
          : t("competitions.createFailed"),
        message: t("auth.errorOccurred"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={3} mb="md">
          {initialValues ? t("competitions.edit") : t("competitions.create")}
        </Title>

        <TextInput
          required
          label={t("competitions.name")}
          placeholder={t("competitions.enterName")}
          {...form.getInputProps("name")}
          mb="md"
        />

        <Grid>
          <Grid.Col span={6}>
            <DatePicker
              required
              label={t("competitions.startDate")}
              placeholder={t("competitions.selectDate")}
              {...form.getInputProps("startDate")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <DatePicker
              label={t("competitions.endDate")}
              placeholder={t("competitions.selectDate")}
              {...form.getInputProps("endDate")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Divider my="md" label={t("competitions.location")} />

        <TextInput
          required
          label={t("competitions.venue")}
          placeholder={t("competitions.enterVenue")}
          {...form.getInputProps("location")}
          mb="md"
        />

        <TextInput
          label={t("competitions.address")}
          placeholder={t("competitions.enterAddress")}
          {...form.getInputProps("address")}
          mb="md"
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              required
              label={t("competitions.city")}
              placeholder={t("competitions.enterCity")}
              {...form.getInputProps("city")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              required
              label={t("competitions.country")}
              placeholder={t("competitions.enterCountry")}
              {...form.getInputProps("country")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <Divider my="md" label={t("competitions.organization")} />

        <Grid>
          <Grid.Col span={6}>
            <Select
              required
              label={t("competitions.hostFederation")}
              placeholder={t("competitions.selectFederation")}
              data={federations}
              {...form.getInputProps("hostFederation")}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label={t("competitions.hostClub")}
              placeholder={t("competitions.selectClub")}
              data={clubs}
              {...form.getInputProps("hostClub")}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        <MultiSelect
          label={t("competitions.eligibleFederations")}
          placeholder={t("competitions.selectFederations")}
          data={federations}
          {...form.getInputProps("eligibleFederations")}
          mb="md"
        />

        <Divider my="md" label={t("competitions.details")} />

        <Select
          required
          label={t("competitions.equipmentType")}
          placeholder={t("competitions.selectEquipmentType")}
          data={[
            {
              value: "equipped",
              label: t("competitions.equipmentTypes.equipped"),
            },
            {
              value: "classic",
              label: t("competitions.equipmentTypes.classic"),
            },
            {
              value: "equippedBench",
              label: t("competitions.equipmentTypes.equippedBench"),
            },
            {
              value: "classicBench",
              label: t("competitions.equipmentTypes.classicBench"),
            },
          ]}
          {...form.getInputProps("equipmentType")}
          mb="md"
        />

        <MultiSelect
          required
          label={t("competitions.ageCategories")}
          placeholder={t("competitions.selectAgeCategories")}
          data={[
            {
              value: "subJuniors",
              label: t("competitions.ageCategories.subJuniors"),
            },
            {
              value: "juniors",
              label: t("competitions.ageCategories.juniors"),
            },
            { value: "open", label: t("competitions.ageCategories.open") },
            {
              value: "masters1",
              label: t("competitions.ageCategories.masters1"),
            },
            {
              value: "masters2",
              label: t("competitions.ageCategories.masters2"),
            },
            {
              value: "masters3",
              label: t("competitions.ageCategories.masters3"),
            },
            {
              value: "masters4",
              label: t("competitions.ageCategories.masters4"),
            },
            {
              value: "masters",
              label: t("competitions.ageCategories.masters"),
            },
          ]}
          {...form.getInputProps("ageCategories")}
          mb="md"
        />

        <Textarea
          label={t("competitions.description")}
          placeholder={t("competitions.enterDescription")}
          {...form.getInputProps("description")}
          mb="md"
          minRows={4}
        />

        <Button type="submit" loading={loading} mt="lg">
          {initialValues ? t("common.save") : t("common.create")}
        </Button>
      </form>
    </Box>
  );
}
