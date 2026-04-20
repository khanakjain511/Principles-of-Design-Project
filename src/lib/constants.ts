export const ALLOWED_DOMAINS = [
  "nst.rishihood.edu.in",
  "rishihood.edu.in",
] as const;

export const CAMPUS = "Sonipat";

export const RIDE_STATUSES = ["active", "full", "expired"] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];
