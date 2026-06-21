"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ChevronLeft, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/hooks/queries/use-profile";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function EditProfilePage() {
  usePageMeta("Edit Profile — Exam Arena");
  const router = useRouter();
  const { data } = useProfileData();
  const profile = data?.profile;

  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState("user@examarena.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [saved, setSaved] = useState(false);

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      router.push("/dashboard/profile");
    }, 800);
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div ref={headerRef} className="px-4 pt-5 pb-4 border-b border-border text-center">
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60 mb-1">EXAM ARENA</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => { if (window.history.length > 1) router.back(); else router.push("/dashboard/profile"); }}
            className="grid size-11 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground active:text-foreground active:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-fluid-xl font-black tracking-tight text-foreground">Edit Profile</h1>
        </div>
      </div>

      <div className="px-4 mt-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-fluid-3xl font-black text-primary ring-2 ring-primary/20">
              {profile?.initials ?? "?"}
            </span>
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Camera size={14} />
            </span>
          </div>
          <p className="mt-3 text-fluid-xs text-muted-foreground/50">Tap the camera icon to change photo</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className={cn(
            "mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-fluid-base font-bold uppercase tracking-widest outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
            saved
              ? "bg-primary/30 text-primary/60 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
          )}
        >
          {saved ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
