"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect customers to products page
    router.push("/products");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-charcoal-300">Redirecting...</p>
    </div>
  );
}
