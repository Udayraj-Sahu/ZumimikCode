"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const RadarDuelSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-full max-w-[340px] aspect-[4/3]">
    <defs>
      <radialGradient id="radarGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#C8FF5A" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#C8FF5A" stopOpacity="0" />
      </radialGradient>
      <pattern id="gridDot" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#ffffff08" />
      </pattern>
    </defs>
    <rect width="200" height="150" fill="url(#gridDot)" />
    <circle cx="100" cy="75" r="60" fill="none" stroke="#C8FF5A10" strokeWidth="0.5" strokeDasharray="2 8">
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="75" r="45" fill="none" stroke="#C8FF5A18" strokeWidth="0.6" strokeDasharray="3 6">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="75" r="30" fill="none" stroke="#C8FF5A25" strokeWidth="0.8" strokeDasharray="4 4">
      <animate attributeName="strokeDashoffset" values="0;-8" dur="3s" repeatCount="indefinite" />
    </circle>
    <polygon points="100,52 120,62 120,88 100,98 80,88 80,62" fill="none" stroke="#C8FF5A" strokeWidth="1" strokeDasharray="4 3" opacity="0.3">
      <animate attributeName="strokeDashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
    </polygon>
    <circle cx="100" cy="75" r="16" fill="url(#radarGlow)" />
    <circle cx="100" cy="75" r="3" fill="#C8FF5A" opacity="0.9">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <line x1="50" y1="75" x2="95" y2="75" stroke="#C8FF5A30" strokeWidth="0.8" strokeDasharray="3 3" />
    <line x1="105" y1="75" x2="150" y2="75" stroke="#3B82F630" strokeWidth="0.8" strokeDasharray="3 3" />
    <circle cx="50" cy="75" r="10" fill="none" stroke="#C8FF5A" strokeWidth="1.5" opacity="0.5">
      <animate attributeName="r" values="10;13;10" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="75" r="5" fill="#C8FF5A" />
    <text x="50" y="78" textAnchor="middle" fontSize="6" fill="#000" fontWeight="800" fontFamily="monospace">P1</text>
    <circle cx="150" cy="75" r="10" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5">
      <animate attributeName="r" values="13;10;13" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="150" cy="75" r="5" fill="#3B82F6" />
    <text x="150" y="78" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="800" fontFamily="monospace">P2</text>
    <text x="100" y="122" textAnchor="middle" fontSize="13" fill="#C8FF5A" fontWeight="800" fontFamily="monospace" letterSpacing="2">VS</text>
    <circle cx="40" cy="42" r="1.5" fill="#C8FF5A">
      <animate attributeName="cy" values="42;36;42" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="160" cy="105" r="1.5" fill="#3B82F6">
      <animate attributeName="cy" values="105;112;105" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="135" cy="35" r="1" fill="#fff">
      <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const EnergyTowerSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-full max-w-[340px] aspect-[4/3]">
    <defs>
      <linearGradient id="towerGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#1a1a1a" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#C8FF5A" />
      </linearGradient>
      <pattern id="towerDot" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#ffffff06" />
      </pattern>
    </defs>
    <rect width="200" height="150" fill="url(#towerDot)" />
    <rect x="88" y="30" width="24" height="100" rx="12" fill="url(#towerGrad)" opacity="0.15" />
    <rect x="92" y="30" width="16" height="100" rx="8" fill="url(#towerGrad)" opacity="0.3" />
    <rect x="96" y="30" width="8" height="100" rx="4" fill="url(#towerGrad)" opacity="0.8">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
    </rect>
    <line x1="80" y1="130" x2="120" y2="130" stroke="#ffffff20" strokeWidth="0.5" />
    <line x1="80" y1="100" x2="82" y2="100" stroke="#ffffff15" strokeWidth="0.5" />
    <line x1="82" y1="65" x2="80" y2="65" stroke="#ffffff15" strokeWidth="0.5" />
    <line x1="80" y1="45" x2="82" y2="45" stroke="#ffffff15" strokeWidth="0.5" />
    <line x1="120" y1="100" x2="118" y2="100" stroke="#ffffff15" strokeWidth="0.5" />
    <line x1="118" y1="65" x2="120" y2="65" stroke="#ffffff15" strokeWidth="0.5" />
    <line x1="120" y1="45" x2="118" y2="45" stroke="#ffffff15" strokeWidth="0.5" />
    <text x="100" y="46" textAnchor="middle" fontSize="11" fill="#C8FF5A" fontWeight="700">★</text>
    <circle cx="100" cy="48" r="8" fill="none" stroke="#C8FF5A" strokeWidth="0.8" opacity="0.4">
      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="105" r="5" fill="#F59E0B" opacity="0.9" />
    <circle cx="100" cy="70" r="5" fill="#3B82F6" opacity="0.9" />
    <circle cx="100" cy="48" r="4" fill="#C8FF5A" opacity="0.9" />
    <text x="100" y="108" textAnchor="middle" fontSize="5" fill="#fff" fontWeight="700" fontFamily="monospace">3</text>
    <text x="100" y="73" textAnchor="middle" fontSize="5" fill="#fff" fontWeight="700" fontFamily="monospace">2</text>
    <text x="100" y="51" textAnchor="middle" fontSize="4" fill="#000" fontWeight="700" fontFamily="monospace">1</text>
    <circle cx="35" cy="90" r="1.5" fill="#C8FF5A">
      <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="165" cy="55" r="1" fill="#3B82F6">
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const ConstellationSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-full max-w-[340px] aspect-[4/3]">
    <defs>
      <radialGradient id="starGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#C8FF5A" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#C8FF5A" stopOpacity="0" />
      </radialGradient>
      <pattern id="constDot" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.4" fill="#ffffff06" />
      </pattern>
    </defs>
    <rect width="200" height="150" fill="url(#constDot)" />
    <g>
      <line x1="100" y1="32" x2="148" y2="54" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="0s" repeatCount="indefinite" />
      </line>
      <line x1="148" y1="54" x2="148" y2="96" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="0.3s" repeatCount="indefinite" />
      </line>
      <line x1="148" y1="96" x2="100" y2="118" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="0.6s" repeatCount="indefinite" />
      </line>
      <line x1="100" y1="118" x2="52" y2="96" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="0.9s" repeatCount="indefinite" />
      </line>
      <line x1="52" y1="96" x2="52" y2="54" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="1.2s" repeatCount="indefinite" />
      </line>
      <line x1="52" y1="54" x2="100" y2="32" stroke="#ffffff12" strokeWidth="0.6">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="100" y1="32" x2="100" y2="118" stroke="#ffffff10" strokeWidth="0.4" strokeDasharray="3 4" />
      <line x1="148" y1="54" x2="52" y2="96" stroke="#ffffff08" strokeWidth="0.3" strokeDasharray="2 5" />
      <line x1="148" y1="96" x2="52" y2="54" stroke="#ffffff08" strokeWidth="0.3" strokeDasharray="2 5" />
    </g>
    <circle cx="52" cy="54" r="3" fill="#3B82F6" opacity="0.6" />
    <circle cx="148" cy="54" r="3" fill="#F59E0B" opacity="0.6" />
    <circle cx="148" cy="96" r="3" fill="#EF4444" opacity="0.6" />
    <circle cx="52" cy="96" r="3" fill="#fff" opacity="0.4" />
    <circle cx="100" cy="32" r="3" fill="#C8FF5A" opacity="0.8" />
    <circle cx="100" cy="118" r="3" fill="#C8FF5A" opacity="0.5" />
    <circle cx="100" cy="75" r="16" fill="url(#starGlow)" />
    <circle cx="100" cy="75" r="6" fill="#C8FF5A">
      <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="100" y="78" textAnchor="middle" fontSize="6" fill="#000" fontWeight="800" fontFamily="monospace">YOU</text>
  </svg>
);

const ScanChoiceSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-full max-w-[340px] aspect-[4/3]">
    <defs>
      <pattern id="scanDot" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.4" fill="#ffffff06" />
      </pattern>
      <linearGradient id="scanLineGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C8FF5A" stopOpacity="0" />
        <stop offset="50%" stopColor="#C8FF5A" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#C8FF5A" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="200" height="150" fill="url(#scanDot)" />
    <circle cx="55" cy="68" r="22" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
    <circle cx="55" cy="68" r="16" fill="#3B82F6" opacity="0.1" />
    <text x="55" y="72" textAnchor="middle" fontSize="14" fill="#3B82F6" fontWeight="700" fontFamily="monospace">∞</text>
    <rect x="128" y="42" width="38" height="52" rx="6" fill="none" stroke="#C8FF5A" strokeWidth="1.5" opacity="0.5" />
    <rect x="133" y="47" width="28" height="34" rx="3" fill="#C8FF5A" opacity="0.08" />
    <rect x="133" y="47" width="28" height="12" rx="3" fill="#C8FF5A" opacity="0.15" />
    <circle cx="147" cy="53" r="2" fill="#C8FF5A" opacity="0.5" />
    <circle cx="140" cy="62" r="1.5" fill="#C8FF5A" opacity="0.3" />
    <circle cx="155" cy="67" r="1.5" fill="#C8FF5A" opacity="0.3" />
    <rect x="133" y="85" width="28" height="4" rx="2" fill="#C8FF5A" opacity="0.25" />
    <g>
      <rect x="92" y="20" width="16" height="110" fill="url(#scanLineGrad)" opacity="0.15" />
      <rect x="99" y="20" width="2" height="110" fill="#C8FF5A" opacity="0.6">
        <animate attributeName="y" values="10;130;10" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
      </rect>
    </g>
    <text x="100" y="142" textAnchor="middle" fontSize="11" fill="#C8FF5A" fontWeight="800" fontFamily="monospace" letterSpacing="2">VS</text>
    <circle cx="30" cy="40" r="1" fill="#fff">
      <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="170" cy="110" r="1" fill="#fff">
      <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="60" y="105" textAnchor="middle" fontSize="4" fill="#ffffff20" fontFamily="monospace">BRAIN</text>
    <text x="147" y="100" textAnchor="middle" fontSize="4" fill="#ffffff20" fontFamily="monospace">PHONE</text>
  </svg>
);

const PANELS = [
  { headline: "Duel to Begin", subtitle: "Real-time battles in math, memory & logic.", Hero: RadarDuelSVG },
  { headline: "Win to Rise", subtitle: "Earn rating. Climb the leaderboard.", Hero: EnergyTowerSVG },
  { headline: "Leagues and Ranks", subtitle: "Rise up based on playtime and skill level.", Hero: ConstellationSVG },
  { headline: "Rip Doomscrolling", subtitle: "Choose brain-stimulating play.", Hero: ScanChoiceSVG },
];

type Props = { onPanelChange: (index: number) => void };

export function StepWelcome({ onPanelChange }: Props) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [offsetPct, setOffsetPct] = useState(0);
  const [transition, setTransition] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDiff = useRef(0);
  const isDragging = useRef(false);
  const containerWidth = useRef(1);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goToPanelRef = useRef<(i: number) => void>(() => {});

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const goToPanel = useCallback((i: number) => {
    const target = Math.max(0, Math.min(i, PANELS.length - 1));
    setPanelIndex(target);
    onPanelChange(target);
    setTransition(true);
    setOffsetPct(-target * 100);
    clearAutoTimer();
    if (target < PANELS.length - 1) {
      autoTimerRef.current = setTimeout(() => goToPanelRef.current(target + 1), 2500);
    }
  }, [onPanelChange, clearAutoTimer]);

  goToPanelRef.current = goToPanel;

  useEffect(() => {
    goToPanelRef.current(0);
    return clearAutoTimer;
  }, [clearAutoTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    containerWidth.current = containerRef.current?.offsetWidth || 1;
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchDiff.current = 0;
    setTransition(false);
    clearAutoTimer();
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl w-full"
      style={{ touchAction: "pan-y" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(${offsetPct}%)`,
          transition: transition ? "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
        }}
      >
        {PANELS.map((panel, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 flex flex-col items-center gap-2 py-2 px-2 select-none"
            data-step-el
          >
            <panel.Hero />
            <h2 className="text-fluid-xl font-black text-foreground text-center uppercase tracking-wide">{panel.headline}</h2>
            <p className="text-[10px] text-muted-foreground/60 text-center max-w-xs uppercase tracking-[0.08em] leading-relaxed">{panel.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
