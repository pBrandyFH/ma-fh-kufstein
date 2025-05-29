import { WeightCategory, Gender } from "@/types";
import i18next from "i18next";

interface WeightCategoryOption {
  value: WeightCategory;
  label: string;
  gender: Gender;
}

export function getWeightCategoryOptions(equipmentType: "CLASSIC" | "SINGLE" | "BP_CLASSIC" | "BP_SINGLE"): WeightCategoryOption[] {
  const maleCategories: WeightCategoryOption[] = [
    { value: "u53", label: i18next.t("athletes.weightCategories.male.u53"), gender: "male" },
    { value: "u59", label: i18next.t("athletes.weightCategories.male.u59"), gender: "male" },
    { value: "u66", label: i18next.t("athletes.weightCategories.male.u66"), gender: "male" },
    { value: "u74", label: i18next.t("athletes.weightCategories.male.u74"), gender: "male" },
    { value: "u83", label: i18next.t("athletes.weightCategories.male.u83"), gender: "male" },
    { value: "u93", label: i18next.t("athletes.weightCategories.male.u93"), gender: "male" },
    { value: "u105", label: i18next.t("athletes.weightCategories.male.u105"), gender: "male" },
    { value: "u120", label: i18next.t("athletes.weightCategories.male.u120"), gender: "male" },
    { value: "o120", label: i18next.t("athletes.weightCategories.male.o120"), gender: "male" },
  ];

  const femaleCategories: WeightCategoryOption[] = [
    { value: "u43", label: i18next.t("athletes.weightCategories.female.u43"), gender: "female" },
    { value: "u47", label: i18next.t("athletes.weightCategories.female.u47"), gender: "female" },
    { value: "u52", label: i18next.t("athletes.weightCategories.female.u52"), gender: "female" },
    { value: "u57", label: i18next.t("athletes.weightCategories.female.u57"), gender: "female" },
    { value: "u63", label: i18next.t("athletes.weightCategories.female.u63"), gender: "female" },
    { value: "u69", label: i18next.t("athletes.weightCategories.female.u69"), gender: "female" },
    { value: "u76", label: i18next.t("athletes.weightCategories.female.u76"), gender: "female" },
    { value: "u84", label: i18next.t("athletes.weightCategories.female.u84"), gender: "female" },
    { value: "o84", label: i18next.t("athletes.weightCategories.female.o84"), gender: "female" },
  ];

  // For single-ply and bench press competitions, we only use certain weight classes
  if (equipmentType === "SINGLE" || equipmentType === "BP_SINGLE") {
    return [
      ...maleCategories.filter(cat => ["u59", "u66", "u74", "u83", "u93", "u105", "u120", "o120"].includes(cat.value)),
      ...femaleCategories.filter(cat => ["u47", "u52", "u57", "u63", "u69", "u76", "u84", "o84"].includes(cat.value)),
    ];
  }

  // For bench press classic, we use different weight classes
  if (equipmentType === "BP_CLASSIC") {
    return [
      ...maleCategories.filter(cat => ["u59", "u66", "u74", "u83", "u93", "u105", "u120", "o120"].includes(cat.value)),
      ...femaleCategories.filter(cat => ["u47", "u52", "u57", "u63", "u69", "u76", "u84", "o84"].includes(cat.value)),
    ];
  }

  // For classic powerlifting, return all weight classes
  return [...maleCategories, ...femaleCategories];
}

export function getWeightCategoryOptionsByGender(
  equipmentType: "CLASSIC" | "SINGLE" | "BP_CLASSIC" | "BP_SINGLE",
  gender: Gender
): WeightCategoryOption[] {
  return getWeightCategoryOptions(equipmentType).filter(cat => cat.gender === gender);
}

export function getWeightCategoryLabel(category: WeightCategory, gender: Gender): string {
  return i18next.t(`athletes.weightCategories.${gender}.${category}`);
} 