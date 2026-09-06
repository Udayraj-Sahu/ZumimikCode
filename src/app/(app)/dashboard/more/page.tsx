"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MorePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/profile");
  }, [router]);

  return <div className="fixed inset-0 bg-background" />;
}
