// Only the icons the app names by string (nav items, stat cards). Importing
// `* as Icons` pulled every lucide icon into the bundle.
import {
  Activity,
  Banknote,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CircleHelp,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  HeartPulse,
  Home,
  Hospital,
  LayoutDashboard,
  LucideIcon,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

const ICONS = {
  Activity,
  Banknote,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  HeartPulse,
  Home,
  Hospital,
  LayoutDashboard,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  UserPlus,
  Users,
  Wallet,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const getIconComponent = (iconName: string): LucideIcon =>
  ICONS[iconName as IconName] ?? CircleHelp;
