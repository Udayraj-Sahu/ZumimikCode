import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  mobileLabel?: string;
};

export type StatAccent = "primary" | "default" | "secondary";

export type Stat = {
  label: string;
  value: string;
  suffix: string;
  accent: StatAccent;
};

export type Topic = {
  name: string;
  value: number;
  color: "primary" | "secondary";
};

export type RadarAxis = {
  label: string;
  value: number;
};

export type Metric = {
  label: string;
  value: string;
  icon: string;
  accent: "primary" | "secondary";
};
