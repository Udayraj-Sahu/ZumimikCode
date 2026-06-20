"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { X, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/mock/dashboard";

const SIDEBAR_SECTIONS = Object.entries(
  NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    const section = item.section ?? "";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {}),
);

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && overlayRef.current && sheetRef.current) {
      gsap.set(sheetRef.current, { y: "100%" });
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.to(sheetRef.current, { y: "0%", duration: 0.3, ease: "power3.out" });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="relative w-full max-h-[85vh] rounded-t-2xl bg-sidebar border-t border-sidebar-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
              <Flame size={12} />
            </span>
            <span className="text-fluid-sm font-black tracking-[0.1em] text-primary">
              EXAM ARENA
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground/50 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav sections */}
        <div className="px-3 pt-2 pb-6 flex flex-col gap-0.5">
          {SIDEBAR_SECTIONS.map(([section, items], sectionIndex) => (
            <Fragment key={section}>
              {sectionIndex > 0 && (
                <div className="my-2 mx-2 border-t border-sidebar-border" />
              )}
              <div>
                <p className="mb-1.5 px-3 text-fluid-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                  {section}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-fluid-sm font-bold tracking-[0.08em]">
                          {item.label}
                        </span>
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
