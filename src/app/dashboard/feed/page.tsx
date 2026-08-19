"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Search, Play, Clock, Sparkles, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { FEED_HERO, FEED_CATEGORIES, FEED_STORIES, FEED_VIDEOS } from "@/lib/mock/feed";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function FeedPage() {
  usePageMeta("Feed — Exam Arena");
  const firstName = useOnboardingStore((s) => s.firstName);
  const [activeCategory, setActiveCategory] = useState<string>("Explore");
  const scrollRef = useRef<HTMLDivElement>(null);

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const idx = parseInt(el.dataset.sectionIndex ?? "0", 10);
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: idx * 0.08, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const items = scrollRef.current.querySelectorAll<HTMLElement>("[data-feed-story]");
      if (items.length) {
        gsap.fromTo(items, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" });
      }
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen px-5 pt-6 pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div ref={headerRef}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Compass size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">FEED</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">Explore</h1>
            <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Discover tips and strategies</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-[#C7F252] to-[#A8D43A] text-[12px] font-black text-[#0A0C0A]">
            {(firstName?.[0] ?? "C").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div ref={animateSection} data-section-index="0" className="mt-4">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl px-4 py-3">
          <Search size={16} className="text-muted-foreground/50 shrink-0" />
          <span className="text-[12px] text-muted-foreground/50">Search topics, tips...</span>
        </div>
      </div>

      {/* Category chips */}
      <div ref={animateSection} data-section-index="1" className="mt-4 flex gap-5 overflow-x-auto pb-1 border-b border-white/[0.06] scrollbar-thin">
        {FEED_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "text-[10px] font-bold whitespace-nowrap pb-3 outline-none relative transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              activeCategory === cat ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {/* Hero card */}
        <div ref={animateSection} data-section-index="2" className="relative rounded-3xl overflow-hidden h-[160px]">
          <img
            src={FEED_HERO.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="relative h-full flex flex-col justify-between p-4">
            <div className="flex items-center gap-2 self-start">
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
                <Sparkles size={10} /> {FEED_HERO.badge}
              </span>
            </div>
            <p className="text-[12px] font-bold text-white leading-snug drop-shadow-md">
              {FEED_HERO.title}
            </p>
          </div>
        </div>

        {/* Study tips */}
        <div ref={animateSection} data-section-index="3">
          <h2 className="text-[13px] font-bold text-foreground mb-3">Study Tips</h2>
          <div ref={scrollRef} className="flex flex-col gap-3">
            {FEED_STORIES.map((story) => (
              <div
                key={story.id}
                data-feed-story
                className="flex items-center gap-3.5 rounded-3xl border border-white/[0.06] backdrop-blur-xl p-3.5 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
              >
                <img
                  src={story.thumbnailUrl}
                  alt=""
                  className="w-14 h-14 shrink-0 rounded-xl object-cover border border-white/[0.06]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground truncate">
                    {story.eyebrow}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 leading-relaxed">
                    {story.subtitle}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock size={9} className="text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/40 font-semibold">
                      {story.readTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy videos */}
        <div ref={animateSection} data-section-index="4">
          <h2 className="text-[13px] font-bold text-foreground mb-3">Strategy Videos</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {FEED_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="w-[120px] shrink-0 rounded-3xl overflow-hidden border border-white/[0.06] backdrop-blur-xl h-[150px] relative outline-none transition-all active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: GLASS_BG }}
              >
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 right-2">
                  <p className="text-[11px] font-bold text-white leading-snug drop-shadow-md">
                    {video.label}
                  </p>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="bg-gradient-to-r from-[#C7F252] to-[#A8D43A] px-1.5 py-0.5 rounded text-[8px] font-bold text-[#0A0C0A]">
                    {video.source}
                  </span>
                </div>
                <div className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                  <Play size={10} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
