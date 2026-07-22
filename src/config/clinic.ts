/**
 * Central clinic configuration.
 *
 * Every clinic-specific fact (branding, services, branches, teams, hours,
 * contact placeholders, disclaimers) lives in this single file so the demo
 * can be re-branded or re-pointed at real clinic data by editing one place
 * instead of hunting through components.
 */

export const clinicIdentity = {
  /** Text-only branding. Do not add a logo asset here — none has been approved. */
  name: "Rabito Clinic",
  shortName: "Rabito",
  tagline: "Book Your Clinic Appointment",
} as const;

/**
 * Concept-demo disclaimer, shown in the footer and on key confirmation
 * screens/emails. Set to an empty string to remove the disclaimer
 * everywhere at once (e.g. once the clinic approves the project for real
 * use) — every consumer treats an empty string as "do not render".
 */
export const demoDisclaimer =
  "Concept demonstration — not an official Rabito Clinic platform.";

export type ServiceId =
  | "chief-dermatology"
  | "general-dermatology"
  | "general-health"
  | "cosmetic-centre"
  | "mycarenow-online";

export interface ServiceOption {
  id: ServiceId;
  label: string;
  description: string;
}

/** Services offered for booking. Labels are the values stored/displayed. */
export const services: ServiceOption[] = [
  {
    id: "chief-dermatology",
    label: "Chief Dermatology",
    description: "Senior dermatology consultation for complex skin concerns.",
  },
  {
    id: "general-dermatology",
    label: "General Dermatology",
    description: "Routine dermatology consultations and skin reviews.",
  },
  {
    id: "general-health",
    label: "General Health",
    description: "General consultations for everyday health concerns.",
  },
  {
    id: "cosmetic-centre",
    label: "Rabito Cosmetic Centre",
    description: "Cosmetic and aesthetic consultations.",
  },
  {
    id: "mycarenow-online",
    label: "Mycarenow (Online)",
    description: "Online video consultation from any location.",
  },
];

export type BranchId =
  | "accra-clinic"
  | "tema-clinic"
  | "kumasi-clinic"
  | "online-consultation";

export interface BranchOption {
  id: BranchId;
  label: string;
}

/**
 * DEMO BRANCH NAMES — these are placeholder locations for demonstration
 * purposes only. Replace with the clinic's confirmed, real branch list
 * before any production use.
 */
export const branches: BranchOption[] = [
  { id: "accra-clinic", label: "Accra Clinic" },
  { id: "tema-clinic", label: "Tema Clinic" },
  { id: "kumasi-clinic", label: "Kumasi Clinic" },
  { id: "online-consultation", label: "Online Consultation" },
];

/** Service that should steer patients toward the online branch. */
export const onlineServiceId: ServiceId = "mycarenow-online";
export const recommendedOnlineBranchId: BranchId = "online-consultation";

export type TeamId =
  | "dermatology-team"
  | "general-health-team"
  | "cosmetic-centre-team"
  | "online-care-team";

export interface TeamOption {
  id: TeamId;
  label: string;
}

/** Demo internal team list used when an administrator assigns a request. */
export const teams: TeamOption[] = [
  { id: "dermatology-team", label: "Dermatology Team" },
  { id: "general-health-team", label: "General Health Team" },
  { id: "cosmetic-centre-team", label: "Cosmetic Centre Team" },
  { id: "online-care-team", label: "Online Care Team" },
];

/**
 * Scheduling configuration. Days follow JavaScript's Date#getDay() numbering
 * (0 = Sunday ... 6 = Saturday). Demo defaults are Monday–Saturday, 9am–5pm,
 * in 30-minute increments, closed Sundays.
 */
export const scheduling = {
  workingDays: [1, 2, 3, 4, 5, 6] as number[],
  openingTime: "09:00",
  closingTime: "17:00",
  slotDurationMinutes: 30,
  bookingWindowDays: 60,
  timezone: "Africa/Accra",
} as const;

/** Placeholder contact details — replace with the clinic's real details. */
export const contactPlaceholders = {
  phone: "+233 00 000 0000 (placeholder — update before launch)",
  email: "appointments@rabitoclinic.example (placeholder)",
  address: "Rabito Clinic, Accra, Ghana (placeholder address)",
} as const;

export type FeatureCardIcon = "user-circle" | "video" | "file-text";

export interface ComingSoonFeature {
  title: string;
  description: string;
  icon: FeatureCardIcon;
}

/** Non-functional "coming soon" feature cards shown on the landing page. */
export const comingSoonFeatures: ComingSoonFeature[] = [
  {
    title: "Patient Portal",
    description:
      "Securely view appointments and clinic communications.",
    icon: "user-circle",
  },
  {
    title: "Teleconsultations",
    description:
      "Attend approved online consultations from any location.",
    icon: "video",
  },
  {
    title: "Lab Results",
    description: "Receive and review clinic reports securely.",
    icon: "file-text",
  },
];

export type ProcessStepIcon =
  | "link"
  | "clipboard-list"
  | "calendar-clock"
  | "shield-check"
  | "mail-check";

export interface ProcessStep {
  title: string;
  description: string;
  icon: ProcessStepIcon;
}

/** Five-step explanation shown on the landing page. */
export const processSteps: ProcessStep[] = [
  {
    title: "Open booking link",
    description: "Access the public booking page from any device.",
    icon: "link",
  },
  {
    title: "Complete appointment form",
    description: "Share your name, contact number and email address.",
    icon: "clipboard-list",
  },
  {
    title: "Select preferred date and time",
    description: "Choose a service, branch and a time that works for you.",
    icon: "calendar-clock",
  },
  {
    title: "Clinic reviews the request",
    description: "Our team checks availability and confirms the details.",
    icon: "shield-check",
  },
  {
    title: "Receive confirmation email",
    description: "Get your confirmed appointment and reference number.",
    icon: "mail-check",
  },
];
