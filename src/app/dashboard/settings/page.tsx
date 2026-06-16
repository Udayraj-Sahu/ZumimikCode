"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  User,
  Mail,
  Bell,
  Clock,
  Timer,
  CreditCard,
  ShieldCheck,
  Download,
  ChevronRight,
  ExternalLink,
  Settings,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
          "inline-block size-5 transform rounded-full bg-background shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-fluid-sm font-bold uppercase tracking-widest text-primary">{children}</h2>
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
      <span className="flex-1 text-fluid-base font-medium text-foreground truncate">{label}</span>
      {trailing ? <span className="shrink-0 flex items-center gap-2">{trailing}</span> : null}
    </Tag>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border/40 bg-card">
      {children}
    </div>
  );
}

function DeleteModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && overlayRef.current && dialogRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" },
      );
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" },
      );
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-title" className="text-fluid-lg font-bold text-foreground">Delete Account</h3>
        <p className="mt-2 text-fluid-sm text-muted-foreground">
          This action cannot be undone. All your training data, streaks, and achievements will be permanently deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-muted px-4 py-2 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-fluid-sm font-bold uppercase tracking-widest text-destructive-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const REST_OPTIONS = ["30s", "60s", "90s", "120s"];

export default function SettingsPage() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);
  const [restIndex, setRestIndex] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cycleRest = () => setRestIndex((i) => (i + 1) % REST_OPTIONS.length);

  const handleDeleteConfirm = () => {
    setDeleteOpen(false);
  };

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.08 + i * 0.08, ease: "power2.out" });
  }, []);

  return (
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="pt-6 pb-4 border-b border-border mb-6">
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Settings className="size-6 text-primary" aria-hidden="true" />
            <h1 className="text-fluid-2xl font-bold tracking-tight">Settings</h1>
          </div>
        </div>

        <section
          ref={animateSection} data-section-index={0}
          className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-[0_0_40px_-10px] shadow-primary/60"
        >
          <h3 className="text-fluid-2xl font-extrabold uppercase italic tracking-tight">Unlock Pro</h3>
          <p className="mt-1 text-fluid-sm font-semibold uppercase tracking-widest opacity-80">
            Accelerate Your Evolution
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-fluid-2xl font-extrabold italic">$9.99/MO</span>
            <button
              type="button"
              onClick={() => router.push("/dashboard/configure-sprint")}
              className="rounded-lg bg-background/90 px-5 py-3 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring"
            >
              Upgrade Now
            </button>
          </div>
        </section>

        <section
          ref={animateSection} data-section-index={1}
          className="mt-8"
        >
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
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-fluid-base text-muted-foreground truncate max-w-[140px] sm:max-w-none">user@examarena.com</span>
                  <ChevronRight className="size-5 text-muted-foreground shrink-0" aria-hidden="true" />
                </span>
              }
            />
          </Card>
        </section>

        <section
          ref={animateSection} data-section-index={2}
          className="mt-8"
        >
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

        <section
          ref={animateSection} data-section-index={3}
          className="mt-8"
        >
          <GroupLabel>Session</GroupLabel>
          <Card>
            <Row
              icon={Timer}
              label="Rest Duration"
              onClick={cycleRest}
              trailing={
                <span className="flex items-center gap-2">
                  <span className="text-fluid-base text-muted-foreground">{REST_OPTIONS[restIndex]}</span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                </span>
              }
            />
          </Card>
        </section>

        <section
          ref={animateSection} data-section-index={4}
          className="mt-8"
        >
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
            <Row
              icon={CreditCard}
              label="Manage Plan"
              onClick={() => alert("Manage subscription plan")}
              trailing={<ExternalLink className="size-5 text-muted-foreground" aria-hidden="true" />}
            />
          </Card>
        </section>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 text-fluid-base font-bold uppercase tracking-widest text-destructive outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-5" aria-hidden="true" />
            Delete Account
          </button>
          <p className="text-center text-fluid-sm uppercase tracking-widest text-muted-foreground/60">
            Exam Arena Version 1.0.0
          </p>
        </div>

        <DeleteModal
          open={deleteOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteOpen(false)}
        />
      </div>
  );
}
