"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BundlesPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/stacks");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-charcoal-300">Redirecting...</p>
    </div>
  );
}
