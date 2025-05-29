import { useState } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Table,
  TextInput,
  Select,
  Grid,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Plus, MoreVertical, Edit, Trash, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Athlete, Gender, WeightCategory } from "../../../types";

// Mock data for testing
const mockAthletes: Athlete[] = [
  {
    _id: "1",
    userId: "1",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("1990-01-01"),
    gender: "male",
    weightCategory: "u83",
    clubId: "1",
    federationId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    userId: "2",
    firstName: "Jane",
    lastName: "Smith",
    dateOfBirth: new Date("1992-05-15"),
    gender: "female",
    weightCategory: "u63",
    clubId: "2",
    federationId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const weightCategories: { value: WeightCategory; label: string }[] = [
  { value: "u43", label: "43kg" },
  { value: "u47", label: "47kg" },
  { value: "u52", label: "52kg" },
  { value: "u57", label: "57kg" },
  { value: "u63", label: "63kg" },
  { value: "u69", label: "69kg" },
  { value: "u76", label: "76kg" },
  { value: "u84", label: "84kg" },
  { value: "o84", label: "84kg+" },
  { value: "u53", label: "53kg" },
  { value: "u59", label: "59kg" },
  { value: "u66", label: "66kg" },
  { value: "u74", label: "74kg" },
  { value: "u83", label: "83kg" },
  { value: "u93", label: "93kg" },
  { value: "u105", label: "105kg" },
  { value: "u120", label: "120kg" },
  { value: "o120", label: "120kg+" },
];

export function AthletesView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedWeightCategory, setSelectedWeightCategory] = useState<WeightCategory | null>(null);

  const filteredAthletes = mockAthletes.filter((athlete) => {
    const matchesSearch =
      athlete.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = !selectedGender || athlete.gender === selectedGender;
    const matchesWeightCategory =
      !selectedWeightCategory || athlete.weightCategory === selectedWeightCategory;

    return matchesSearch && matchesGender && matchesWeightCategory;
  });

  const handleGenderChange = (value: string | null) => {
    setSelectedGender(value as Gender | null);
  };

  const handleWeightCategoryChange = (value: string | null) => {
    setSelectedWeightCategory(value as WeightCategory | null);
  };

  return (
    <Card withBorder p="xl">
      <Group position="apart" mb="xl">
        <Title order={2}>{t("athletes.title")}</Title>
        <Button
          component={Link}
          to="/athletes/create"
          leftIcon={<Plus size={16} />}
        >
          {t("athletes.create")}
        </Button>
      </Group>

      <Grid mb="xl">
        <Grid.Col span={4}>
          <TextInput
            placeholder={t("athletes.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder={t("athletes.genderPlaceholder")}
            value={selectedGender}
            onChange={handleGenderChange}
            data={[
              { value: "male", label: t("athletes.male") },
              { value: "female", label: t("athletes.female") },
            ]}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder={t("athletes.weightCategoryPlaceholder")}
            value={selectedWeightCategory}
            onChange={handleWeightCategoryChange}
            data={weightCategories}
            clearable
          />
        </Grid.Col>
      </Grid>

      <Table>
        <thead>
          <tr>
            <th>{t("athletes.name")}</th>
            <th>{t("athletes.gender")}</th>
            <th>{t("athletes.weightCategory")}</th>
            <th>{t("athletes.club")}</th>
            <th>{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredAthletes.map((athlete) => (
            <tr key={athlete._id}>
              <td>
                <Group spacing="xs">
                  <User size={16} />
                  <Text>
                    {athlete.firstName} {athlete.lastName}
                  </Text>
                </Group>
              </td>
              <td>{t(`athletes.${athlete.gender}`)}</td>
              <td>{weightCategories.find(cat => cat.value === athlete.weightCategory)?.label}</td>
              <td>Club Name</td>
              <td>
                <Group spacing="xs">
                  <ActionIcon
                    component={Link}
                    to={`/athletes/${athlete._id}`}
                    color="blue"
                    variant="light"
                  >
                    <Edit size={16} />
                  </ActionIcon>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon color="gray" variant="light">
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        component={Link}
                        to={`/athletes/${athlete._id}/edit`}
                        icon={<Edit size={14} />}
                      >
                        {t("common.edit")}
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        icon={<Trash size={14} />}
                      >
                        {t("common.delete")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
} 