import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: string;
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
