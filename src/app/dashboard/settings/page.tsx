"use client";

import { useState } from "react";
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
  Star,
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
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePageMeta } from "@/hooks/use-page-meta";

/* ------------------------------------------------------------------ */
/*  Reusable row item                                                  */
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
      className="w-full flex items-center gap-4 rounded-2xl bg-card px-5 py-4 text-left transition-colors hover:bg-accent/30 active:scale-[0.99]"
    >
      <span className={danger ? "text-[#ff5c5c]" : "text-primary"}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={danger ? "block text-[15px] font-semibold text-[#ff5c5c]" : "block text-[15px] font-semibold text-foreground"}>
          {title}
        </span>
        <span className="block text-[13px] text-muted-foreground/60 mt-0.5">
          {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 pt-6 pb-3 text-[11px] font-bold tracking-[0.12em] text-muted-foreground/50">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile header                                                      */
/* ------------------------------------------------------------------ */
function ProfileHeader({ name, initials, badge, rank, sessions }: { name: string; initials: string; badge: string; rank: string; sessions: string }) {
  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
          <span className="text-2xl font-bold tracking-wide text-primary">{initials}</span>
        </div>
        <button type="button" className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <h1 className="mt-4 text-xl font-bold text-foreground">{name}</h1>
      <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold">
        <span className="flex items-center gap-1 text-primary">
          <Shield className="h-3.5 w-3.5" /> {badge}
        </span>
        <span className="text-muted-foreground/60">Lv. 04</span>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground/60">Rank #{rank} &middot; {sessions} sessions</p>
      <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground/60">
        <MapPin className="h-3.5 w-3.5" /> Mumbai, India
      </p>
      <button type="button" className="mt-3 flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-primary">
        <Pencil className="h-3.5 w-3.5" /> EDIT PROFILE
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat cards                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-card px-4 py-4">
      <div className="flex items-center justify-between text-primary">
        {icon}
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
      <p className="mt-3 text-[11px] font-bold tracking-wide text-muted-foreground/50">{label.toUpperCase()}</p>
      <div className="mt-2 h-[3px] w-full rounded-full bg-white/5" />
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
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[15px] font-bold text-foreground">Free Plan</p>
              <p className="text-[13px] text-muted-foreground/60">$0 / month</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-foreground">CURRENT</span>
        </div>
        <ul className="mt-4 space-y-2 text-[13px]">
          <li className="flex items-center gap-2 text-foreground">
            <Check className="h-3.5 w-3.5 text-primary" /> 5 sprints per day
          </li>
          <li className="flex items-center gap-2 text-foreground">
            <Check className="h-3.5 w-3.5 text-primary" /> Basic analytics
          </li>
          <li className="flex items-center gap-2 text-muted-foreground/40 line-through">
            <X className="h-3.5 w-3.5" /> Advanced analytics
          </li>
          <li className="flex items-center gap-2 text-muted-foreground/40 line-through">
            <X className="h-3.5 w-3.5" /> Unlimited sprints
          </li>
        </ul>
        <button type="button" className="mt-5 w-full rounded-full bg-primary py-3.5 text-[14px] font-bold text-primary-foreground transition-transform active:scale-[0.98]">
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

  const name = firstName || "Google User";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Profile summary */}
      <ProfileHeader
        name={name}
        initials={initials || "UA"}
        badge="CHAMPION"
        rank="47"
        sessions="47"
      />

      <div className="mt-2 space-y-6">
        <PerformanceOverview
          sessions="47"
          streak="12-Day Streak"
          rank="47"
          xp="2,340"
        />
        <SubscriptionCard />

        {/* Prep / Membership */}
        <div className="px-4">
          <SectionLabel>PREP / MEMBERSHIP</SectionLabel>
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
            <p className="text-[13px] text-muted-foreground/60">No active preps yet</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/learn")}
            className="mt-3 w-full rounded-2xl border border-dashed border-white/15 py-4 text-[14px] font-bold text-foreground"
          >
            + Add Prep
          </button>
        </div>

        {/* Activity & Records */}
        <div className="px-4">
          <SectionLabel>ACTIVITY & RECORDS</SectionLabel>
          <div className="space-y-3">
            <Row icon={<Clock className="h-5 w-5" />} title="Past Sessions" subtitle="View your sprint history" onClick={() => router.push("/dashboard/history")} />
            <Row icon={<FileText className="h-5 w-5" />} title="Reports" subtitle="Performance analytics" onClick={() => router.push("/dashboard/reports")} />
            <Row icon={<Award className="h-5 w-5" />} title="Achievements" subtitle="3/6 unlocked" onClick={() => router.push("/dashboard/achievements")} />
            <Row icon={<Star className="h-5 w-5" />} title="Badges" subtitle="Collect them all" onClick={() => router.push("/dashboard/achievements")} />
            <Row icon={<Trophy className="h-5 w-5" />} title="Leaderboard" subtitle="See your ranking" onClick={() => router.push("/dashboard/leaderboard")} />
          </div>
        </div>

        {/* Account Settings */}
        <div className="px-4">
          <SectionLabel>ACCOUNT SETTINGS</SectionLabel>
          <div className="space-y-3">
            <Row icon={<User className="h-5 w-5" />} title="Personal Details" subtitle="Name, email, phone" onClick={() => router.push("/dashboard/profile/edit")} />
            <Row icon={<Bell className="h-5 w-5" />} title="Notification Preferences" subtitle="Push & reminders" onClick={() => router.push("/dashboard/notifications")} />
            <Row icon={<Calendar className="h-5 w-5" />} title="Class Calendar" subtitle="Schedule & planning" onClick={() => router.push("/dashboard/planner")} />
            <Row icon={<Phone className="h-5 w-5" />} title="Call Reminder" subtitle="Coming soon" />
            <Row icon={<DollarSign className="h-5 w-5" />} title="Payments" subtitle="Coming soon" />
            <Row icon={<Laptop className="h-5 w-5" />} title="Logged-in Devices" subtitle="Coming soon" />
          </div>
        </div>

        {/* Support */}
        <div className="px-4">
          <SectionLabel>SUPPORT</SectionLabel>
          <div className="space-y-3">
            <Row icon={<HelpCircle className="h-5 w-5" />} title="Help Center" subtitle="Guides & tutorials" onClick={() => router.push("/dashboard/help")} />
            <Row icon={<MessageSquare className="h-5 w-5" />} title="FAQs" subtitle="Common questions" />
            <Row icon={<Phone className="h-5 w-5" />} title="Contact Support" subtitle="We're here to help" />
          </div>
        </div>

        {/* Logout */}
        <div className="px-4">
          <Row icon={<LogOut className="h-5 w-5" />} title="Logout" subtitle="Sign out of your account" danger onClick={handleLogout} />
        </div>
      </div>
    </div>
  );
}
