"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicNode } from "@/lib/types/technique";

const TYPE_META: Record<
  string,
  { color: string; softBg: string; label: string }
> = {
  subject: { color: "#C7F252", softBg: "rgba(199,242,82,0.14)", label: "Subject" },
  topic: { color: "#22D3EE", softBg: "rgba(34,211,238,0.14)", label: "Topic" },
  subtopic: { color: "#8B5CF6", softBg: "rgba(139,92,246,0.14)", label: "Subtopic" },
  technique: { color: "#F59E0B", softBg: "rgba(245,158,11,0.14)", label: "Technique" },
};

export function MindMap({
  tree,
  isLoading,
  focusNodeId,
}: {
  tree: TopicNode | null;
  isLoading: boolean;
  focusNodeId?: string;
}) {
  const router = useRouter();
  const [path, setPath] = useState<TopicNode[]>([]);
  const focus = path[path.length - 1];
  const root = tree ?? null;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const centerNode: TopicNode | null = focus ?? root;
  const children = centerNode?.children ?? [];

  useEffect(() => {
    setPath([]);
    setExpanded(new Set());
    if (!root || !focusNodeId) return;
    const ancestors = collectAncestors(root, focusNodeId);
    if (ancestors && ancestors.length > 1) {
      const parents = ancestors.slice(0, -1);
      setPath(parents);
      setExpanded(new Set(parents.map((n) => n.id)));
    }
  }, [tree, focusNodeId]);

  const handleNodeClick = (node: TopicNode) => {
    if (node.children && node.children.length > 0) {
      toggleExpanded(node.id);
    } else if (node.type === "technique" && node.techniqueId) {
      router.push(`/dashboard/technique/${node.techniqueId}`);
    }
  };

  return (
    <div className="relative w-full select-none">
      <div className="mb-3 flex items-center justify-center gap-2">
        <p className="text-micro font-medium text-muted-foreground/35">
          Tap a branch to expand or collapse its topics
        </p>
      </div>

      <div
        className="relative w-full overflow-x-auto rounded-[28px] border"
        style={{
          borderColor: "rgb(var(--glass) / 0.08)",
          background: "rgb(var(--glass) / 0.025)",
        }}
      >
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !centerNode ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
            <Layers size={30} className="text-muted-foreground/30" />
            <p className="text-[13px] font-semibold text-muted-foreground">No branches available yet</p>
          </div>
        ) : (
          <div className="relative px-4 pb-6">
            <div className="flex w-full flex-col pt-6">
              {path.length === 0 && root && root.children && root.children.length > 0 ? (
                <div className="flex flex-col">
                  <div className="relative ml-3">
                    <span className="absolute left-0 top-0 bottom-0 w-px bg-glass/[0.08]" />
                    {root.children.map((c) => (
                      <TreeChild key={c.id}>
                        {nodes(c, expanded, handleNodeClick, 1, focusNodeId)}
                      </TreeChild>
                    ))}
                  </div>
                </div>
              ) : (
                nodes(centerNode, expanded, handleNodeClick, 0, focusNodeId)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function collectAncestors(node: TopicNode, targetId: string, trail: TopicNode[] = []): TopicNode[] | null {
  if (node.id === targetId || node.slug === targetId) return [...trail, node];
  for (const c of node.children ?? []) {
    const found = collectAncestors(c, targetId, [...trail, node]);
    if (found) return found;
  }
  return null;
}

function nodes(
  root: TopicNode,
  expanded: Set<string>,
  onSelect: (node: TopicNode) => void,
  depth: number,
  focusNodeId?: string,
): React.ReactNode {
  const meta = TYPE_META[root.type] ?? TYPE_META.topic;
  const isOpen = expanded.has(root.id);
  const hasChildren = !!root.children && root.children.length > 0;

  const row = (
    <div key={`row-${root.id}`} className={cn("flex", depth === 0 && "justify-center")}>
      <BranchNode
        node={root}
        meta={meta}
        depth={depth}
        isOpen={isOpen}
        hasChildren={hasChildren}
        isFocus={root.id === focusNodeId}
        onSelect={() => onSelect(root)}
      />
    </div>
  );

  const childrenContent =
    hasChildren && isOpen ? (
      <AnimatePresence initial={false}>
        <motion.div
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative ml-3">
            <span className="absolute left-0 top-0 bottom-0 w-px bg-glass/[0.08]" />
            {root.children!.map((c) => (
              <TreeChild key={c.id}>{nodes(c, expanded, onSelect, depth + 1, focusNodeId)}</TreeChild>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    ) : null;

  return (
    <div key={root.id} className="relative flex flex-col">
      {row}
      {childrenContent}
    </div>
  );
}

function TreeChild({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-4">
      <span
        className="absolute left-0 top-0 h-[30px] w-4 border-b-2 rounded-bl-xl"
        style={{ borderColor: "rgb(var(--glass) / 0.14)" }}
      />
      {children}
    </div>
  );
}

function BranchNode({
  node,
  meta,
  depth,
  isOpen,
  hasChildren,
  isFocus,
  onSelect,
}: {
  node: TopicNode;
  meta: { color: string; softBg: string; label: string };
  depth: number;
  isOpen: boolean;
  hasChildren: boolean;
  isFocus: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative z-10 my-1.5 flex items-center gap-2.5 rounded-2xl border px-4 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-95",
          depth === 0
            ? "border-transparent bg-gradient-to-r from-[#C7F252] to-[#a8e62e] text-[#0A0C0A] shadow-[0_12px_40px_-14px_rgb(rgb(rgb(var(--primary))))]"
            : "bg-glass/[0.05]",
          isFocus ? "ring-2 ring-primary ring-offset-1 ring-offset-transparent" : "",
        )}
        style={
          depth === 0
            ? undefined
            : { borderColor: `${meta.color}33`, boxShadow: `0 8px 28px -16px ${meta.color}66` }
        }
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl",
            depth === 0 ? "bg-[#0A0C0A]/10" : "",
          )}
          style={depth === 0 ? undefined : { background: meta.softBg, color: meta.color }}
        >
          {node.type === "technique" ? (
            <BookOpen size={15} />
          ) : (
            <Layers size={15} />
          )}
        </span>
        <span className="min-w-0 text-left">
          <span
            className={cn(
              "block max-w-[150px] truncate text-[13px] font-semibold leading-tight",
              depth === 0 ? "text-[#0A0C0A]" : "text-foreground",
            )}
          >
            {node.title}
          </span>
          <span
            className={cn(
              "block text-[9px] font-medium uppercase tracking-wider",
              depth === 0 ? "text-[#0A0C0A]/60" : "",
            )}
            style={depth === 0 ? undefined : { color: meta.color }}
          >
            {meta.label}
            {hasChildren ? ` Â· ${node.children!.length}` : ""}
          </span>
        </span>
        {hasChildren && (
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full transition-transform duration-200",
              isOpen ? "rotate-180" : "",
              depth === 0 ? "bg-[#0A0C0A]/10 text-[#0A0C0A]" : "bg-glass/[0.06] text-muted-foreground",
            )}
          >
            <ChevronDown size={12} />
          </span>
        )}
      </button>
    </div>
  );
}
