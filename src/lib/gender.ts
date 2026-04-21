export const GENDER_VALUES = [
  "female",
  "male",
  "non-binary",
  "prefer-not-to-say",
] as const;

export type Gender = (typeof GENDER_VALUES)[number];

export const GENDER_LABEL: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};
