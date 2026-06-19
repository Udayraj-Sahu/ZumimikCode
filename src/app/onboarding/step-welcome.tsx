"use client";

import { useState, useRef, useCallback } from "react";
import { Globe, Smartphone } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { AuthPanel } from "@/components/onboarding/auth-panel";

const DuelSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-48 h-36">
    <defs>
      <radialGradient id="duelL" cx="40%" cy="35%"><stop offset="0%" stopColor="#c8b8f8" /><stop offset="100%" stopColor="#7b4fcf" /></radialGradient>
      <radialGradient id="duelR" cx="40%" cy="35%"><stop offset="0%" stopColor="#a8c8ff" /><stop offset="100%" stopColor="#5060e8" /></radialGradient>
    </defs>
    <line x1="100" y1="12" x2="55" y2="108" stroke="#ffffff12" strokeWidth="1" />
    <line x1="100" y1="5" x2="145" y2="98" stroke="#C8FF5A18" strokeWidth="1" />
    <circle cx="135" cy="62" r="36" fill="url(#duelL)" opacity="0.85" />
    <text x="135" y="69" textAnchor="middle" fontSize="22" fill="#1a0a30" fontWeight="700">✦</text>
    <circle cx="65" cy="105" r="32" fill="url(#duelR)" opacity="0.85" />
    <text x="65" y="112" textAnchor="middle" fontSize="20" fill="#0a1040" fontWeight="700">✦</text>
    <text x="100" y="90" textAnchor="middle" fontSize="14" fill="#C8FF5A" fontWeight="800" letterSpacing="2">VS</text>
    <circle cx="148" cy="22" r="3" fill="#fff" opacity="0.45" />
    <circle cx="52" cy="20" r="2" fill="#fff" opacity="0.35" />
    <circle cx="170" cy="100" r="2" fill="#C8FF5A" opacity="0.35" />
  </svg>
);

const RiseSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-48 h-36">
    <defs>
      <radialGradient id="riseGold" cx="50%" cy="0%"><stop offset="0%" stopColor="#ffd970" /><stop offset="100%" stopColor="#e8a020" /></radialGradient>
      <radialGradient id="riseSilver" cx="50%" cy="0%"><stop offset="0%" stopColor="#e0e0f0" /><stop offset="100%" stopColor="#9090b0" /></radialGradient>
      <radialGradient id="riseBronze" cx="50%" cy="0%"><stop offset="0%" stopColor="#f0c0a0" /><stop offset="100%" stopColor="#c08050" /></radialGradient>
    </defs>
    <rect x="80" y="55" width="40" height="85" rx="4" fill="url(#riseGold)" />
    <text x="100" y="102" textAnchor="middle" fontSize="11" fill="#4a2a00" fontWeight="700">1</text>
    <rect x="44" y="88" width="32" height="52" rx="4" fill="url(#riseSilver)" opacity="0.85" />
    <text x="60" y="116" textAnchor="middle" fontSize="9" fill="#2a2a4a" fontWeight="700">2</text>
    <rect x="124" y="105" width="32" height="35" rx="4" fill="url(#riseBronze)" opacity="0.85" />
    <text x="140" y="126" textAnchor="middle" fontSize="9" fill="#4a2a1a" fontWeight="700">3</text>
    <text x="100" y="46" textAnchor="middle" fontSize="18">👑</text>
    <line x1="40" y1="145" x2="160" y2="145" stroke="#ffffff12" strokeWidth="1" />
    <circle cx="38" cy="82" r="2" fill="#C8FF5A" opacity="0.45" />
    <circle cx="162" cy="78" r="2" fill="#C8FF5A" opacity="0.35" />
  </svg>
);

const LeaguesSVG = () => (
  <svg width="180" height="150" viewBox="0 0 180 150" className="w-44 h-36">
    <defs>
      <radialGradient id="badgeGrad" cx="35%" cy="30%"><stop offset="0%" stopColor="#ffd970" /><stop offset="60%" stopColor="#e8a020" /><stop offset="100%" stopColor="#c06010" /></radialGradient>
    </defs>
    <polygon points="90,15 105,48 140,53 116,78 122,114 90,96 58,114 64,78 40,53 75,48" fill="url(#badgeGrad)" stroke="#f0c040" strokeWidth="1.5" />
    <text x="90" y="74" textAnchor="middle" fontSize="24" fill="#4a1a00" fontWeight="800">S</text>
    <text x="90" y="95" textAnchor="middle" fontSize="7" fill="#f0c040" fontWeight="600" letterSpacing="1">RANK</text>
    <circle cx="142" cy="20" r="3" fill="#fff" opacity="0.45" />
    <circle cx="35" cy="40" r="2" fill="#C8FF5A" opacity="0.45" />
    <circle cx="150" cy="95" r="2" fill="#ffd970" opacity="0.35" />
    <circle cx="30" cy="110" r="1.5" fill="#fff" opacity="0.25" />
    <line x1="30" y1="138" x2="150" y2="138" stroke="#ffffff10" strokeWidth="1" />
  </svg>
);

const DoomSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-48 h-36">
    <defs>
      <radialGradient id="brainGrad" cx="35%" cy="30%"><stop offset="0%" stopColor="#c8b8f8" /><stop offset="100%" stopColor="#7b4fcf" /></radialGradient>
      <radialGradient id="phoneGrad" cx="35%" cy="30%"><stop offset="0%" stopColor="#a0a0e8" /><stop offset="100%" stopColor="#604090" /></radialGradient>
    </defs>
    <g transform="translate(10, 20)">
      <circle cx="45" cy="55" r="30" fill="url(#brainGrad)" opacity="0.85" />
      <text x="45" y="62" textAnchor="middle" fontSize="22" fill="#1a0a30" fontWeight="700">∞</text>
    </g>
    <g transform="translate(95, 18) rotate(-15, 55, 55)">
      <rect x="10" y="15" width="90" height="92" rx="10" fill="url(#phoneGrad)" opacity="0.85" />
      <rect x="10" y="15" width="90" height="92" rx="10" fill="none" stroke="#8060c0" strokeWidth="1" />
      <rect x="22" y="26" width="30" height="60" rx="4" fill="#2a1a50" opacity="0.7" />
      <rect x="60" y="32" width="30" height="54" rx="4" fill="#2a1a50" opacity="0.7" />
      <circle cx="37" cy="56" r="7" fill="#ffffff12" />
      <polygon points="34,52 34,60 41,56" fill="#ffffff35" />
      <circle cx="75" cy="49" r="6" fill="#ffffff12" />
      <polygon points="73,45 73,53 79,49" fill="#ffffff35" />
    </g>
    <text x="95" y="140" textAnchor="middle" fontSize="11" fill="#C8FF5A" fontWeight="700" letterSpacing="1">VS</text>
    <circle cx="170" cy="15" r="2" fill="#C8FF5A" opacity="0.3" />
  </svg>
);

const PANELS = [
  { headline: "Duel to Begin", subtitle: "Real-time battles in math, memory & logic.", Hero: DuelSVG },
  { headline: "Win to Rise", subtitle: "Earn rating. Climb the leaderboard.", Hero: RiseSVG },
  { headline: "Leagues and Ranks", subtitle: "Rise up based on playtime and skill level.", Hero: LeaguesSVG },
  { headline: "Rip Doomscrolling", subtitle: "Choose brain-stimulating play.", Hero: DoomSVG },
];

type Props = { onNext: () => void };

export function StepWelcome({ onNext }: Props) {
  const setAuthData = useOnboardingStore((s) => s.setAuthData);
  const authLogin = useAuthStore((s) => s.login);

  const [panelIndex, setPanelIndex] = useState(0);
  const [phoneMode, setPhoneMode] = useState(false);
  const [offsetPct, setOffsetPct] = useState(0);
  const [transition, setTransition] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDiff = useRef(0);
  const isDragging = useRef(false);
  const containerWidth = useRef(1);

  const goToPanel = useCallback((i: number) => {
    const target = Math.max(0, Math.min(i, PANELS.length - 1));
    setPanelIndex(target);
    setTransition(true);
    setOffsetPct(-target * 100);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    containerWidth.current = containerRef.current?.offsetWidth || 1;
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchDiff.current = 0;
    setTransition(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    touchDiff.current = e.touches[0].clientX - touchStartX.current;
    setOffsetPct(-panelIndex * 100 + (touchDiff.current / containerWidth.current) * 100);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (Math.abs(touchDiff.current) > 50) {
      goToPanel(touchDiff.current < 0 ? panelIndex + 1 : panelIndex - 1);
    } else {
      goToPanel(panelIndex);
    }
    touchDiff.current = 0;
  };

  const advance = () => {
    if (panelIndex < PANELS.length - 1) {
      goToPanel(panelIndex + 1);
    }
  };

  const handleAuthSuccess = (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => {
    setAuthData(data);
    authLogin(data.phone ?? `${data.name}@google.com`, "mock-password");
    onNext();
  };

  if (phoneMode) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <button type="button" onClick={() => setPhoneMode(false)}
          className="self-start text-fluid-xs text-muted-foreground/50 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          &larr; Back
        </button>
        <AuthPanel onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-1.5 px-1">
        {PANELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= panelIndex ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={advance}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${offsetPct}%)`,
            transition: transition ? "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          }}
        >
          {PANELS.map((panel, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 flex flex-col items-center gap-3 py-4 px-2 select-none"
              data-step-el
            >
              <panel.Hero />
              <h2 className="text-fluid-2xl font-black text-foreground text-center uppercase tracking-wide">{panel.headline}</h2>
              <p className="text-fluid-xs text-muted-foreground/60 text-center max-w-xs uppercase tracking-[0.08em] leading-relaxed">{panel.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        <button type="button" onClick={handleAuthSuccess.bind(null, { name: "Google User", authMethod: "google" })}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
          data-step-el
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <Globe size={18} className="text-muted-foreground" />
          Continue with Google
        </button>
        <div className="flex items-center gap-3 text-fluid-xs text-muted-foreground/30 px-2">
          <span className="flex-1 h-px bg-border" />
          <span>— OR —</span>
          <span className="flex-1 h-px bg-border" />
        </div>
        <button type="button" onClick={() => setPhoneMode(true)}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
          data-step-el
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <Smartphone size={18} className="text-muted-foreground" />
          Continue with Phone Number
        </button>
        <button type="button" onClick={onNext}
          className="w-full text-center text-fluid-xs text-muted-foreground/40 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded py-1 mt-1"
          data-step-el
        >
          Skip for now
        </button>
        <p className="text-center text-[10px] text-muted-foreground/25 leading-relaxed px-2">
          By continuing, you agree to our{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/50">Terms of Service</span>{" "}
          and{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/50">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
