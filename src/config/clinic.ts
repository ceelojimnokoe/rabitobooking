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
  | "mycaremobile-online";

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
    id: "mycaremobile-online",
    label: "MyCareMobile (Online)",
    description: "Online video consultation from any location.",
  },
];

export type BranchId =
  | "osu"
  | "east-legon"
  | "tema-comm-11"
  | "dansoman"
  | "kasoa"
  | "adiebeba"
  | "koforidua"
  | "online";

export interface BranchOption {
  id: BranchId;
  label: string;
}

export const branches: BranchOption[] = [
  { id: "osu", label: "Osu" },
  { id: "east-legon", label: "East Legon" },
  { id: "tema-comm-11", label: "Tema Comm 11" },
  { id: "dansoman", label: "Dansoman" },
  { id: "kasoa", label: "Kasoa" },
  { id: "adiebeba", label: "Adiebeba" },
  { id: "koforidua", label: "Koforidua" },
  { id: "online", label: "Online" },
];

/** Service that should steer patients toward the online branch. */
export const onlineServiceId: ServiceId = "mycaremobile-online";
export const recommendedOnlineBranchId: BranchId = "online";

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

export type PatientTypeId = "new" | "existing";

export interface PatientTypeOption {
  id: PatientTypeId;
  label: string;
}

/** Whether the patient has visited the clinic before. */
export const patientTypes: PatientTypeOption[] = [
  { id: "new", label: "New patient" },
  { id: "existing", label: "Existing patient" },
];

export interface DayHours {
  open: string;
  close: string;
}

export interface BranchSchedule {
  /** Monday–Friday hours, or null if closed weekdays. */
  weekday: DayHours | null;
  /** Saturday–Sunday hours, or null if closed weekends. */
  weekend: DayHours | null;
}

const DEFAULT_WEEKDAY_HOURS: DayHours = { open: "08:00", close: "16:00" };
const DEFAULT_WEEKEND_HOURS: DayHours = { open: "08:00", close: "14:00" };

/**
 * Per-branch opening hours. All branches default to weekdays 8am–4pm and
 * weekends 8am–2pm, with two overrides: East Legon stays open later on
 * weekdays, and Koforidua is closed entirely on weekends.
 */
export const branchSchedules: Record<BranchId, BranchSchedule> = {
  osu: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
  "east-legon": {
    weekday: { open: "08:00", close: "19:00" },
    weekend: DEFAULT_WEEKEND_HOURS,
  },
  "tema-comm-11": { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
  dansoman: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
  kasoa: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
  adiebeba: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
  koforidua: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: null },
  online: { weekday: DEFAULT_WEEKDAY_HOURS, weekend: DEFAULT_WEEKEND_HOURS },
};

/**
 * Scheduling configuration shared across all branches. Per-branch hours
 * live in `branchSchedules` above; availability is otherwise configurable
 * here (slot length, how far ahead patients can book, and the timezone
 * all date/time logic is evaluated in).
 */
export const scheduling = {
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
