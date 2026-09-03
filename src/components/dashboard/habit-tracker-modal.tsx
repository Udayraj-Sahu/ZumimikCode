"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X,
  ArrowLeft,
  Flame,
  Target,
  TrendingUp,
  Trophy,
  Plus,
  Check,
  Trash2,
  Zap,
  Calculator,
  BookOpen,
  CreditCard,
  Calendar,
  Dumbbell,
  Clock,
  Heart,
  Sparkles,
  Bell,
  BellOff,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHabitStore } from "@/stores/habit-store";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const GLASS_BG = "rgba(255,255,255,0.04)";
const VIOLET = "#34D399";
const VIOLET_DIM = "rgba(52,211,153,0.1)";
const VIOLET_GLOW = "rgba(52,211,153,0.3)";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Calculator, BookOpen, CreditCard, Target,
  Dumbbell, Clock, Heart, Flame, Calendar,
};

const COLOR_OPTIONS = [
  { color: "#C7F252", label: "Primary" },
  { color: "#22D3EE", label: "Cyan" },
  { color: "#A78BFA", label: "Violet" },
  { color: "#10B981", label: "Amber" },
  { color: "#FB7185", label: "Pink" },
  { color: "#34D399", label: "Emerald" },
];

const ICON_OPTIONS = [
  "Zap", "Calculator", "BookOpen", "CreditCard", "Target",
  "Dumbbell", "Clock", "Heart", "Flame", "Calendar",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const isNative = Capacitor.isNativePlatform();

async function requestNotificationPermission(): Promise<boolean> {
  if (isNative) {
    try {
      const perms = await LocalNotifications.checkPermissions();
      if (perms.display === "granted") return true;
      const req = await LocalNotifications.requestPermissions();
      return req.display === "granted";
    } catch {
      return false;
    }
  }
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

async function scheduleReminder(habitName: string, time: string) {
  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Habit Reminder",
            body: `Time to: ${habitName}`,
            id: Math.floor(Math.random() * 1000000),
            schedule: {
              on: { hour: Number(time.split(":")[0]), minute: Number(time.split(":")[1]) },
              allowWhileIdle: true,
            },
            extra: { habitId: habitName },
          },
        ],
      });
    } catch {
      /* notification scheduling failed silently */
    }
    return;
  }
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delay = target.getTime() - now.getTime();
  return setTimeout(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Habit Reminder", {
        body: `Time to: ${habitName}`,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: `habit-${habitName}`,
      });
    }
  }, delay);
}

async function cancelReminder(habitName: string) {
  if (!isNative) return;
  try {
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications
      .filter((n) => n.extra?.habitId === habitName)
      .map((n) => n.id);
    if (ids.length > 0) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
  } catch {
    /* ignore */
  }
}

type Props = { onClose: () => void };

export function HabitTrackerModal({ onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Zap");
  const [newColor, setNewColor] = useState("#C7F252");
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [draftTime, setDraftTime] = useState("08:00");
  const [notifsEnabled, setNotifsEnabled] = useState(false);

  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const toggleLog = useHabitStore((s) => s.toggleLog);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const addHabit = useHabitStore((s) => s.addHabit);
  const setReminder = useHabitStore((s) => s.setReminder);

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const today = useMemo(() => todayStr(), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let enabled = false;
      if (isNative) {
        try {
          const perms = await LocalNotifications.checkPermissions();
          enabled = perms.display === "granted";
        } catch {
          enabled = false;
        }
      } else if ("Notification" in window) {
        enabled = Notification.permission === "granted";
      }
      if (mounted) setNotifsEnabled(enabled);
    })();
    return () => { mounted = false; };
  }, []);

  const todayLogIds = useMemo(() => {
    return new Set(logs.filter((l) => l.date === today && l.completed).map((l) => l.habitId));
  }, [logs, today]);

  const habitsWithToday = useMemo(() => {
    return habits.map((h) => {
      const todayCompleted = todayLogIds.has(h.id);
      let streak = 0;
      const d = new Date();
      for (let i = 0; i < 365; i++) {
        const ds = d.toISOString().split("T")[0];
        const found = logs.some((l) => l.habitId === h.id && l.date === ds && l.completed);
        if (found) streak++;
        else if (i > 0) break;
        d.setDate(d.getDate() - 1);
      }
      return { ...h, todayCompleted, streak };
    });
  }, [habits, logs, todayLogIds]);

  const stats = useMemo(() => {
    const completed = logs.filter((l) => l.completed);
    const dates = new Set(completed.map((l) => l.date));
    let bestStreak = 0;
    let current = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split("T")[0];
      if (dates.has(ds)) { current++; bestStreak = Math.max(bestStreak, current); }
      else if (i > 0) current = 0;
      d.setDate(d.getDate() - 1);
    }
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const recent = completed.filter((l) => l.date >= thirtyAgo.toISOString().split("T")[0]);
    const expectedMax = habits.length * 30;
    const completionRate = expectedMax > 0 ? Math.min(100, Math.round((recent.length / expectedMax) * 100)) : 0;
    return { currentStreak: current, bestStreak, totalCompletions: completed.length, completionRate };
  }, [logs, habits.length]);

  const monthLogs = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
    const byDate: Record<string, number> = {};
    logs.filter((l) => l.date.startsWith(prefix) && l.completed).forEach((l) => {
      byDate[l.date] = (byDate[l.date] || 0) + 1;
    });
    return byDate;
  }, [logs, calYear, calMonth]);

  useEffect(() => {
    if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    if (contentRef.current) gsap.fromTo(contentRef.current, { y: "100%" }, { y: "0%", duration: 0.35, ease: "power3.out" });
  }, []);

  const handleClose = useCallback(() => {
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    if (contentRef.current) gsap.to(contentRef.current, { y: "100%", duration: 0.3, ease: "power3.in", onComplete: onClose });
  }, [onClose]);

  const handleAddHabit = useCallback(() => {
    if (!newName.trim()) return;
    addHabit(newName.trim(), newIcon, newColor);
    setNewName(""); setNewIcon("Zap"); setNewColor("#C7F252"); setShowAdd(false);
  }, [newName, newIcon, newColor, addHabit]);

  const handleToggleReminder = useCallback(async (habitId: string, current: string | undefined, habitName: string) => {
    if (current) { setReminder(habitId, undefined); await cancelReminder(habitName); setEditingReminder(null); return; }
    if (!notifsEnabled) {
      const granted = await requestNotificationPermission();
      setNotifsEnabled(granted);
      if (!granted) return;
    }
    setDraftTime(current ?? "08:00");
    setEditingReminder(habitId);
  }, [notifsEnabled, setReminder]);

  const handleSetTime = useCallback(async (habitId: string, time: string, habitName: string) => {
    setReminder(habitId, time);
    await scheduleReminder(habitName, time);
    setEditingReminder(null);
  }, [setReminder]);

  const calDays = getDaysInMonth(calYear, calMonth);
  const calFirstDay = getFirstDayOfWeek(calYear, calMonth);
  const todayDate = new Date();
  const isCurrentMonth = calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth();
  const monthName = new Date(calYear, calMonth).toLocaleString("en-US", { month: "long", year: "numeric" });
  const completedToday = habitsWithToday.filter((h) => h.todayCompleted).length;
  const totalHabits = habitsWithToday.length;
  const todayPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const statCards = [
    { icon: Flame, label: "STREAK", value: `${stats.currentStreak}d`, color: VIOLET, bg: VIOLET_DIM },
    { icon: Target, label: "DONE", value: `${stats.totalCompletions}`, color: "#22D3EE", bg: "rgba(34,211,238,0.08)" },
    { icon: TrendingUp, label: "RATE", value: `${stats.completionRate}%`, color: "#34D399", bg: "rgba(52,211,153,0.08)" },
    { icon: Trophy, label: "BEST", value: `${stats.bestStreak}d`, color: "#10B981", bg: "rgba(245,158,11,0.08)" },
  ];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: "linear-gradient(180deg, #111116 0%, #0d0d0d 30%)",
          boxShadow: "0 -8px 60px rgba(52,211,153,0.12), 0 0 1px rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Gradient glow behind header */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: "linear-gradient(180deg, #111116ee 0%, #111116cc 100%)", backdropFilter: "blur(20px)" }}>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-9 place-items-center rounded-xl text-muted-foreground/50 transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: VIOLET_DIM, border: `1px solid ${VIOLET_GLOW}` }}>
            <Sparkles size={10} style={{ color: VIOLET }} />
            <span className="text-[10px] font-semibold tracking-[0.22em]" style={{ color: VIOLET }}>DAILY HABITS</span>
          </div>
          <button
            type="button"
            onClick={async () => { const g = await requestNotificationPermission(); setNotifsEnabled(g); }}
            className="grid size-9 place-items-center rounded-xl transition-colors hover:bg-white/5"
            title="Enable notifications"
          >
            {notifsEnabled ? <Bell size={16} style={{ color: VIOLET }} /> : <BellOff size={16} className="text-muted-foreground/40" />}
          </button>
        </div>

        <div className="px-5 pb-6 pt-2 space-y-5">
          {/* Today's circular progress + stats */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="92" height="92" viewBox="0 0 92 92">
                <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="6" />
                <circle
                  cx="46" cy="46" r="40" fill="none" stroke={VIOLET} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - todayPct / 100)}`}
                  transform="rotate(-90 46 46)"
                  className="transition-all duration-700"
                  style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.4))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-foreground leading-none">{completedToday}</span>
                <span className="text-[9px] text-muted-foreground/40 font-semibold mt-0.5">/ {totalHabits}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: s.bg, border: `1px solid ${s.color}15` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon size={11} style={{ color: s.color }} />
                    <span className="text-[8px] text-muted-foreground/50 font-bold tracking-wider">{s.label}</span>
                  </div>
                  <p className="text-[15px] font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Heatmap */}
          <div className="rounded-3xl p-4" style={{ background: GLASS_BG, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else setCalMonth((m) => m - 1); }} className="text-muted-foreground/40 hover:text-foreground transition-colors text-[16px] font-bold px-2 py-1 rounded-lg hover:bg-white/5">
                ‹
              </button>
              <span className="text-[12px] font-bold text-foreground/80 tracking-wide">{monthName}</span>
              <button type="button" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else setCalMonth((m) => m + 1); }} className="text-muted-foreground/40 hover:text-foreground transition-colors text-[16px] font-bold px-2 py-1 rounded-lg hover:bg-white/5">
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[9px] font-semibold text-muted-foreground/30 tracking-wider">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calFirstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: calDays }).map((_, i) => {
                const day = i + 1;
                const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const count = monthLogs[ds] || 0;
                const pct = totalHabits > 0 ? count / totalHabits : 0;
                const isToday = isCurrentMonth && day === todayDate.getDate();
                const isFuture = isCurrentMonth && day > todayDate.getDate();
                let bg = "rgba(255,255,255,0.025)";
                let tc = "rgba(255,255,255,0.18)";
                if (!isFuture && count > 0) {
                  if (pct >= 1) { bg = "rgba(52,211,153,0.5)"; tc = "#fff"; }
                  else if (pct >= 0.5) { bg = "rgba(52,211,153,0.25)"; tc = "rgba(255,255,255,0.75)"; }
                  else { bg = "rgba(52,211,153,0.1)"; tc = "rgba(255,255,255,0.4)"; }
                }
                if (isFuture) bg = "rgba(255,255,255,0.012)";
                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square rounded-[4px] flex items-center justify-center text-[10px] font-medium transition-all duration-300",
                      isToday && "ring-1 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
                    )}
                    style={{ background: bg, color: tc, ...(isToday ? { ringColor: VIOLET } : {}) }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Habits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                TODAY — {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${todayPct}%`, background: `linear-gradient(90deg, ${VIOLET}, #10B981)` }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: VIOLET }}>{todayPct}%</span>
              </div>
            </div>
            <div className="space-y-2">
              {habitsWithToday.map((h) => {
                const IconComp = ICON_MAP[h.icon] || Zap;
                const isEditing = editingReminder === h.id;
                return (
                  <div key={h.id} className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => toggleLog(h.id)}
                      className={cn(
                        "group w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 text-left active:scale-[0.98]",
                        h.todayCompleted
                          ? "border-transparent"
                          : "border-white/[0.06] hover:border-white/[0.12]",
                      )}
                      style={h.todayCompleted
                        ? { background: `linear-gradient(135deg, ${VIOLET_DIM}, rgba(52,211,153,0.06))`, border: `1px solid ${VIOLET_GLOW}` }
                        : { background: GLASS_BG }}
                    >
                      <div
                        className={cn(
                          "shrink-0 size-9 rounded-xl flex items-center justify-center transition-all duration-200",
                          h.todayCompleted ? "text-[#0A0C0A]" : "border bg-white/[0.03]",
                        )}
                        style={h.todayCompleted
                          ? { background: `linear-gradient(135deg, ${VIOLET}, #10B981)`, boxShadow: `0 0 12px ${VIOLET_GLOW}` }
                          : { borderColor: `${h.color}25` }}
                      >
                        {h.todayCompleted ? <Check size={15} strokeWidth={3} /> : <IconComp size={14} style={{ color: h.color }} className="opacity-50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[13px] font-semibold truncate transition-colors", h.todayCompleted ? "text-foreground" : "text-foreground/55")}>{h.name}</p>
                        <p className="text-[10px] text-muted-foreground/25 mt-0.5">{h.category === "auto" ? "Auto-tracked" : "Manual"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {h.streak > 0 && (
                          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ background: `${h.color}10` }}>
                            <Flame size={10} style={{ color: h.color }} />
                            <span className="text-[10px] font-bold" style={{ color: h.color }}>{h.streak}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleReminder(h.id, h.reminderTime, h.name); }}
                          className={cn(
                            "size-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                            h.reminderTime ? "bg-[rgba(52,211,153,0.12)]" : "text-muted-foreground/20 hover:text-muted-foreground/50 hover:bg-white/5",
                          )}
                          style={h.reminderTime ? { color: VIOLET } : undefined}
                          title={h.reminderTime ? `Reminder at ${h.reminderTime}` : "Set reminder"}
                        >
                          {h.reminderTime ? <Bell size={12} /> : <BellOff size={12} />}
                        </button>
                        {h.category === "manual" && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeHabit(h.id); }}
                            className="size-7 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground/25 hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Remove habit"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </button>

                    {isEditing && (
                      <div className="mx-2 rounded-2xl px-4 py-4 space-y-3" style={{ background: VIOLET_DIM, border: `1px solid ${VIOLET_GLOW}` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="grid size-8 place-items-center rounded-xl" style={{ background: "rgba(52,211,153,0.15)" }}>
                              <Clock size={14} style={{ color: VIOLET }} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: `${VIOLET}cc` }}>
                              Daily Reminder
                            </p>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setEditingReminder(null); }} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-3 rounded-xl py-3 border border-white/[0.06] bg-black/20">
                          <Clock size={16} style={{ color: VIOLET }} />
                          <input
                            type="time"
                            value={draftTime}
                            onChange={(e) => { if (e.target.value) setDraftTime(e.target.value); }}
                            className="bg-transparent border-none text-[22px] font-bold tracking-wider text-foreground font-mono outline-none [color-scheme:dark] cursor-pointer text-center w-[130px]"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Morning", time: "08:00" },
                            { label: "Afternoon", time: "13:00" },
                            { label: "Evening", time: "18:00" },
                          ].map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDraftTime(p.time); }}
                              className={cn(
                                "rounded-xl py-2 text-[11px] font-semibold transition-all border",
                                draftTime === p.time
                                  ? "border-[rgba(52,211,153,0.5)] bg-[rgba(52,211,153,0.15)]"
                                  : "border-white/[0.06] bg-white/[0.03] text-muted-foreground/60 hover:bg-white/[0.07]",
                              )}
                              style={draftTime === p.time ? { color: VIOLET } : undefined}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetTime(h.id, draftTime, h.name)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all active:scale-[0.98]"
                          style={{ background: `linear-gradient(135deg, ${VIOLET}, #10B981)`, boxShadow: `0 0 14px ${VIOLET_GLOW}` }}
                        >
                          <Bell size={13} /> Set reminder
                        </button>
                      </div>
                    )}

                    {!isEditing && h.reminderTime && (
                      <div className="flex items-center gap-1.5 mx-6">
                        <div className="size-1 rounded-full animate-pulse" style={{ background: VIOLET }} />
                        <span className="text-[10px] font-medium" style={{ color: `${VIOLET}99` }}>Reminds at {h.reminderTime}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Habit */}
          {showAdd ? (
            <div className="rounded-3xl p-4 space-y-3" style={{ background: VIOLET_DIM, border: `1px solid ${VIOLET_GLOW}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: `${VIOLET}cc` }}>NEW HABIT</p>
                <button type="button" onClick={() => setShowAdd(false)} className="text-muted-foreground/40 hover:text-foreground transition-colors"><X size={14} /></button>
              </div>
              <input
                type="text" placeholder="Habit name..." value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddHabit(); }} autoFocus
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-[rgba(52,211,153,0.3)] transition-colors"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/40 font-semibold shrink-0">ICON</span>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map((iconName) => {
                    const IC = ICON_MAP[iconName] || Zap;
                    return (
                      <button key={iconName} type="button" onClick={() => setNewIcon(iconName)}
                        className={cn("size-8 rounded-lg flex items-center justify-center transition-all", newIcon === iconName ? "bg-[rgba(52,211,153,0.15)]" : "bg-white/[0.04] text-muted-foreground/40 hover:bg-white/[0.08]")}
                        style={newIcon === iconName ? { color: VIOLET } : undefined}
                      >
                        <IC size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/40 font-semibold shrink-0">COLOR</span>
                <div className="flex gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c.color} type="button" onClick={() => setNewColor(c.color)}
                      className={cn("size-6 rounded-full transition-all border-2", newColor === c.color ? "border-white scale-110" : "border-transparent hover:scale-105")}
                      style={{ background: c.color }}
                    />
                  ))}
                </div>
              </div>
              <button type="button" onClick={handleAddHabit} disabled={!newName.trim()}
                className={cn("w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all", newName.trim() ? "text-[#0A0C0A]" : "bg-white/[0.06] text-muted-foreground/30 cursor-not-allowed")}
                style={newName.trim() ? { background: `linear-gradient(135deg, ${VIOLET}, #10B981)`, boxShadow: `0 0 16px ${VIOLET_GLOW}` } : undefined}
              >
                Add Habit
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-[13px] font-semibold transition-all hover:bg-[rgba(52,211,153,0.04)]"
              style={{ borderColor: "rgba(52,211,153,0.15)", color: `${VIOLET}80` }}
            >
              <Plus size={14} />
              Add Habit
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
