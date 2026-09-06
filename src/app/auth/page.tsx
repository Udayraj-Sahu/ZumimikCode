"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Check,
  Copy,
  Lock,
  MonitorSmartphone,
  Smartphone,
  Swords,
  QrCode,
  Loader2,
  RefreshCw,
  Timer,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  useCreatePairingSession,
  usePollPairingStatus,
} from "@/hooks/queries/use-pairing";
import type { PairingStatus } from "@/lib/types/pairing";

const ACCENT = "#C7F252";
const POLL_INTERVAL_MS = 2500;
const SESSION_TTL_MS = 120_000;

function hash8(v: string): number {
  let h = 2166136261;
  for (let i = 0; i < v.length; i++) {
    h ^= v.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 256;
}

function QrGrid({ token }: { token: string }) {
  const grid = useMemo(() => {
    const size = 9;
    const cells: boolean[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const onEdge = r === 0 || r === size - 1 || c === 0 || c === size - 1;
        cells.push(onEdge || hash8(`${token}:${r}:${c}`) % 3 !== 0);
      }
    }
    return cells;
  }, [token]);

  return (
    <div className="grid grid-cols-9 gap-[3px] p-3 rounded-2xl bg-white">
      {grid.map((on, i) => (
        <div
          key={i}
          className="aspect-square rounded-[2px]"
          style={{ background: on ? "#111" : "rgba(0,0,0,0.06)" }}
        />
      ))}
    </div>
  );
}

function countdownTo(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const secs = Math.max(0, Math.floor(diff / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AuthPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);
  const router = useRouter();

  const createSession = useCreatePairingSession();
  const pollStatus = usePollPairingStatus();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<PairingStatus>("pending");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bootstrapped = useRef(false);

  useEffect(() => {
    if (isAuthenticated) return;
    const tl = gsap.fromTo(
      document.getElementById("auth-root"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
    return () => { tl.kill(); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  // Create a new pairing session on mount (or when retrying)
  const boot = useRef<(() => void) | null>(null);
  boot.current = () => {
    setCreateError(null);
    setAlreadyApproved(false);
    createSession.mutate(undefined, {
      onSuccess: (session) => {
        setSessionId(session.sessionId);
        setCode(session.code);
        setStatus(session.status);
        setExpiresAt(session.expiresAt);
        setNow(Date.now());
      },
      onError: () => setCreateError("Could not start a pairing session. Please try again."),
    });
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    boot.current?.();
  }, []);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll the session until approved or expired
  useEffect(() => {
    if (!sessionId) return;
    if (pollingRef.current) clearInterval(pollingRef.current);

    const tick = async () => {
      try {
        const session = await pollStatus.mutateAsync(sessionId);
        setStatus(session.status);
        setExpiresAt(session.expiresAt);
        if (session.status === "approved") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setAlreadyApproved(true);
        } else if (session.status === "expired") {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // transient poll error â€” keep polling
      }
    };
    tick();
    pollingRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When approved, finish login on the web side
  useEffect(() => {
    if (alreadyApproved && sessionId) {
      setToken("web-session-login");
      setRefreshToken("web-session-refresh");
    }
  }, [alreadyApproved, sessionId, setToken, setRefreshToken]);

  const expired = status === "expired" || (!!expiresAt && new Date(expiresAt).getTime() - Date.now() <= 0);
  const showScannerHint = status !== "approved" && !expired && !createError;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main id="auth-root" className="relative flex min-h-dvh items-center justify-center bg-background overflow-hidden px-6" style={{ opacity: 0 }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #C7F252 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #22D3EE 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Swords size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-[0.15em] text-foreground">EXAM ARENA</h1>
            <span className="text-[9px] font-bold tracking-[0.3em] text-primary/60">WEB LOGIN</span>
          </div>
        </div>

        <div className="rounded-3xl border backdrop-blur-xl p-6" style={{ borderColor: "rgb(var(--glass) / 0.08)", background: "linear-gradient(180deg, rgb(var(--glass) / 0.04), rgb(var(--glass) / 0.01))" }}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${ACCENT}1A` }}>
              <MonitorSmartphone size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">Link with the app</p>
              <p className="text-[10.5px] text-muted-foreground/45 font-normal">Use your phone to scan &amp; sign in</p>
            </div>
          </div>

          {createError ? (
            <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
              <p className="text-[13px] font-bold text-foreground">Could not start session</p>
              <p className="mt-1 text-[11px] text-muted-foreground/45 font-normal">{createError}</p>
              <button
                type="button"
                onClick={() => boot.current?.()}
                className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#0A0C0A] transition-all active:scale-95"
                style={{ background: "linear-gradient(90deg, #C7F252, #9fd42f)" }}
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : !showScannerHint && (status === "approved" || alreadyApproved) ? (
            <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
              <div className="grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(52,211,153,0.12)" }}>
                <Check size={24} className="text-[#34D399]" />
              </div>
              <p className="mt-3 text-[15px] font-bold text-foreground leading-tight">Linked successfully</p>
              <p className="mt-1 text-[11px] text-muted-foreground/45 font-normal">Redirecting to your dashboardâ€¦</p>
            </div>
          ) : expired ? (
            <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
              <div className="grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(255,92,92,0.12)" }}>
                <Timer size={24} className="text-[#ff5c5c]" />
              </div>
              <p className="mt-3 text-[15px] font-bold text-foreground leading-tight">Code expired</p>
              <p className="mt-1 text-[11px] text-muted-foreground/45 font-normal">This pairing code is no longer valid.</p>
              <button
                type="button"
                onClick={() => boot.current?.()}
                className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#0A0C0A] transition-all active:scale-95"
                style={{ background: "linear-gradient(90deg, #C7F252, #9fd42f)" }}
              >
                <RefreshCw size={13} /> Generate new code
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 flex justify-center">
                <div className="relative">
                  <QrGrid token={code || "PENDING"} />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "0 0 30px rgba(199,242,82,0.25) inset" }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button type="button" onClick={handleCopy} disabled={!code} className="flex items-center gap-1.5 rounded-full border border-glass/[0.08] bg-glass/[0.04] px-4 py-2 text-[11px] font-bold text-foreground/70 transition-all hover:bg-glass/[0.07] active:scale-95 disabled:opacity-50">
                  {copied ? <Check size={13} className="text-[#34D399]" /> : <Copy size={13} />}
                  {copied ? "Code copied" : code ? `Code: ${code}` : "Generating codeâ€¦"}
                </button>
              </div>

              <ol className="mt-5 space-y-3">
                {[
                  { icon: Smartphone, text: "Open Exam Arena on your phone" },
                  { icon: QrCode, text: "Tap â€œScan to login on webâ€ on your device" },
                  { icon: Check, text: "Confirm the pairing to continue" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <div className="grid size-7 place-items-center rounded-lg" style={{ background: "rgb(var(--glass) / 0.05)" }}>
                        <Icon size={13} className="text-foreground/60" />
                      </div>
                      <span className="flex-1 text-[12px] text-muted-foreground/70 font-medium">{s.text}</span>
                      {i === 0 && status === "scanned" && (
                        <span className="flex items-center gap-1 text-micro font-bold text-[#34D399]">
                          <Loader2 size={11} className="animate-spin" /> Device detected
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          {showScannerHint && (
            <div className="mt-5 flex items-center justify-center gap-2 text-micro text-muted-foreground/40">
              <Timer size={11} />
              Code expires in {expiresAt ? countdownTo(expiresAt) : "--:--"}
            </div>
          )}

          {showScannerHint && status === "pending" && (
            <button
              type="button"
              onClick={() => boot.current?.()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[12px] font-bold tracking-[0.02em] text-[#0A0C0A] transition-all active:scale-95"
              style={{ background: "linear-gradient(90deg, #C7F252, #9fd42f)" }}
            >
              <RefreshCw size={15} /> New code
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-micro text-muted-foreground/60">
            <Lock size={11} />
            End-to-end secured pairing Â· session expires in ~2 min
          </div>
        </div>

        <p className="mt-5 text-center text-[10.5px] text-muted-foreground/60 leading-relaxed">
          Scan the QR from your phone&apos;s Exam Arena app (<span className="text-muted-foreground/50">Scan to login on web</span>) to link this browser.<br />
          <span className="text-muted-foreground/40">In preview, the flow is simulated end-to-end.</span>
        </p>
      </div>
    </main>
  );
}
