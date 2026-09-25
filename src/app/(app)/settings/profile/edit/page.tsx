"use client";
import { PageContainer } from "@/components/ui/page-container";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Camera, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/hooks/queries/use-profile";
import { usePageMeta } from "@/hooks/use-page-meta";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
      router.push("/settings/profile");
    }, 800);
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full md:max-w-2xl">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3 max-[359px]:px-3">
          <User size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">PROFILE</span>
        </div>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Update your personal information</p>
      </div>

      <div className="mt-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-[28px] font-bold text-primary ring-2 ring-primary/20">
              {profile?.initials ?? "?"}
            </span>
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Camera size={14} />
            </span>
          </div>
          <p className="mt-3 text-micro text-muted-foreground/50">Tap the camera icon to change photo</p>
        </div>

        <div className="flex flex-col gap-5 max-[359px]:gap-4">
          <div>
            <label className="mb-1.5 block text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40 whitespace-nowrap">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl px-4 py-3.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary max-[359px]:px-3 max-[359px]:py-3"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40 whitespace-nowrap">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl px-4 py-3.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary max-[359px]:px-3 max-[359px]:py-3"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40 whitespace-nowrap">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl px-4 py-3.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary max-[359px]:px-3 max-[359px]:py-3"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className={cn(
            "mt-8 flex w-full items-center justify-center gap-2 rounded-3xl py-4 text-[13px] font-bold uppercase tracking-widest outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring max-[359px]:py-3 whitespace-nowrap",
            saved
              ? "bg-primary/30 text-primary/60 cursor-not-allowed"
              : "bg-cta text-[#0A0C0A] hover:opacity-90 active:scale-[0.98]",
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
    </PageContainer>
  );
}
