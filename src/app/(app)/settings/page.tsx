"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Phone,
  DollarSign,
  Laptop,
  HelpCircle,
  MessageSquare,
  LogOut,
  Clock,
  FileText,
  Award,
  Trophy,
  User,
  Bell,
  ChevronRight,
  Zap,
  Pencil,
  Shield,
  MapPin,
  CreditCard,
  Check,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePageMeta } from "@/hooks/use-page-meta";
import { AddPrepModal } from "@/components/learn/add-prep-modal";
import { PaywallModal } from "@/components/paywall/paywall-modal";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { cn } from "@/lib/utils";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

/* ------------------------------------------------------------------ */
/*  Reusable row item                                                   */
/* ------------------------------------------------------------------ */
type RowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  danger?: boolean;
  onClick?: () => void;
};

function Row({ icon, title, subtitle, danger, onClick }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-2xl border backdrop-blur-xl px-5 py-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.99]"
      style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
    >
      <span className={danger ? "text-[#ff5c5c]" : "text-primary"}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={danger ? "block text-[13px] font-semibold text-[#ff5c5c] tracking-[-0.01em]" : "block text-[13px] font-semibold text-foreground tracking-[-0.01em]"}>
          {title}
        </span>
        <span className="block text-[12px] text-muted-foreground/40 mt-0.5 font-normal">
          {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" />
    </button>
  );
}

function CollapsibleSection({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="px-4">
      {open ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between pt-6 pb-3 text-micro font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase"
          >
            {label}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 rotate-180" />
          </button>
          {children}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-6 flex w-full items-center justify-between rounded-2xl border backdrop-blur-xl px-5 py-4 transition-all hover:bg-white/[0.06] active:scale-[0.99]"
          style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
        >
          <span className="text-micro font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase">
            {label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 pt-6 pb-3 text-micro font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground/90">
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile header                                                      */
/* ------------------------------------------------------------------ */
function ProfileHeader({ name, initials, badge, onEdit }: { name: string; initials: string; badge: string; onEdit: () => void }) {
  return (
    <div className="relative flex flex-col items-center px-6 pt-6 pb-1 text-center">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.25) 0%, transparent 70%)" }} />
      <div className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
          <Settings size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">SETTINGS</span>
        </div>
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 backdrop-blur-sm">
          <span className="text-lg font-bold tracking-[-0.02em] text-primary">{initials}</span>
        </div>
        <button type="button" className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_12px_rgba(199,242,82,0.3)]">
          <Pencil className="h-2.5 w-2.5" />
        </button>
      </div>
      <h1 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-foreground">{name}</h1>
      <div className="mt-1.5 flex items-center gap-2 text-[11px]">
        <span className="flex items-center gap-1 font-semibold text-primary">
          <Shield className="h-3 w-3" /> {badge}
        </span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground/40 font-normal">Lv. 04</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground/40 font-normal">Mumbai, India</span>
      </div>
      <button type="button" onClick={onEdit} className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.05em] text-primary">
        <Pencil className="h-3 w-3" /> EDIT PROFILE
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat cards                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl border backdrop-blur-xl px-4 py-4" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
      <div className="flex items-center justify-between text-primary">
        {icon}
        <span className="text-[17px] font-bold tracking-[-0.02em] text-foreground">{value}</span>
      </div>
      <p className="mt-2.5 text-micro font-semibold tracking-[0.14em] text-muted-foreground/60 uppercase">{label}</p>
      <div className="mt-2 h-[2px] w-full rounded-full bg-white/[0.04]" />
    </div>
  );
}

function PerformanceOverview({ sessions, streak, rank, xp }: { sessions: string; streak: string; rank: string; xp: string }) {
  return (
    <div className="px-4">
      <SectionLabel>PERFORMANCE OVERVIEW</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<span className="text-lg">🎯</span>} value={sessions} label="Sessions" />
        <StatCard icon={<span className="text-lg">🔥</span>} value={streak} label="Streak" />
        <StatCard icon={<Trophy className="h-5 w-5" />} value={`#${rank}`} label="Rank" />
        <StatCard icon={<Zap className="h-5 w-5" />} value={xp} label="XP" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subscription card                                                   */
/* ------------------------------------------------------------------ */
function SubscriptionCard() {
  return (
    <div className="px-4">
      <SectionLabel>SUBSCRIPTION</SectionLabel>
      <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: "linear-gradient(135deg, rgba(199,242,82,0.04) 0%, rgba(255,255,255,0.03) 100%)" }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.3), transparent)" }} />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[14px] font-bold tracking-[-0.01em] text-foreground">Free Plan</p>
              <p className="text-[12px] text-muted-foreground/40 mt-0.5">$0 / month</p>
            </div>
          </div>
          <span className="rounded-full bg-white/[0.06] border border-white/[0.06] px-3 py-1 text-micro font-semibold tracking-[0.05em] text-muted-foreground/60">CURRENT</span>
        </div>
        <ul className="relative mt-4 space-y-2.5 text-[12px]">
          <li className="flex items-center gap-2.5 text-foreground/80 font-normal">
            <Check className="h-3.5 w-3.5 text-primary shrink-0" /> 5 sprints per day
          </li>
          <li className="flex items-center gap-2.5 text-foreground/80 font-normal">
            <Check className="h-3.5 w-3.5 text-primary shrink-0" /> Basic analytics
          </li>
          <li className="flex items-center gap-2.5 text-muted-foreground/30 line-through">
            <X className="h-3.5 w-3.5 shrink-0" /> Advanced analytics
          </li>
          <li className="flex items-center gap-2.5 text-muted-foreground/30 line-through">
            <X className="h-3.5 w-3.5 shrink-0" /> Unlimited sprints
          </li>
        </ul>
        <button type="button" className="relative mt-5 w-full rounded-full bg-gradient-to-r from-primary to-[#a8e62e] py-3.5 text-[13px] font-semibold tracking-[-0.01em] text-primary-foreground shadow-[0_0_20px_rgba(199,242,82,0.25)] transition-all hover:shadow-[0_0_30px_rgba(199,242,82,0.35)] active:scale-[0.98]">
          Upgrade to Pro — $9.99/mo
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  usePageMeta("Settings — Exam Arena");
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const firstName = useOnboardingStore((s) => s.firstName);
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);

  const [showAddPrep, setShowAddPrep] = useState(false);

  const prepExams = useMemo(() => {
    const others = activePreps.filter((id) => id !== targetExam && id in DOMAIN_LABELS);
    const list = [...others];
    if (targetExam && targetExam in DOMAIN_LABELS) list.unshift(targetExam);
    return list;
  }, [activePreps, targetExam]);

  const name = firstName || "Google User";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background pb-4 max-w-5xl mx-auto">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.2) 0%, transparent 70%)" }} />

      {/* Profile summary */}
      <ProfileHeader
        name={name}
        initials={initials || "UA"}
        badge="CHAMPION"
        onEdit={() => router.push("/settings/profile/edit")}
      />

      <div className="mt-2 space-y-4">
        <PerformanceOverview
          sessions="47"
          streak="12-Day"
          rank="47"
          xp="2,340"
        />
        <SubscriptionCard />

        {/* Prep / Membership */}
        <div className="px-4">
          <SectionLabel>PREP / MEMBERSHIP</SectionLabel>
          {prepExams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.06] backdrop-blur-xl py-8 text-center" style={{ background: GLASS_BG }}>
              <p className="text-[12px] text-muted-foreground/60 font-normal">No active preps yet</p>
            </div>
          ) : (
            <div className="rounded-2xl border backdrop-blur-xl p-4" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
              <div className="flex flex-wrap gap-2">
                {prepExams.map((id) => (
                  <span
                    key={id}
                    className={cn(
                      "text-[11px] font-semibold rounded-full px-3.5 py-1.5 transition-all",
                      id === targetExam
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-white/[0.04] text-foreground/80 border border-white/[0.06]",
                    )}
                  >
                    {DOMAIN_LABELS[id]}
                    {id === targetExam && <Check size={11} strokeWidth={3} className="ml-1 inline text-primary" />}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAddPrep(true)}
            className="mt-3 w-full rounded-2xl border border-dashed border-primary/20 bg-primary/5 backdrop-blur-xl py-4 text-[13px] font-semibold text-primary transition-all hover:border-primary/35 hover:bg-primary/[0.08] active:scale-[0.98]"
          >
            + Add Prep
          </button>
        </div>

        {/* Activity & Records */}
        <CollapsibleSection label="ACTIVITY & RECORDS" defaultOpen>
          <div className="space-y-2.5">
            <Row icon={<Clock className="h-5 w-5" />} title="Past Sessions" subtitle="View your sprint history" onClick={() => router.push("/settings/history")} />
            <Row icon={<FileText className="h-5 w-5" />} title="Reports" subtitle="Performance analytics" onClick={() => router.push("/settings/reports")} />
            <Row icon={<Award className="h-5 w-5" />} title="Achievements" subtitle="3/6 unlocked" onClick={() => router.push("/settings/achievements")} />
            <Row icon={<Trophy className="h-5 w-5" />} title="Leaderboard" subtitle="See your ranking" onClick={() => router.push("/settings/leaderboard")} />
          </div>
        </CollapsibleSection>

        {/* Account Settings */}
        <CollapsibleSection label="ACCOUNT SETTINGS" defaultOpen>
          <div className="space-y-2.5">
            <Row icon={<User className="h-5 w-5" />} title="Personal Details" subtitle="Name, email, phone" onClick={() => router.push("/settings/profile/edit")} />
            <Row icon={<Bell className="h-5 w-5" />} title="Notification Preferences" subtitle="Push & reminders" onClick={() => router.push("/settings/notifications")} />
            <Row icon={<Calendar className="h-5 w-5" />} title="Class Calendar" subtitle="Schedule & planning" onClick={() => router.push("/settings/planner")} />
            <Row icon={<Phone className="h-5 w-5" />} title="Call Reminder" subtitle="Coming soon" />
            <Row icon={<DollarSign className="h-5 w-5" />} title="Payments" subtitle="Coming soon" />
            <Row icon={<Laptop className="h-5 w-5" />} title="Linked Devices" subtitle="Manage logged-in devices" onClick={() => router.push("/settings/linked-devices")} />
          </div>
        </CollapsibleSection>

        {/* Support */}
        <CollapsibleSection label="SUPPORT" defaultOpen>
          <div className="space-y-2.5">
            <Row icon={<HelpCircle className="h-5 w-5" />} title="Help Center" subtitle="Guides & tutorials" onClick={() => router.push("/settings/help")} />
            <Row icon={<MessageSquare className="h-5 w-5" />} title="FAQs" subtitle="Common questions" />
            <Row icon={<Phone className="h-5 w-5" />} title="Contact Support" subtitle="We're here to help" />
          </div>
        </CollapsibleSection>

        {/* Logout */}
        <div className="px-4">
          <Row icon={<LogOut className="h-5 w-5" />} title="Logout" subtitle="Sign out of your account" danger onClick={handleLogout} />
        </div>
      </div>

      {showAddPrep && <AddPrepModal onClose={() => setShowAddPrep(false)} />}
      <PaywallModal />
    </div>
  );
}
