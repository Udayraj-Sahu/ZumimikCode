"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Bell,
  Clock,
  ScanLine,
  Timer,
  CreditCard,
  ShieldCheck,
  Download,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DojoShell } from "@/components/dashboard/dojo-shell";

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-primary">{children}</h2>
  );
}

function Row({
  icon: Icon,
  label,
  trailing,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        onClick && "hover:bg-accent/40",
      )}
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {trailing}
    </Tag>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {children}
    </div>
  );
}

const REST_OPTIONS = ["30s", "60s", "90s", "120s"];

export default function SettingsPage() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [restIndex, setRestIndex] = useState(1);

  const cycleRest = () => setRestIndex((i) => (i + 1) % REST_OPTIONS.length);

  const handleDelete = () => {
    if (window.confirm("Delete your account? This action cannot be undone.")) {
      alert("Account deletion requested.");
    }
  };

  return (
    <DojoShell>
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center gap-2 text-primary outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
            <h1 className="text-xl font-bold uppercase italic tracking-tight">Settings</h1>
          </button>
          <span className="font-mono text-sm font-bold uppercase italic tracking-tight text-primary">
            Exam Arena
          </span>
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-[0_0_40px_-10px] shadow-primary/60">
          <h3 className="text-2xl font-extrabold uppercase italic tracking-tight">Unlock Pro</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-80">
            Accelerate Your Evolution
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-2xl font-extrabold italic">$9.99/MO</span>
            <button
              type="button"
              onClick={() => router.push("/dashboard/configure-sprint")}
              className="rounded-lg bg-background/90 px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring"
            >
              Upgrade Now
            </button>
          </div>
        </section>

        <section className="mt-8">
          <GroupLabel>Account</GroupLabel>
          <Card>
            <Row
              icon={User}
              label="Profile Information"
              onClick={() => router.push("/dashboard/profile")}
              trailing={<ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />}
            />
            <Row
              icon={Mail}
              label="Email Address"
              onClick={() => alert("Edit email address")}
              trailing={
                <span className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">user@examarena.com</span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                </span>
              }
            />
          </Card>
        </section>

        <section className="mt-8">
          <GroupLabel>Notifications</GroupLabel>
          <Card>
            <Row
              icon={Bell}
              label="Push Notifications"
              trailing={
                <Toggle
                  label="Push Notifications"
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                />
              }
            />
            <Row
              icon={Clock}
              label="Session Reminders"
              trailing={
                <Toggle
                  label="Session Reminders"
                  checked={sessionReminders}
                  onChange={setSessionReminders}
                />
              }
            />
          </Card>
        </section>

        <section className="mt-8">
          <GroupLabel>Session Preferences</GroupLabel>
          <Card>
            <Row
              icon={ScanLine}
              label="Reduced Motion"
              trailing={
                <Toggle label="Reduced Motion" checked={reducedMotion} onChange={setReducedMotion} />
              }
            />
            <Row
              icon={Timer}
              label="Rest Duration"
              onClick={cycleRest}
              trailing={
                <span className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{REST_OPTIONS[restIndex]}</span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                </span>
              }
            />
          </Card>
        </section>

        <section className="mt-8">
          <GroupLabel>Subscription</GroupLabel>
          <Card>
            <Row
              icon={CreditCard}
              label="Manage Plan"
              onClick={() => alert("Manage subscription plan")}
              trailing={<ExternalLink className="size-5 text-muted-foreground" aria-hidden="true" />}
            />
          </Card>
        </section>

        <section className="mt-8">
          <GroupLabel>Data &amp; Privacy</GroupLabel>
          <Card>
            <Row
              icon={ShieldCheck}
              label="Privacy Center"
              onClick={() => alert("Open Privacy Center")}
              trailing={<ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />}
            />
            <Row
              icon={Download}
              label="Export Training Data"
              onClick={() => alert("Exporting training data...")}
              trailing={<ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />}
            />
          </Card>
        </section>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-destructive outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-5" aria-hidden="true" />
            Delete Account
          </button>
          <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Exam Arena Version 1.0.0
          </p>
        </div>
      </div>
    </DojoShell>
  );
}
