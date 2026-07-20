"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicNode } from "@/lib/types/technique";
import PrerequisiteLock from "./prerequisite-lock";

const TYPE_COLORS: Record<string, string> = {
  subject: "text-primary",
  topic: "text-chart-3",
  subtopic: "text-chart-4",
  technique: "text-foreground",
};

const TYPE_BG: Record<string, string> = {
  subject: "bg-primary/5 border-primary/10",
  topic: "bg-chart-3/5 border-chart-3/10",
  subtopic: "bg-chart-4/5 border-chart-4/10",
  technique: "bg-card border-border/40",
};

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
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all hover:brightness-110 active:brightness-125 cursor-pointer",
          TYPE_BG[node.type],
          isLocked && "opacity-60",
        )}
        style={{ marginLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={toggle}
            className="grid size-11 shrink-0 place-items-center rounded text-muted-foreground outline-none hover:bg-muted active:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        ) : (
          <span className="size-11 shrink-0" />
        )}

        {isTechnique ? (
          <BookOpen size={15} className="shrink-0 text-chart-3" />
        ) : (
          <GraduationCap size={15} className={cn("shrink-0", TYPE_COLORS[node.type])} />
        )}

        {isTechnique && node.techniqueId && !isLocked ? (
          <Link
            href={`/dashboard/technique/${node.techniqueId}`}
            className="flex-1 text-fluid-sm font-semibold text-foreground outline-none hover:text-primary active:text-primary focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-2 min-h-[44px] flex items-center"
          >
            {node.title}
          </Link>
        ) : (
          <span className="flex-1 text-fluid-sm font-semibold text-foreground">{node.title}</span>
        )}

        {node.masteryLevel !== undefined && (
          <span className="text-fluid-xs font-mono text-muted-foreground/50">{node.masteryLevel}%</span>
        )}
      </div>

      {isLocked && (
        <PrerequisiteLock label={prerequisiteLabels[node.techniqueId!]} />
      )}

      {hasChildren && expanded && (
        <div className="mt-1 flex flex-col gap-1">
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
          <div key={i} className="h-12 rounded-lg bg-card" style={{ marginLeft: (i % 3) * 16 }} />
        ))}
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/40 bg-card/50 p-8 text-center">
        <GraduationCap size={32} className="text-muted-foreground/30" />
        <p className="text-fluid-sm font-semibold text-muted-foreground">No subjects available yet</p>
        <p className="text-fluid-xs text-muted-foreground/50">Complete onboarding to unlock your exam&apos;s topic tree.</p>
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
