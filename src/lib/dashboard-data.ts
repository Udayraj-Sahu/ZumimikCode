import {
  Home,
  Zap,
  LineChart,
  User,
  Settings,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  mobileLabel?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, mobileLabel: "Home" },
  { label: "Sprints", href: "/dashboard/configure-sprint", icon: Zap, mobileLabel: "Sprints" },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart, mobileLabel: "Stats" },
  { label: "Profile", href: "/dashboard/profile", icon: User, mobileLabel: "Profile" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, mobileLabel: "Gear" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutGrid },
  { label: "Sprints", href: "/dashboard/configure-sprint", icon: Zap },
  { label: "Stats", href: "/dashboard/analytics", icon: LineChart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Gear", href: "/dashboard/settings", icon: Settings },
];

export const STATS = [
  { label: "Efficiency Score", value: "87", suffix: "/100", accent: "primary" as const },
  { label: "Sessions", value: "47", suffix: "completed", accent: "default" as const },
  { label: "Mastery", value: "82%", suffix: "avg score", accent: "secondary" as const },
  { label: "Weekly Goal", value: "64%", suffix: "progress", accent: "default" as const },
];

export type Topic = {
  name: string;
  value: number;
  color: "primary" | "secondary";
};

export const TOPIC_MASTERY: Topic[] = [
  { name: "Quantitative Aptitude", value: 92, color: "primary" },
  { name: "Logical Reasoning", value: 78, color: "primary" },
  { name: "Verbal Ability", value: 64, color: "secondary" },
  { name: "Data Interpretation", value: 85, color: "primary" },
  { name: "General Knowledge", value: 41, color: "primary" },
];

export const RADAR_AXES = [
  { label: "Speed", value: 0.9 },
  { label: "Logic", value: 0.75 },
  { label: "Stamina", value: 0.7 },
  { label: "Focus", value: 0.8 },
  { label: "Memory", value: 0.72 },
  { label: "Reflex", value: 0.85 },
];
