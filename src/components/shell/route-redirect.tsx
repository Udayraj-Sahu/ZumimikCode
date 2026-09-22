"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RouteRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return <div className="fixed inset-0 bg-background" />;
}