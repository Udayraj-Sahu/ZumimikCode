import type { NavItem, Topic, RadarAxis, Metric, DashboardStats, StreakData, UpcomingEvent, LeaderboardEntry, HomeRecentActivityItem } from "@/lib/types/dashboard";
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
  { label: "Sprints", href: "/dashboard/configure-sprint", icon: Zap },
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

export const DASHBOARD_STATS: DashboardStats = {
  accuracy: 87,
  questions: 1247,
  percentile: 64,
  speed: 47,
};

export const STREAK_DATA: StreakData = {
  current: 6,
  xp: 2340,
  days: [true, true, true, false, true, true, false],
  labels: ["M", "T", "W", "T", "F", "S", "S"],
};

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  { title: "Sprint Duel", time: "Today, 8PM", tag: "LIVE" },
  { title: "Mock CAT #7", time: "Thu, 10AM", tag: "MOCK" },
  { title: "Group Challenge", time: "Sat, 3PM", tag: "GROUP" },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Priya S.", xp: 4820 },
  { rank: 2, name: "Arjun M.", xp: 4310 },
  { rank: 3, name: "Rohan K.", xp: 3990 },
  { rank: 47, name: "You", xp: 2340, me: true },
];

export const HOME_RECENT_ACTIVITY: HomeRecentActivityItem[] = [
  { label: "LR Sprint", score: "22/25", time: "2h ago" },
  { label: "Quant Set #14", score: "18/20", time: "Yesterday" },
  { label: "Full CAT Mock", score: "142/300", time: "2d ago" },
];
