import { AgeCategory } from "../models/Competition";

export function getAgeCategoryFromDate(dateOfBirth: Date): AgeCategory {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 18) {
    return "SUB_JUNIORS";
  } else if (age <= 23) {
    return "JUNIORS";
  } else if (age >= 70) {
    return "MASTERS_4";
  } else if (age >= 60) {
    return "MASTERS_3";
  } else if (age >= 50) {
    return "MASTERS_2";
  } else if (age >= 40) {
    return "MASTERS_1";
  } else {
    return "OPEN";
  }
}

export function isEligibleForAgeCategory(dateOfBirth: Date, category: AgeCategory): boolean {
  const athleteCategory = getAgeCategoryFromDate(dateOfBirth);
  
  if (category === "OPEN") {
    return true;
  }
  
  return athleteCategory === category;
}