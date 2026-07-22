import {
  Link as LinkIcon,
  ClipboardList,
  CalendarClock,
  ShieldCheck,
  MailCheck,
  UserCircle,
  Video,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { ProcessStepIcon, FeatureCardIcon } from "@/config/clinic";

const PROCESS_STEP_ICONS: Record<ProcessStepIcon, LucideIcon> = {
  link: LinkIcon,
  "clipboard-list": ClipboardList,
  "calendar-clock": CalendarClock,
  "shield-check": ShieldCheck,
  "mail-check": MailCheck,
};

const FEATURE_ICONS: Record<FeatureCardIcon, LucideIcon> = {
  "user-circle": UserCircle,
  video: Video,
  "file-text": FileText,
};

export function ProcessStepIconComponent({
  icon,
  className,
}: {
  icon: ProcessStepIcon;
  className?: string;
}) {
  const Icon = PROCESS_STEP_ICONS[icon];
  return <Icon className={className} aria-hidden="true" />;
}

export function FeatureIconComponent({
  icon,
  className,
}: {
  icon: FeatureCardIcon;
  className?: string;
}) {
  const Icon = FEATURE_ICONS[icon];
  return <Icon className={className} aria-hidden="true" />;
}
