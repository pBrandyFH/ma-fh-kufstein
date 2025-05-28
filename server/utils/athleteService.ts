import { AgeCategory } from "../models/Competition";

export function getAgeCategoryFromDate(dateOfBirth: Date): AgeCategory {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Determine age category
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

// Helper function to check if an athlete is eligible for a specific age category
export function isEligibleForAgeCategory(dateOfBirth: Date, category: AgeCategory): boolean {
  const athleteCategory = getAgeCategoryFromDate(dateOfBirth);
  
  // Special case for OPEN category - everyone is eligible
  if (category === "OPEN") {
    return true;
  }
  
  // For other categories, athlete must be in that specific category
  return athleteCategory === category;
}