"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, BookOpen, GraduationCap, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicNode } from "@/lib/types/technique";
import PrerequisiteLock from "./prerequisite-lock";

const TYPE_STYLE: Record<
  string,
  { chip: string; icon: string; border: string; glow: string; bar: string }
> = {
  subject: {
    chip: "bg-primary/15 text-primary",
    icon: "text-primary",
    border: "border-primary/20",
    glow: "0 8px 30px -12px rgba(199,242,82,0.35)",
    bar: "bg-gradient-to-r from-primary to-[#a8e62e]",
  },
  topic: {
    chip: "bg-chart-3/15 text-chart-3",
    icon: "text-chart-3",
    border: "border-chart-3/20",
    glow: "0 8px 30px -12px rgba(34,211,238,0.3)",
    bar: "bg-gradient-to-r from-chart-3 to-[#38bdf8]",
  },
  subtopic: {
    chip: "bg-chart-4/15 text-chart-4",
    icon: "text-chart-4",
    border: "border-chart-4/20",
    glow: "0 8px 30px -12px rgba(167,139,250,0.3)",
    bar: "bg-gradient-to-r from-chart-4 to-[#a78bfa]",
  },
  technique: {
    chip: "bg-white/[0.08] text-foreground/80",
    icon: "text-chart-3",
    border: "border-white/[0.08]",
    glow: "0 8px 30px -12px rgba(255,255,255,0.12)",
    bar: "bg-white/[0.2]",
  },
};

function NodeCard({
  node,
  depth,
  expanded,
  isLocked,
  onToggle,
  masteredTechniqueIds,
  prerequisiteLabels,
}: {
  node: TopicNode;
  depth: number;
  expanded: boolean;
  isLocked: boolean;
  onToggle: () => void;
  masteredTechniqueIds: string[];
  prerequisiteLabels: Record<string, string>;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isTechnique = node.type === "technique";
  const style = TYPE_STYLE[node.type] ?? TYPE_STYLE.technique;
  const mastery = node.masteryLevel;

  const content = (
    <>
      <div
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.05]",
          style.chip,
        )}
      >
        {isTechnique ? (
          <BookOpen size={16} className={style.icon} />
        ) : (
          <GraduationCap size={16} className={style.icon} />
        )}
      </div>

      {isTechnique && node.techniqueId && !isLocked ? (
        <Link
          href={`/learn/technique/${node.techniqueId}`}
          className="flex-1 min-w-0 text-[14px] font-semibold text-foreground outline-none hover:text-primary active:text-primary focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {node.title}
        </Link>
      ) : (
        <span className="flex-1 min-w-0 text-[14px] font-semibold text-foreground">{node.title}</span>
      )}

      {mastery !== undefined && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full transition-all duration-700", style.bar)}
              style={{ width: `${Math.min(100, mastery)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold font-mono text-muted-foreground/60">{mastery}%</span>
        </div>
      )}

      {isTechnique && node.techniqueId && !isLocked && (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={12} className="ml-0.5" />
        </span>
      )}

      {hasChildren && (
        <button
          type="button"
          onClick={onToggle}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground/50 outline-none transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      {isLocked && <Lock size={13} className="shrink-0 text-muted-foreground/40" />}
    </>
  );

  return (
    <div className="relative">
      {hasChildren && (
        <span
          className="absolute left-[18px] top-full h-3 w-px bg-gradient-to-b from-white/[0.12] to-transparent"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl transition-all duration-200 hover:-translate-y-px active:translate-y-0",
          style.border,
          isLocked && "opacity-60",
          hasChildren && "cursor-pointer",
        )}
        style={{
          marginLeft: depth * 22,
          background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
          boxShadow: style.glow,
        }}
        onClick={hasChildren ? onToggle : undefined}
      >
        {content}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth = 0,
  masteredTechniqueIds,
  prerequisiteLabels,
}: {
  node: TopicNode;
  depth?: number;
  masteredTechniqueIds: string[];
  prerequisiteLabels: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isTechnique = node.type === "technique";
  const isLocked = isTechnique && !!node.techniqueId && !masteredTechniqueIds.includes(node.techniqueId);

  const toggle = useCallback(() => {
    if (hasChildren) setExpanded((e) => !e);
  }, [hasChildren]);

  return (
    <div className="relative">
      <NodeCard
        node={node}
        depth={depth}
        expanded={expanded}
        isLocked={isLocked}
        onToggle={toggle}
        masteredTechniqueIds={masteredTechniqueIds}
        prerequisiteLabels={prerequisiteLabels}
      />

      {isLocked && <PrerequisiteLock label={prerequisiteLabels[node.techniqueId!]} />}

      {hasChildren && expanded && (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              masteredTechniqueIds={masteredTechniqueIds}
              prerequisiteLabels={prerequisiteLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TopicTree({
  trees,
  isLoading,
  masteredTechniqueIds = [],
  prerequisiteLabels = {},
}: {
  trees: TopicNode[];
  isLoading: boolean;
  masteredTechniqueIds?: string[];
  prerequisiteLabels?: Record<string, string>;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-white/[0.06]"
            style={{ marginLeft: (i % 3) * 22, background: "rgba(255,255,255,0.04)" }}
          />
        ))}
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.08] backdrop-blur-xl p-10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
        <GraduationCap size={32} className="text-muted-foreground/30" />
        <p className="text-[14px] font-semibold text-muted-foreground">No subjects available yet</p>
        <p className="text-[12px] text-muted-foreground/50">Complete onboarding to unlock your exam&apos;s topic tree.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {trees.map((subject) => (
        <TreeNode
          key={subject.id}
          node={subject}
          depth={0}
          masteredTechniqueIds={masteredTechniqueIds}
          prerequisiteLabels={prerequisiteLabels}
        />
      ))}
    </div>
  );
}
