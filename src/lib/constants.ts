export const ALLOWED_DOMAINS = [
  "nst.rishihood.edu.in",
  "rishihood.edu.in",
  "csds.rishihood.edu.in",
  "psy.rishihood.edu.in",
  "makers.rishihood.edu.in",
  "souravyadav2987@gmail.com"
] as const;

export const CAMPUS = "Sonipat";

export const RIDE_STATUSES = ["active", "full", "expired"] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];
