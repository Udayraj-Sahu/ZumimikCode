import type { NavItem, Topic, RadarAxis, Metric } from "@/lib/types/dashboard";
import {
  Home,
  Zap,
  LineChart,
  User,
  Settings,
  LayoutGrid,
} from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, section: "Main" },
  { label: "Sprints", href: "/dashboard/configure-sprint", icon: Zap, section: "Training" },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart, section: "Training" },
  { label: "Profile", href: "/dashboard/profile", icon: User, section: "Account" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "Account" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutGrid },
  { label: "Sprints", href: "/dashboard", icon: Zap },
  { label: "Stats", href: "/dashboard/analytics", icon: LineChart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Gear", href: "/dashboard/settings", icon: Settings },
];

export const TOPIC_MASTERY: Topic[] = [
  { name: "Quantitative Aptitude", value: 92, color: "primary" },
  { name: "Logical Reasoning", value: 78, color: "primary" },
  { name: "Verbal Ability", value: 64, color: "primary" },
  { name: "Data Interpretation", value: 85, color: "primary" },
  { name: "General Knowledge", value: 41, color: "primary" },
];

export const RADAR_AXES: RadarAxis[] = [
  { label: "Speed", value: 0.9 },
  { label: "Logic", value: 0.75 },
  { label: "Stamina", value: 0.7 },
  { label: "Focus", value: 0.8 },
  { label: "Memory", value: 0.72 },
  { label: "Reflex", value: 0.85 },
];

export const METRICS: Metric[] = [
  { label: "Action Delay", value: "142ms", icon: "Zap", accent: "primary" },
  { label: "Focus Density", value: "89%", icon: "TrendingUp", accent: "primary" },
];
